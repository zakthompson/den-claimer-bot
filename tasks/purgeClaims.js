const { MessageEmbed } = require('discord.js');
const db = require('../db');
const { updateChannelClaims, claimToKey } = require('../utils/helpers');

module.exports = async function purgeClaims(client) {
  try {
    const claims = db.current.collection('claims');
    const claimsToDelete = await claims
      .find({ expiry: { $lte: new Date() } })
      .toArray();

    claimsToDelete.forEach(async (claim) => {
      const server = await client.guilds.fetch(claim.serverId);
      const user = await server.members.fetch(claim.userId);
      if (user) {
        const embed = new MessageEmbed();
        embed.setTitle('Claim Expired!');
        embed.setDescription(
          `Your claim to **${claimToKey(
            claim,
          )}** is 7 days old and has been automatically removed.\n\nIf you intended to continue hosting this den, simply claim it again to hold on to it!`,
        );
        embed.setColor('cccfe0');
        user
          .send(embed)
          .catch(() => console.error(`Unable to DM user ${claim.userId}`));
      }
    });

    const serverIds = [
      ...new Set(claimsToDelete.map((claim) => claim.serverId)),
    ];

    await claims.deleteMany({
      expiry: { $lte: new Date() },
    });

    serverIds.forEach((serverId) => {
      updateChannelClaims({ guild: { id: serverId } }, client);
    });
  } catch (e) {
    console.error(e);
  }
};
