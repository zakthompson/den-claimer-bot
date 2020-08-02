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
  const nickname = displayName(message.guild.member(message.author));
  const description = claims.length
    ? getClaimStrings(message, claims, includeUser).join('\n')
    : 'There are no claims!';

  embed.setTitle(title);
  embed.setDescription(description);
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
    .collation({ locale: 'en_US', numericOrdering: true })
    .toArray();
  const embed = createClaimsEmbed(
    message,
    'All Claimed Dens',
    serverClaims,
    false,
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
