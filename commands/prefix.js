const db = require('../db');

module.exports = {
  name: 'prefix',
  description: 'Changes the prefix for this bot on this server.',
  arguments: '<newPrefix>',
  async execute(prefix, message, args) {
    const serverId = message.guild.id;
    const prefixes = db.current.collection('prefixes');
    const existingPrefix = await prefixes.findOne({ serverId });
    if (existingPrefix) {
      prefixes.deleteOne({ serverId });
    }

    await prefixes.insertOne({ serverId, prefix: args[0] });
    return message.channel.send('Prefix updated!');
  },
};
