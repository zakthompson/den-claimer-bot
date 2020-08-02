const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows this message.',
  arguments: '',
  execute(prefix, message) {
    const { commands } = message.client;
    const embed = new MessageEmbed();

    embed.setTitle('Den Claimer Help');
    embed.setDescription(
      "Below you'll find each supported command along with its **<required>** and **[optional]** arguments.\n\nNote that the _order_ of the arguments does not matter!",
    );
    embed.setColor('cccfe0');

    commands.forEach((command) => {
      embed.addField(
        `${prefix}${command.name} ${command.arguments}`,
        command.description,
      );
    });
    return message.channel.send(embed);
  },
};
