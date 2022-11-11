const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');

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
                const infractions = await Infraction.findAll();
                const listEmbed = new EmbedBuilder();
                listEmbed
                .setAuthor({ name: userTag,  iconURL: userImage })
                .setTitle('All Infractions');
                for (let i = 0; i < infractions.length; i++)  {
                    if(infractions[i].get('reason') == null) {
                        listEmbed.addFields({ name: '#' + infractions[i].get('id').toString() + ' - **' + infractions[i].get('infraction_type') + '**', value: '*no reason specified*', inline: false });
                    }
                    else {
                    listEmbed.addFields({ name: '#' + infractions[i].get('id').toString() + ' - **' + infractions[i].get('infraction_type') + '**', value: infractions[i].get('reason'), inline: false });
                    }
                }
                await interaction.reply({ embeds: [listEmbed] });
			} else {
				interaction.reply({ content: 'That user isnt in this guild!', ephemeral: true });
			}
		} else {
			interaction.reply({ content: 'You didnt specify a user.', ephemeral: true });
		}
	},
};