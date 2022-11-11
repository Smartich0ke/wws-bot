const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('ban')
			.setDescription('Bans a user from the server.')
			.addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('The reason for banning the user').setRequired(true))
			.setDefaultMemberPermissions(2),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				if (member.id === interaction.user.id) {
					interaction.reply({ content: "You can't ban yourself.", ephemeral: true });
				}
				else if (member.id === clientId) {
					interaction.reply({ content: "what on earth are you doing. You can't ban the bot.", ephemeral: true });
				}
				else {
					const banEmbed = new EmbedBuilder()
						.setTitle("You have been banned")
						.setDescription("You have been banned from the server **Willunga Waldorf High School**")
						.setColor(0xbb3727)
						.addFields(
							{ name: 'Reason', value: reason },
							{ name: 'Moderator', value: interaction.user.tag },
						);
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
							interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
							console.error(err);
						});
				}
			} else {
				interaction.reply({ content: 'That user isnt in this guild!', ephemeral: true });
			}
		} else {
			interaction.reply({ content: 'You didnt specify a user to ban.', ephemeral: true });
		}
	},
};