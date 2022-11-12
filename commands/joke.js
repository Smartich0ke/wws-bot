const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const Infraction = require(`../models/Infraction`);
const { clientId } = require('../config.json');
const axios = require("axios");

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('joke')
            .setDescription('Tells a joke')
            .addStringOption(option =>
                option.setName('joke_type')
                    .setDescription('The type of joke to tell')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Yo mama', value: 'yo_mama' },
                        { name: 'Dark', value: 'dark' },
                        { name: 'Programming', value: 'programming' },
                    )),
    async execute(interaction) {
        /*
         * --------------------------------------
         *  Yo Mama Jokes
         * --------------------------------------
         * Jokes are from api.yomomma.info
         * Yo mama jokes are a type of joke that are often told as a form of insult.
         */
        if (interaction.options.getString('joke_type') === 'yo_mama') {
            const options = {
                method: 'GET',
                url: 'https://api.yomomma.info',
            };
            axios.request(options).then(function (response) {
                const jokeEmbed = new EmbedBuilder()
                    .setTitle("Yo mama joke")
                    .setDescription(response.data.joke)
                    .setColor(0xfbb739)
                    .setTimestamp();
                interaction.reply({ embeds: [jokeEmbed] });
                return;
            }).catch(function (error) {
                interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
                console.error(error);
            });
        }
        /*
         * --------------------------------------
         *  Dark Jokes
         * --------------------------------------
         * Jokes are from jokeapi.dev
         * Dark jokes are a type of joke that are often told as a form of insult. 
         */
        if (interaction.options.getString('joke_type') === 'dark') {
            const options = {
                method: 'GET',
                url: 'https://v2.jokeapi.dev/joke/Dark',
            };
            axios.request(options).then(function (response) {
                const jokeEmbed = new EmbedBuilder();
                if (response.data.type === 'single') {
                    jokeEmbed
                        .setTitle("Dark Joke")
                        .setDescription(response.data.joke)
                        .setColor(0xfbb739)
                        .setTimestamp();
                }
                else {
                    jokeEmbed
                        .setTitle("Dark Joke")
                        .setDescription(response.data.setup + '\n' + response.data.delivery)
                        .setColor(0xfbb739)
                        .setTimestamp();
                }
                interaction.reply({ embeds: [jokeEmbed] });
            }).catch(function (error) {
                interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
                console.error(error);
            });
        }
        /*
         * --------------------------------------
         *  Programming Jokes
         * --------------------------------------
         * Jokes are from jokeapi.dev
         * Jokes that are only funny to programmers.
         */
        if (interaction.options.getString('joke_type') === 'programming') {
            const options = {
                method: 'GET',
                url: 'https://v2.jokeapi.dev/joke/Programming',
            };
            axios.request(options).then(function (response) {
                const jokeEmbed = new EmbedBuilder();
                if (response.data.type === 'single') {
                    jokeEmbed
                        .setTitle("Programming Joke")
                        .setDescription(response.data.joke)
                        .setColor(0xfbb739)
                        .setTimestamp();
                }
                else {
                    jokeEmbed
                        .setTitle("Programming Joke")
                        .setDescription(response.data.setup + '\n' + response.data.delivery)
                        .setColor(0xfbb739)
                        .setTimestamp();
                }
                interaction.reply({ embeds: [jokeEmbed] });
            }).catch(function (error) {
                interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
                console.error(error);
            });
        }
        /*
         * --------------------------------------
         *  Random Jokes
         * --------------------------------------
         * Jokes are from jokeapi.dev
         * Random joke from any category
         */
        if (interaction.options.getString('joke_type') == null) {
            const options = {
                method: 'GET',
                url: 'https://v2.jokeapi.dev/joke/Any',
            };
            axios.request(options).then(function (response) {
                const jokeEmbed = new EmbedBuilder();
                if (response.data.type === 'single') {
                    jokeEmbed
                        .setTitle("Random Joke")
                        .setDescription(response.data.joke)
                        .setColor(0xfbb739)
                        .setTimestamp();
                }
                else {
                    jokeEmbed
                        .setTitle("Random Joke")
                        .setDescription(response.data.setup + '\n' + response.data.delivery)
                        .setColor(0xfbb739)
                        .setTimestamp();
                }
                interaction.reply({ embeds: [jokeEmbed] });
            }).catch(function (error) {
                interaction.reply({ content: 'An internal error occurred.', ephemeral: true });
                console.error(error);
            });
        }
    },
};