const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('discord.js');

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
                        { name: 'Elective Selection', value: 'elective_selection' },
                    ))
			.addChannelOption(option => option.setName('channel').setDescription('The channel to send the message in').setRequired(false))
			.setDefaultMemberPermissions(2),

	async execute(interaction) {
        if(interaction.options.getString('message') === 'quote_submission'){
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
        }
        if(interaction.options.getString('message') === 'elective_selection'){
            const channel = interaction.options.getChannel('channel');
            let channelToSend = interaction.channel;
            if(channel){
                channelToSend = channel;
            }
            const embed = new EmbedBuilder()
            .setTitle('Elective Selection')
            .setDescription('use the dropdown below to select your elective group.')
            .setColor(0xfbb739);
        
            const electiveSelection = new SelectMenuBuilder()
            .setCustomId('elective_selection_menu')
            .setPlaceholder('Select your elective group')
            .addOptions([
                { label: 'Art Elective', value: 'art_elective', description: ' ', emoji: { name: '🎨', } },
                { label: 'Music Elective', value: 'music_elective', description: ' ', emoji: { name: '🎼', } },
                { label: 'Drama Elective', value: 'drama_elective', description: ' ', emoji: { name: '🎭', } },
                { label: 'PE Elective', value: 'pe_elective', description: ' ', emoji: { name: '🏀', } },
                { label: 'Electronics Elective', value: 'electronics_elective', description: ' ', emoji: { name: '🖥️', } },
                { label: 'Spanish Elective', value: 'language_elective', description: ' ', emoji: { name: '🇪🇸', } },
                { label: 'Radio Elective', value: 'radio_elective', description: ' ', emoji: { name: '📻', } },
                { label: 'literature Elective', value: 'literature_elective', description: ' ', emoji: { name: '📚', } },
                { label: 'Cooking Elective', value: 'cooking_elective', description: ' ', emoji: { name: '👩🏽‍🍳', } }
            ]);

            const row = new ActionRowBuilder();
            row.addComponents(electiveSelection);
    
            channelToSend.send({ embeds: [embed], components: [row] });
        }

	},
};