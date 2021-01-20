const mineflayer = require('mineflayer');
const viewer = require('prismarine-viewer').mineflayer;

module.exports = class Library {
  bots;

  constructor() {
    this.bots = [];
  }

  create(slackId) {
    const botExists = this.find(slackId);
    if(botExists) throw new Error('Bot already exists!');

    const player = mineflayer.createBot({
      host: process.env.SERVER_IP,
      port: '25565',
      username: slackId,
      password: ''
    });

    player.on('end', () => this.removeBot(player.username));
    player.on('spawn', () => {
      const { entities } = player;

      const itemFrames = Object.keys(entities).filter(key => entities[key].name === 'item_frame');

      console.log(itemFrames);
    });

    this.bots.push(player);

    if(this.bots.indexOf(player) === 0) viewer(player, { firstPerson: true, port: 3001 });

    return player;
  }

  find(slackId) {
    return this.bots.find(bot => bot.username === slackId);
  }

  disconnect(slackId) {
    const bot = this.find(slackId);

    bot.end();

    return slackId;
  }

  removeBot(slackId) {
    const bot = this.find(slackId);

    const index = this.bots.indexOf(bot);
    if(index > -1) this.bots.splice(index, 1);

    return slackId;
  }
};
