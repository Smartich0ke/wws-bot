const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user from the server.')
		.addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user').setRequired(false)),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		if (user) {
			const member = interaction.guild.members.cache.get(user.id);
			if (member) {
				member
					.kick(reason)
					.then(() => {
						interaction.reply(`Successfully kicked ${user.tag}` + (reason ? ` for: ${reason}` : ''));
					})
					.catch(err => {
						interaction.reply({ content: 'An internal error occurred. User was not kicked. (Does the bot have sufficient permissions?)', ephemeral: true });
						console.error(err);
					});
			} else {
				interaction.reply({ content: 'That user isnt in this guild!', ephemeral: true });
			}
		} else {
			interaction.reply({ content: 'You didnt specify a user to kick.', ephemeral: true });
		}
	},
};