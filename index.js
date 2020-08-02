const Discord = require('discord.js');
const cron = require('node-cron');

const { defaultPrefix, token } = require('./config');
const commands = require('./commands');
const db = require('./db');
const purgeClaims = require('./tasks/purgeClaims');

const client = new Discord.Client();

client.commands = new Discord.Collection();

Object.keys(commands).forEach((key) => {
  const command = commands[key];

  client.commands.set(command.name, command);
});

client.on('message', async (message) => {
  if (message.guild) {
    const serverId = message.guild.id;
    const prefixes = db.current.collection('prefixes');
    const savedPrefix = await prefixes.findOne({ serverId });
    const prefix = savedPrefix ? savedPrefix.prefix : defaultPrefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
      command.execute(prefix, message, args);
    } catch (err) {
      console.error(err);
      message.channel.send(
        'Oops! It appears there was an error executing that command.',
      );
    }
  }
});

client.login(token);

cron.schedule('0 * * * *', purgeClaims.bind(null, client));
