# Den Claimer Bot

A Discord bot to let Pokemon Sword &amp; Shield shiny raid hosts announce what den they're planning to host next!

It will keep a pretty ping of all dens currently being seeded and also let hosts know if the den they're about to hunt for is already claimed by another host.

## Invite Link

Interested in running this on your own server? [Click here to invite it!](https://discord.com/oauth2/authorize?client_id=725197682657853480&scope=bot&permissions=75776)

## Commands

The following are all the commands the bot supports, along with their **<required>** and **[optional]** arguments. The default prefix is `.`.

Note that the _order_ of the arguments does not matter!

`.help`
Shows a message with all of this information.

`.ping`
Responds with "Pong!" - useful for making sure the bot is working!

`.prefix <newPrefix>`
Changes the prefix for this bot on your server.

`.claim <denNum> [b|babies] [sq|square] [sh|shield]`
Claim a den. Assumes adults, star and Sword by default.

`unclaim [denNum]`
Unclaim all claimed dens, or a specific den if you've claimed multiple.

`check [denNum]`
Check your claims, or if a particular den is claimed by anyone.
