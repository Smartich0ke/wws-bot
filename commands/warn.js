const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');
const { userNotFoundError, invalidUserError, warnBotMisshap, warnSelfMisshap } = require('../errors.js');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('warn')
			.setDescription('Warns a user.')
			.addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
			.addStringOption(option => option.setName('reason').setDescription('The reason for warning the user').setRequired(false))
			.setDefaultMemberPermissions(1099511627776),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				if (member.id === interaction.user.id) {
					interaction.reply({ content: [warnSelfMisshap], ephemeral: true });
				}
				else if (member.id === clientId) {
					interaction.reply({ content: [warnBotMisshap], ephemeral: true });
				}
				else {
					const warnEmbed = new EmbedBuilder()
						.setTitle("You have been warned")
						.setDescription("You have received a warning from the server **Willunga Waldorf High School**")
						.setColor(0xfbb739)
						.setTimestamp()
						.setFooter({text: 'Infraction ID: #1234'})
						.addFields({ name: 'Moderator', value: interaction.user.tag });
					if(reason){
						warnEmbed.addFields({ name: 'Reason', value: reason });
					}
					else {
						warnEmbed.addFields({ name: 'Reason', value: '*none specified*' });
					}
					user
						.createDM()
						.then((channel) => {
							channel
								.send({ embeds: [warnEmbed] })
								.then(() => {
											const infraction = Infraction.build({
												user: user.id,
												infraction_type: 'warn',
												reason: reason,
											});
											infraction.save();
											warnEmbed
												.setTitle('User Warned')
												.setDescription('User **' + user.tag + '** was issued a warning.');
											interaction.reply({ embeds: [warnEmbed] });	
								});
						})
						.catch(err => {
							interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
							console.error(err);
						});
				}
			} else {
				interaction.reply({ embeds: [userNotFoundError], ephemeral: true });
			}
		} else {
			interaction.reply({ embeds: [invalidUserError], ephemeral: true });
		}
	},
};