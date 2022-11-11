const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('kick')
			.setDescription('Kicks a user from the server.')
			.addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user').setRequired(true))
			.setDefaultMemberPermissions(2),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				if (member.id === interaction.user.id) {
					interaction.reply({ content: "You can't kick yourself.", ephemeral: true });
				}
				else if (member.id === clientId) {
					interaction.reply({ content: "what are you doing. You can't kick the bot.", ephemeral: true });
				}
				else {
					const kickEmbed = new EmbedBuilder()
						.setTitle("You have been kicked")
						.setDescription("You have been kicked from the server **Willunga Waldorf High School**")
						.setColor(0xe0702e)
						.addFields(
							{ name: 'Reason', value: reason },
							{ name: 'Moderator', value: interaction.user.tag },
						);
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
							interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
							console.error(err);
						});
				}
			} else {
				interaction.reply({ content: 'That user isnt in this guild!', ephemeral: true });
			}
		} else {
			interaction.reply({ content: 'You didnt specify a user to kick.', ephemeral: true });
		}
	},
};