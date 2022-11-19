const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, Collection, Events, GatewayIntentBits, User, ModalBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, TextInputBuilder } = require('discord.js');
const { token, dbType, dbHost, dbPort, dbName, dbUser, dbPassword, dbQueryLogging, managementRoles, quoteModerationChannel, quoteChannel, electiveRoles, guildId } = require('./config.json');
const { generalError, permissionsError } = require('./errors.js');
const { Logger } = require('artichokes-logger');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const logger = new Logger();
module.exports.logger = logger;

logger.info('Connecting to database...');
module.exports.connection = new Sequelize(dbName, dbUser, dbPassword, {
	host: dbHost,
	port: dbPort,
	dialect: dbType,
	logging: dbQueryLogging,

});

const Infraction = require('./models/Infraction.js');
const Quote = require('./models/Quote');
logger.info('Loaded ORM models.');

logger.info('Loading commands...');
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		logger.warn(`Command ${file} is missing either a "data" or "execute" property.`);
	}
	logger.info('Loaded command ' + file);
}
logger.info('Commands loaded!', true);


client.once(Events.ClientReady, () => {
	logger.info('WWS-Bot is ready. Logged in as: ' + client.user.tag, true);
});

function isAdministrator(member) {
	let hasPermission = false;
	for (let i = 0; i <= managementRoles.length; i++) {
		if (member.roles.cache.some(role => role.name === managementRoles[i])) {
			hasPermission = true;
			break;
		}
	}
	return hasPermission;
}

