const { MessageEmbed, Util } = require('discord.js');
const { format } = require('date-fns');
const db = require('../db');

const displayName = (user) => (user ? user.displayName : 'Missing User');

const claimToKey = (claim) => {
  const { type, den, age, version } = claim;
  return `**${type === 'Square' ? '■' : '★'} ${
    den === 'Promo' ? '' : 'Den '
  }${den} ${age} (${version})**`;
};

const getClaimStrings = (message, claims, includeUser) => {
  const dens = [...new Set(claims.map((claim) => claimToKey(claim)))];

  if (includeUser) {
    return dens.map((den) => {
      const userClaims = claims
        .filter((claim) => den === claimToKey(claim))
        .map((claim) => ({
          user: Util.escapeMarkdown(
            displayName(message.guild.member(claim.userId)),
          ),
          createdAt: claim.createdAt,
        }));
      return `${den}\n${userClaims
        .map(
          (userClaim) =>
            `${userClaim.user} _(${format(userClaim.createdAt, 'MMM d')})_`,
        )
        .join('\n')}\n`;
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
  const nickname = message.guild.member
    ? displayName(message.guild.member(message.author))
    : '';
  const description = claims.length
    ? getClaimStrings(message, claims, includeUser).join('\n')
    : 'There are no claims!';

  embed.setTitle(title);
  embed.setDescription(description);
  if (includeFooter) embed.setFooter(`Requested by ${nickname}`);
  embed.setColor('cccfe0');

  return embed;
};

const updateChannelClaims = async (message, client = null) => {
  const claimsCollection = db.current.collection('claims');
  const pins = db.current.collection('pins');
  const serverId = message.guild.id;
  const serverClaims = await claimsCollection
    .find({
      serverId,
    })
    .sort({ den: 1 })
    .collation({ locale: 'en_US', numericOrdering: true })
    .toArray();
  const embed = createClaimsEmbed(
    message,
    'All Claimed Dens',
    serverClaims,
    false,
    false,
  );
  const channelPin = await pins.findOne({ serverId });
  const messageId = channelPin ? channelPin.messageId : null;
  const channelId = channelPin ? channelPin.channelId : null;

  const channel =
    client && channelId
      ? client.channels.cache.get(channelId)
      : message.channel;

  if (channelPin) {
    const oldMessage = await channel.messages.fetch(messageId);
    return oldMessage.edit(embed);
  }

  const newMessage = await channel.send(embed);
  pins.insertOne({
    serverId,
    channelId: channel.id,
    messageId: newMessage.id,
  });
  return newMessage.pin();
};

module.exports = {
  claimToKey,
  getClaimStrings,
  createClaimsEmbed,
  updateChannelClaims,
};
