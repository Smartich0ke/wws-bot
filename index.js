const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, Collection, Events, GatewayIntentBits, User, ModalBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { token, dbType, dbHost, dbPort, dbName, dbUser, dbPassword, dbQueryLogging } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports.connection = new Sequelize(dbName, dbUser, dbPassword, {
	host: dbHost,
	port: dbPort,
	dialect: dbType,
	logging: dbQueryLogging,

});
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, () => {
	console.info('WWS-Bot is ready. Logged in as: ' + client.user.tag);
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isButton()){
	interaction.reply(interaction.ge);
	}
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(token);
module.exports.client = client;