client.on(Events.InteractionCreate, async interaction => {
	/*
	 *--------------------------------------------------
	 * EVENTS
	 * -------------------------------------------------
	 * All events are handled here.
	 */

	////////////////////
	//MODAL HANDLING: //
	////////////////////
	if (interaction.isModalSubmit()) {

		//Quote submission:
		if(interaction.customId === 'submit_quote_modal'){
			const quote = interaction.fields.getTextInputValue('quote_body');
			const quoteAuthor = interaction.fields.getTextInputValue('quote_author');
			let fullQuote = quote;
			if(quoteAuthor){
				fullQuote += `\n\n*- ${quoteAuthor}*`;
			}
			const quoteRecord = Quote.build({
				user: interaction.user.id,
				quote: quote,
				author: quoteAuthor,
				approvals: 0,
			});
			quoteRecord.save();
			const channel = client.channels.cache.get(quoteModerationChannel);
			const embed = new EmbedBuilder()
			.setTitle('Quote submission')
			.setDescription(fullQuote)
			.setAuthor({ name: 'from ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
			.setColor(0xfbb739);

			const approveButton = new ButtonBuilder()
			.setLabel('Approve')
			.setStyle('Success')
			.setCustomId('approve_quote');

			const denyButton = new ButtonBuilder()
			.setLabel('Deny')
			.setStyle('Danger')
			.setCustomId('deny_quote');

			const row = new ActionRowBuilder();
			row.addComponents(approveButton, denyButton);

			try {
				logger.interaction('Quote submitted by: ' + interaction.user.tag, 'modalSubmit');
				channel.send({embeds: [embed], components: [row]});
			}
			catch (error) {
				logger.error('WWS100: general error.', true);
				console.error(error);
				interaction.reply({ embeds: [generalError], ephemeral: true });
				return;
			}
			
			interaction.reply({ content: 'Quote submitted!', ephemeral: true });
		}

		//Infraction removal:
		if (interaction.customId.startsWith('remove_infraction')) {
			const sender = await interaction.user;
			const senderMember = await interaction.guild.members.cache.get(sender.id);
			const userMember = await interaction.guild.members.cache.get(interaction.customId.substring(18));

			if (isAdministrator(senderMember)) {
				const id = interaction.fields.getTextInputValue('infraction_id');
				const matchingInfractions = await Infraction.findAll({
					where: {
						id: id,
						user: userMember.id
					}
				});
				if (matchingInfractions.length > 0) {
					await Infraction.destroy({
						where: {
							id: id,
							user: userMember.id
						}
					});
					const infractions = await Infraction.findAll({
						where: {
							user: userMember.id
						}
					});
					const clearOneButton = new ButtonBuilder();
					clearOneButton
						.setCustomId('clear_infractions_one:' + userMember.id)
						.setLabel('Clear an infraction...')
						.setStyle('Primary');
					const clearAllButton = new ButtonBuilder();
					clearAllButton
						.setCustomId('clear_infractions_all:' + userMember.id)
						.setLabel('Clear all infractions')
						.setStyle('Danger');
					const row = new ActionRowBuilder()
						.addComponents(clearAllButton)
						.addComponents(clearOneButton);
					const tag = userMember.user.tag;
					const icon = userMember.user.displayAvatarURL();
					const listEmbed = new EmbedBuilder();
					listEmbed
						.setAuthor({ name: tag, iconURL: icon })
						.setTitle('All Infractions');
					if (infractions.length > 0) {
						for (let i = 0; i < infractions.length; i++) {
							if (i === 23) {
								listEmbed.addFields({ name: '+' + (infractions.length - i) + ' more...', value: '*Only 24 infractions can be displayed in this message.*' });
								break;
							}
							if (infractions[i].get('reason') == null) {
								listEmbed.addFields({ name: '#' + infractions[i].get('id').toString() + ' - **' + infractions[i].get('infraction_type') + '**', value: '*no reason specified*', inline: false });
							}
							else {
								listEmbed.addFields({ name: '#' + infractions[i].get('id').toString() + ' - **' + infractions[i].get('infraction_type') + '**', value: infractions[i].get('reason'), inline: false });
							}
	
						}
					}
					else {
						listEmbed.setDescription('*No infractions found for ' + tag + '*');
					}
					logger.interaction('Infraction #' + id + ' for: ' + tag + 'removed by: ' + sender.tag, 'modalSubmit');
					interaction.update({ embeds: [listEmbed], components: [row] });
				}
				else {
					const errorEmbed = new EmbedBuilder();
					errorEmbed
						.setTitle('Error')
						.setDescription('An infraction with that ID was not found for ' + userMember.user.tag);
					interaction.reply({ embeds: [errorEmbed], ephemeral: true });
				}
			}
			else {
				interaction.reply({ content: [permissionsError], ephemeral: true });
			}
		}
	}


	////////////////////
	//BUTTON HANDLING://
	////////////////////
	if (interaction.isButton()) {

		//Approve quote:
		if (interaction.customId === 'approve_quote') {
			const quote = interaction.message.embeds[0].description;
			const channel = client.channels.cache.get(quoteChannel);
			const quoteEmbed = new EmbedBuilder()
			.setAuthor({ name: interaction.message.embeds[0].author.name, iconURL: interaction.message.embeds[0].author.iconURL })
			.setDescription(quote)
			.setColor(0xfbb739);
			channel.send({embeds: [quoteEmbed]});
			interaction.update({ content: 'Quote approved!', components: [] });
			logger.interaction('Quote approved: ' + quote + ' by: ' + interaction.user.id , 'button');
		}

		//Deny quote:
		if (interaction.customId === 'deny_quote') {
			interaction.update({ content: 'Quote denied.', components: [] });
			logger.interaction('Quote denied: ' + interaction.message.embeds[0].description + ' by: ' + interaction.user.id , 'button');
		}

		//Clear ALL infractions:
		if (interaction.customId.startsWith('clear_infractions_all')) {
			if(isAdministrator(interaction.member)) {
				await Infraction.destroy({
					where: {
						user: interaction.customId.substring(22),
					}
				});
				const user = await client.users.fetch(interaction.customId.substring(22));
				const clearEmbed = new EmbedBuilder();
				clearEmbed.setTitle('All infractions cleared');
				clearEmbed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });
				await interaction.update({ embeds: [clearEmbed], components: [] });
				logger.interaction('All infractions cleared for: ' + user.tag + ' by: ' + interaction.user.tag, 'button');
			}
			else {
				interaction.reply({ embeds: [permissionsError], ephemeral: true });
			}
		}

		//Clear ONE infraction:
		if (interaction.customId.startsWith('clear_infractions_one')) {
			const modal = new ModalBuilder()
				.setCustomId('remove_infraction:' + interaction.customId.substring(22))
				.setTitle('Remove an infraction');
			const IDinput = new TextInputBuilder()
				.setCustomId('infraction_id')
				.setLabel("Infraction ID")
				.setPlaceholder("Enter the ID of the infraction you want to clear")
				.setStyle('Short');

			const firstActionRow = new ActionRowBuilder().addComponents(IDinput);
			modal.addComponents(firstActionRow);
			await interaction.showModal(modal);
			logger.interaction('Modal opened to remove infraction for: ' + interaction.customId.substring(22) + ' by: ' + interaction.user.tag, 'button');
		}

		//Submit quote:
		if(interaction.customId.startsWith('submit_quote')) {
				const modal = new ModalBuilder()
				.setCustomId('submit_quote_modal')
				.setTitle('Submit a quote');
				
			const quoteInput = new TextInputBuilder()
				.setCustomId('quote_body')
				.setRequired(true)
				.setMaxLength(255)
				.setStyle('Paragraph')
				.setLabel('Quote');
			const authorInput = new TextInputBuilder()
				.setCustomId('quote_author')
				.setRequired(false)
				.setMaxLength(100)
				.setStyle('Short')
				.setLabel('Author (Optional)');
			const firstActionRow = new ActionRowBuilder().addComponents(quoteInput);
			const secondActionRow = new ActionRowBuilder().addComponents(authorInput);
			modal.addComponents(firstActionRow, secondActionRow);
			console.log('here');
			await interaction.showModal(modal);
			logger.interaction('Modal opened to submit quote by: ' + interaction.user.tag, 'button');
		}
	}


	////////////////////////////
	//SELECTION MENU HANDLING://
	////////////////////////////
	if(interaction.isSelectMenu()) {

		//Elective selection menu:
		if(interaction.customId === 'elective_selection_menu') {
			const selected = interaction.values[0];
			const user = await client.users.fetch(interaction.user.id);
			const member = await interaction.guild.members.fetch(user);
			const electives = new Map(Object.entries(electiveRoles));
			const electiveRole = await client.guilds.cache.get(guildId).roles.fetch(electives.get(selected)).catch(console.error);
			electives.forEach(async (value, key) => {
				const role = await client.guilds.cache.get(guildId).roles.fetch(value);
				if(role) {
				if(member.roles.cache.has(role.id)) {
					member.roles.remove(role);
				}
			}
			});
			member.roles.add(electiveRole);
			interaction.reply({ content: 'You have been assigned the ' + electiveRole.name + ' role.', ephemeral: true });
		}
	}
	////////////////////////
	//CHAT INPUT HANDLING://
	////////////////////////
	if (!interaction.isChatInputCommand()) return;
 
	/////////////////////
	//COMMAND HANDLING://
	/////////////////////
	const command = client.commands.get(interaction.commandName);

	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ embeds: [generalError] , ephemeral: true });
	}
});


client.login(token);
module.exports.client = client;