const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { client } = require('../index.js');
const { generalError, userNotFoundError, invalidUserError } = require('../errors.js');

module.exports = {
	data: 
		new SlashCommandBuilder()
			.setName('send-setup-message')
			.setDescription('sends a setup message')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The type of message to send')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Quote submission', value: 'quote_submission' },
                    ))
			.addChannelOption(option => option.setName('channel').setDescription('The channel to send the message in').setRequired(false))
			.setDefaultMemberPermissions(2),

	async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        let channelToSend = interaction.channel;
        if(channel){
            channelToSend = channel;
        }
        const embed = new EmbedBuilder()
        .setTitle('Quote submission')
        .setDescription('Click the button below to submit a quote that will appear in the #quotes channel.')
        .setColor(0xfbb739);
    
         const submitQuoteButton = new ButtonBuilder()
        .setLabel('Submit a quote')
        .setStyle('Primary')
        .setCustomId('submit_quote');
    
        const row = new ActionRowBuilder();
        row.addComponents(submitQuoteButton);

        channelToSend.send({ embeds: [embed], components: [row] });

	},
};