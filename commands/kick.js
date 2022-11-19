const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');
const { generalError, userNotFoundError, invalidUserError, kickBotMisshap, kickSelfMisshap } = require('../errors.js');
const { logger } = require('../index.js');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('kick')
			.setDescription('Kicks a user from the server.')
			.addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user').setRequired(false))
			.setDefaultMemberPermissions(2),

	async execute(interaction) {
		logger.interaction('Executing command /kick for: ' + interaction.user.tag, "COMMAND");
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				if (member.id === interaction.user.id) {
					interaction.reply({ content: kickSelfMisshap, ephemeral: true });
				}
				else if (member.id === clientId) {
					interaction.reply({ content: kickBotMisshap, ephemeral: true });
				}
				else {
					const kickEmbed = new EmbedBuilder()
						.setTitle("You have been kicked")
						.setDescription("You have been kicked from the server **Willunga Waldorf High School**")
						.setColor(0xe0702e)
						.addFields({ name: 'Moderator', value: interaction.user.tag });
					if(reason){
						kickEmbed.addFields({ name: 'Reason', value: reason });
					}
					else {
						kickEmbed.addFields({ name: 'Reason', value: '*' });
					}
					user
						.createDM()
						.then((channel) => {
							channel
								.send({ embeds: [kickEmbed] })
								.then(() => {
									member
										.kick(reason)
										.then(() => {
											const infraction = Infraction.build({
												user: user.id,
												infraction_type: 'kick',
												reason: reason,
											});
											infraction.save();
											kickEmbed
												.setTitle('User Kicked')
												.setDescription('User **' + user.tag + '** was kicked from the server.');
											interaction.reply({ embeds: [kickEmbed] });
										});
								});
						})
						.catch(err => {
							interaction.reply({ content: [generalError], ephemeral: true });
							console.error(err);
						});
				}
			} else {
				interaction.reply({ content: [userNotFoundError], ephemeral: true });
			}
		} else {
			interaction.reply({ content: [invalidUserError], ephemeral: true });
		}
	},
};