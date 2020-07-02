const { MessageEmbed, Util } = require('discord.js');
const db = require('../db');

const getClaimStrings = (message, claims, includeUser) =>
  claims.map((claim) => {
    const { den, type, age, version, userId } = claim;
    const user = Util.escapeMarkdown(message.guild.member(userId).displayName);
    return `**${
      type === 'Square' ? '■' : '★'
    } Den ${den} ${age} (${version})** ${
      includeUser ? `- _Claimed by ${user}_` : ''
    }`;
  });

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
