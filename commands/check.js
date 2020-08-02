const db = require('../db');
const { createClaimsEmbed } = require('../utils/helpers');

module.exports = {
  name: 'check',
  description:
    'Check your claims, or if a particular den is claimed by anyone.',
  arguments: '[denNum]',
  async execute(prefix, message, args) {
    const claims = db.current.collection('claims');
    const serverId = message.guild.id;
    const userId = message.author.id;
    const nickname = message.guild.member(message.author).displayName;

    // Find den number among arguments
    let denStr = args.find((arg) => arg.toLowerCase().startsWith('pr'))
      ? 'Promo'
      : null;
    denStr = denStr || args.find((arg) => parseInt(arg, 10));
    if (denStr) {
      const userClaims = await claims
        .find({ serverId, den: denStr })
        .sort({ den: 1 })
        .toArray();
      return message.channel.send(
        createClaimsEmbed(
          message,
          `Claims for ${denStr === 'Promo' ? '' : 'Den '}${denStr}`,
          userClaims,
          true,
        ),
      );
    }

    const userClaims = await claims
      .find({ serverId, userId })
      .sort({ den: 1 })
      .toArray();
    return message.channel.send(
      createClaimsEmbed(message, `${nickname}'s Claims`, userClaims),
    );
  },
};
