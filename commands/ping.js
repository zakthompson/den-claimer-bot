module.exports = {
  name: 'ping',
  description:
    'Responds with "Pong!" - useful for making sure the bot is working!',
  arguments: '',
  execute(prefix, message) {
    message.channel.send('Pong!');
  },
};
