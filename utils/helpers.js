const { MessageEmbed, Util } = require('discord.js');
const db = require('../db');

const claimToKey = (claim) => {
  const { type, den, age, version } = claim;
  return `**${type === 'Square' ? '■' : '★'} Den ${den} ${age} (${version})**`;
};

const getClaimStrings = (message, claims, includeUser) => {
  const dens = [...new Set(claims.map((claim) => claimToKey(claim)))];

  if (includeUser) {
    return dens.map((den) => {
      const userIds = claims
        .filter((claim) => den === claimToKey(claim))
        .map((claim) => claim.userId);
      const users = userIds.map((id) =>
        Util.escapeMarkdown(message.guild.member(id).displayName),
      );
      return `${den}\n${users.map((user) => `_${user}_`).join('\n')}\n`;
    });
  }

  return dens;
};

const createClaimsEmbed = (
  message,
  title,
  claims,
  includeUser = false,
  includeFooter = true,
) => {
  const embed = new MessageEmbed();
  const nickname = message.guild.member(message.author).displayName;

  embed.setTitle(title);
  embed.setDescription(
    claims.length
      ? getClaimStrings(message, claims, includeUser).join('\n')
      : 'There are no claims!',
  );
  if (includeFooter) embed.setFooter(`Requested by ${nickname}`);
  embed.setColor('cccfe0');

  return embed;
};

const updateChannelClaims = async (message) => {
  const claimsCollection = db.current.collection('claims');
  const pins = db.current.collection('pins');
  const serverId = message.guild.id;
  const channelId = message.channel.id;
  const serverClaims = await claimsCollection
    .find({
      serverId,
    })
    .sort({ den: 1 })
    .toArray();
  const embed = createClaimsEmbed(
    message,
    'All Claimed Dens',
    serverClaims,
    true,
    false,
  );
  const channelPin = await pins.findOne({ serverId, channelId });

  if (channelPin) {
    const { messageId } = channelPin;
    const oldMessage = await message.channel.messages.fetch(messageId);
    return oldMessage.edit(embed);
  }

  const newMessage = await message.channel.send(embed);
  pins.insertOne({ serverId, channelId, messageId: newMessage.id });
  return newMessage.pin();
};

module.exports = {
  getClaimStrings,
  createClaimsEmbed,
  updateChannelClaims,
};
