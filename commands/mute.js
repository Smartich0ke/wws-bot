const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');
const { userNotFoundError, invalidUserError, muteBotMisshap, muteSelfMisshap } = require('../errors.js');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('mute')
			.setDescription('Disables a users voice and message activity. Default time is 15 minutes.')
			.addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
			.addIntegerOption(option => option.setName('seconds').setDescription('The amount of seconds to mute the user for').setRequired(false))
			.addIntegerOption(option => option.setName('minutes').setDescription('The amount of minutes to mute the user for').setRequired(false))
			.addIntegerOption(option => option.setName('hours').setDescription('The amount of hours to mute the user for').setRequired(false))
			.addIntegerOption(option => option.setName('days').setDescription('The amount of days to mute the user for').setRequired(false))
			.addIntegerOption(option => option.setName('weeks').setDescription('The amount of weeks to mute the user for').setRequired(false))
			.addStringOption(option => option.setName('reason').setDescription('The reason for muting the user').setRequired(false))
			.setDefaultMemberPermissions(1099511627776),

	async execute(interaction) {
		interaction.deferReply();
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				if (member.id === interaction.user.id) {
					interaction.editReply({ content: muteSelfMisshap, ephemeral: true });
				}
				else if (member.id === clientId) {
					interaction.editReply({ content: muteBotMisshap, ephemeral: true });
				}
				else {
					const muteEmbed = new EmbedBuilder()
						.setTitle("You have been muted")
						.setDescription("You have been muted in the server **Willunga Waldorf High School**")
						.setColor(0xfbb739)
						.setFooter({text: 'Infraction ID: #1234'})
						.addFields({ name: 'Moderator', value: interaction.user.tag });
					if(reason){
						muteEmbed.addFields({ name: 'Reason', value: reason });
					}
					else {
						muteEmbed.addFields({ name: 'Reason', value: '*none specified*' });
					}
					user
						.createDM()
						.then((channel) => {
							channel
								.send({ embeds: [muteEmbed] })
								.then(() => {
											const infraction = Infraction.build({
												user: user.id,
												infraction_type: 'mute',
												reason: reason,
											});
											const seconds = interaction.options.getInteger('seconds');
											const minutes = interaction.options.getInteger('minutes');
											const hours = interaction.options.getInteger('hours');
											const days = interaction.options.getInteger('days');
											const weeks = interaction.options.getInteger('weeks');
											var totalTime = seconds + ((minutes * 60) + (hours * 3600) + (days * 86400) + (weeks * 604800) * 1000);
											if (seconds && minutes && hours && days && weeks === null || 0) {
												totalTime = 900;
											}
											member.timeout(totalTime, reason)
											.then(() => {
												console.log('Timed user out for ' + totalTime + ' seconds.')
											})
											.catch(console.error);
											infraction.save();
											muteEmbed
												.setTitle('User muted')
												.setDescription('User **' + user.tag + '** was issued a mute.');
											interaction.editReply({ embeds: [muteEmbed] });	
								});
						})
						.catch(err => {
							interaction.editReply({ content: 'An internal error occurred.', ephemeral: true });
							console.error(err);
						});
				}
			} else {
				interaction.reply({ embeds: [userNotFoundError], ephemeral: true });
			}
		} else {
			interaction.reply({ content: [invalidUserError], ephemeral: true });
		}
	},
};