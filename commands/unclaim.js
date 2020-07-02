const db = require('../db');
const { updateChannelClaims } = require('../utils/helpers');

module.exports = {
  name: 'unclaim',
  description:
    "Unclaim all claimed dens, or a specific den if you've claimed multiple.",
  arguments: '[denNum]',
  async execute(prefix, message, args) {
    const claims = db.current.collection('claims');
    const serverId = message.guild.id;
    const userId = message.author.id;

    // Find den number among arguments
    const denStr = args.find((arg) => parseInt(arg, 10));
    if (!denStr) {
      await claims.deleteMany({ serverId, userId });
      updateChannelClaims(message);
      return message.channel.send('All of your claims have been removed!');
    }

    const den = parseInt(denStr, 10);
    const existingClaims = await claims
      .find({ serverId, userId, den })
      .toArray();
    if (existingClaims.length) {
      await claims.deleteMany({ serverId, userId, den });
      updateChannelClaims(message);
      return message.channel.send(`Removed your claim to den ${denStr}!`);
    }
    return message.channel.send("You don't have any claims on that den!");
  },
};
