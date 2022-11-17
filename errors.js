const { EmbedBuilder } = require('discord.js');
/*
 * --------------------------------------
 * Errors
 * --------------------------------------
 * These are the errors that can be thrown by the bot when something goes wrong.
 * They are organised by what number range they are in.
 * 
 */



/*
 * --------------------------------------
 * Error codes WWS100-199
 * --------------------------------------
 *  These are general errors that can be thrown by the bot.
 * 
 */
const generalError = new EmbedBuilder(); // WWS100
generalError
    .setTitle('General Error')
    .setDescription('An internal error has occurred. Please try again later. \n If this error persists, please contact the bot developer.')
    .setFooter({ text: 'Error code: WWS100' });

/*
 * --------------------------------------
 * Error codes WWS200-299
 * --------------------------------------
 * These are permissions errors that can be thrown by the bot.
 * Usually thrown when a user does not have the correct permissions to run a command.
 * 
 */
const permissionsError = new EmbedBuilder(); // WWS200
permissionsError
    .setTitle('Permissions Error')
    .setDescription('You do not have permission to perform this operation.')
    .setFooter({ text: 'Error code: WWS200' });

/*
 * --------------------------------------
 * Error codes WWS300-399
 * --------------------------------------
 * These errors are used when a specific symbol could not be found.
 * 
 */
const itemNotFoundError = new EmbedBuilder(); // WWS300
itemNotFoundError
    .setTitle('Item Not Found Error')
    .setDescription('The item you specified was not found.')
    .setFooter({ text: 'Error code: WWS300' });

const userNotFoundError = new EmbedBuilder(); // WWS301
userNotFoundError
    .setTitle('User Not Found Error')
    .setDescription('The user you specified was not found.')
    .setFooter({ text: 'Error code: WWS301' });

/*
 * --------------------------------------
 * Error codes WWS400-499
 * --------------------------------------
 * These are errors that can be thrown when a user does not pass the right information to the bot.
 * 
 */
const invalidArgumentError = new EmbedBuilder(); // WWS400
invalidArgumentError
    .setTitle('Invalid Argument Error')
    .setDescription('The argument you specified was invalid.')
    .setFooter({ text: 'Error code: WWS400' });

const invalidCommandError = new EmbedBuilder(); // WWS401
invalidCommandError
    .setTitle('Invalid Command Error')
    .setDescription('The command you specified was invalid.')
    .setFooter({ text: 'Error code: WWS401' });

const invalidChannelError = new EmbedBuilder(); // WWS402
invalidChannelError
    .setTitle('Invalid Channel Error')
    .setDescription('The channel you specified was invalid.')
    .setFooter({ text: 'Error code: WWS402' });

const invalidRoleError = new EmbedBuilder(); // WWS403
invalidRoleError
    .setTitle('Invalid Role Error')
    .setDescription('The role you specified was invalid.')
    .setFooter({ text: 'Error code: WWS403' });

const invalidUserError = new EmbedBuilder(); // WWS404
invalidUserError
    .setTitle('Invalid User Error')
    .setDescription('The user you specified was invalid.')
    .setFooter({ text: 'Error code: WWS404' });

const invalidNumberError = new EmbedBuilder(); // WWS405
invalidNumberError
    .setTitle('Invalid Number Error')
    .setDescription('The number you specified was invalid.')
    .setFooter({ text: 'Error code: WWS405' });

const invalidBooleanError = new EmbedBuilder(); // WWS406
invalidBooleanError
    .setTitle('Invalid Boolean Error')
    .setDescription('The boolean you specified was invalid.')
    .setFooter({ text: 'Error code: WWS406' });

module.exports = { generalError };