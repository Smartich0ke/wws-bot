const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, Collection, Events, GatewayIntentBits, User, ModalBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { token, dbType, dbHost, dbPort, dbName, dbUser, dbPassword, dbQueryLogging } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports.connection = new Sequelize(dbName, dbUser, dbPassword, {
	host: dbHost,
	port: dbPort,
	dialect: dbType,
	logging: dbQueryLogging,

});
client.commands = new Collection();
const Infraction = require('./models/Infraction');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data   .name, command);
	} else {
		console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, () => {
	console.info('WWS-Bot is ready. Logged in as: ' + client.user.tag);
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isButton()){
		if (interaction.customId.startsWith('clear_infractions_all')) {
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
		}
	}
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(token);
module.exports.client = client;