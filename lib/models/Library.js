const mineflayer = require('mineflayer');

module.exports = class Library {
  bots;

  constructor() {
    this.bots = [];
  }

  create(slackId) {
    const botExists = this.find(slackId);
    if(botExists) throw new Error('Bot already exists!');

    this.bots.push(
      mineflayer.createBot({
        host: process.env.SERVER_IP,
        port: '25565',
        username: slackId,
        password: ''
      })
    );
  }

  find(slackId) {
    return this.bots.find(bot => bot.username === slackId);
  }

  disconnect(slackId) {
    const bot = this.find(slackId);

    const index = this.bots.indexOf(bot);
    this.bots.splice(index, 1);

    bot.end();
  }
};
