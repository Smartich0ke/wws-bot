const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');
const { generalError, userNotFoundError, invalidUserError, banBotMisshap, banSelfMisshap } = require('../errors.js');
const { logger } = require('../index.js');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('help')
			.setDescription('Returns a list of available commands'),

	async execute(interaction) {
        logger.interaction('Executing command /help for: ' + interaction.user.tag, "COMMAND");
        const helpEmbed = new EmbedBuilder()
            .setTitle('Available commands')
            .setDescription('List of available commands')
            .setColor(0x00ff00)
            .addFields(
                { name: '/help', value: 'Returns a list of available commands' },
                { name: '/ban', value: 'Bans a user from the server' },
                { name: '/kick', value: 'Kicks a user from the server' },
                { name: '/warn', value: 'Warns a user' },
                { name: '/mute', value: 'Mutes a user' },
                { name: '/unmute', value: 'Unmutes a user' },
                { name: '/list-infractions', value: 'Returns a list of all infractions for a user' },
                { name: '/clear', value: 'Clears a number of messages from a channel' },
                { name: '/joke <joke_type>', value: 'Returns a joke' },
            );
        interaction.reply({ embeds: [helpEmbed] });
	},
};