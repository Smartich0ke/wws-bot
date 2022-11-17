const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { userNotFoundError, invalidUserError } = require('../errors.js');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('list-infractions')
            .setDescription('List a users infractions')
            .addUserOption(option => option.setName('user').setDescription('The user to list').setRequired(true))
            .setDefaultMemberPermissions(2),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (user) {
            const member = interaction.guild.members.cache.get(user.id);
            if (member) {
                const userId = user.id;
                const userImage = user.displayAvatarURL();
                const userTag = user.tag;
                const infractions = await Infraction.findAll({
                    where: {
                        user: userId
                    }
                });
                const clearOneButton = new ButtonBuilder();
                clearOneButton
                .setCustomId('clear_infractions_one:' + userId)
                .setLabel('Clear an infraction...') 
                .setStyle('Primary');
                const clearAllButton = new ButtonBuilder();
                clearAllButton
                    .setCustomId('clear_infractions_all:' + userId)
                    .setLabel('Clear all infractions')
                    .setStyle('Danger');
                const row = new ActionRowBuilder()
                    .addComponents(clearAllButton)
                    .addComponents(clearOneButton);
                const listEmbed = new EmbedBuilder();
                listEmbed
                    .setAuthor({ name: userTag, iconURL: userImage })
                    .setTitle('All Infractions');
                if (infractions.length > 0) {
                    for (let i = 0; i < infractions.length; i++) {
                        if (i === 23) {
                            listEmbed.addFields({name: '+' + (infractions.length - i) + ' more...', value: '*Only 24 infractions can be displayed in this message.*'});
                            break;
                        }
                            if (infractions[i].get('reason') == null) {
                                listEmbed.addFields({ name: '#' + infractions[i].get('id').toString() + ' - **' + infractions[i].get('infraction_type') + '**', value: '*no reason specified*', inline: false });
                            }
                            else {
                                listEmbed.addFields({ name: '#' + infractions[i].get('id').toString() + ' - **' + infractions[i].get('infraction_type') + '**', value: infractions[i].get('reason'), inline: false });
                            }
                        
                    }
                }
                else {
                    listEmbed.setDescription('*No infractions found for ' + userTag + '*');
                }
                await interaction.reply({ embeds: [listEmbed], components: [row] });
            } else {
                interaction.reply({ embeds: [userNotFoundError], ephemeral: true });
            }
        } else {
            interaction.reply({ embeds: [invalidUserError], ephemeral: true });
        }
    },
};