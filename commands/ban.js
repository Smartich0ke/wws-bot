const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');
const { generalError, userNotFoundError, invalidUserError, banBotMisshap, banSelfMisshap } = require('../errors.js');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('ban')
			.setDescription('Bans a user from the server.')
			.addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('The reason for banning the user').setRequired(false))
			.setDefaultMemberPermissions(2),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				if (member.id === interaction.user.id) {
					interaction.reply({ content: banSelfMisshap, ephemeral: true });
				}
				else if (member.id === clientId) {
					interaction.reply({ content: banBotMisshap, ephemeral: true });
				}
				else {
					const banEmbed = new EmbedBuilder()
						.setTitle("You have been banned")
						.setDescription("You have been banned from the server **Willunga Waldorf High School**")
						.setColor(0xbb3727)
						.addFields({ name: 'Moderator', value: interaction.user.tag });
					if(reason){
						banEmbed.addFields({ name: 'Reason', value: reason });
					}
					else {
						banEmbed.addFields({ name: 'Reason', value: '*' });
					}
					user
						.createDM()
						.then((channel) => {
							channel
								.send({ embeds: [banEmbed] })
								.then(() => {
									member
										.ban({reason: reason})
										.then(() => {
											const infraction = Infraction.build({
												user: user.id,
												infraction_type: 'ban',
												reason: reason,
											});
											infraction.save();
											banEmbed
												.setTitle('User banned')
												.setDescription('User **' + user.tag + '** was banned from the server.');
											interaction.reply({ embeds: [banEmbed] });
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