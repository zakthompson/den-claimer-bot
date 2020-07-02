const db = require('../db');
const { updateChannelClaims, createClaimsEmbed } = require('../utils/helpers');

module.exports = {
  name: 'claim',
  description: 'Claim a den. Assumes adults, star and Sword by default.',
  arguments: '<denNum> [b|babies] [sq|square] [sh|shield]',
  async execute(prefix, message, args) {
    const claims = db.current.collection('claims');
    const serverId = message.guild.id;

    // Only await messages from the user triggering this command
    const filter = (m) => m.author.id === message.author.id;

    // Find den number among arguments
    const denStr = args.find((arg) => parseInt(arg, 10));
    if (!denStr) {
      return message.reply("you didn't provide a den number! Claim cancelled.");
    }

    // Get number instead of string
    const den = parseInt(denStr, 10);

    // Find other identifiers
    const age = args.find((arg) => arg[0] === 'b') ? 'Babies' : 'Adults';
    const type = args.find((arg) => arg.toLowerCase().startsWith('sq'))
      ? 'Square'
      : 'Star';
    const version = args.find((arg) => arg.toLowerCase().startsWith('sh'))
      ? 'Shield'
      : 'Sword';

    const existingClaims = await claims
      .find({
        den,
        serverId,
      })
      .toArray();
    if (existingClaims.length) {
      message.reply(
        'the following claims already exist for that den. Do you wish to continue? (yes/no)',
        createClaimsEmbed(
          message,
          `Claims On Den ${den}`,
          existingClaims,
          true,
          false,
        ),
      );
      const collected = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 15000,
      });
      if (collected.first().content.toLowerCase()[0] !== 'y') {
        return message.channel.send('Claim cancelled.');
      }
    }

    message.reply(
      `you are claiming **${
        type === 'Square' ? '■' : '★'
      } Den ${den} ${age} (${version})**, correct? (yes/no)`,
    );
    const collected = await message.channel.awaitMessages(filter, {
      max: 1,
      time: 15000,
    });
    if (collected.first().content.toLowerCase()[0] === 'y') {
      await claims.insertOne({
        den,
        age,
        type,
        version,
        serverId,
        userId: message.author.id,
        createdAt: message.createdAt,
      });
      updateChannelClaims(message);
      return message.channel.send('Den claimed!');
    }
    return message.channel.send(
      'Your claim has been cancelled - please try again!',
    );
  },
};
