const mineflayer = require('mineflayer');
const viewer = require('prismarine-viewer').mineflayer;

module.exports = class Library {
  bots;
  ports;

  constructor() {
    this.bots = [];
    this.ports = [3000, 3001, 3002, 3003];
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

    this.bots.push(player);

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

  makeViewer(player) {
    player.once('spawn', () => {
      const port = this.getFreePort();
      player.viewerPort = port;
      viewer(player, { firstPerson: true, port });
    });
  }

  getFreePort = () => {
    if(!this.bots.length) return this.ports[0];

    const takenPorts = this.bots.map(bot => bot.viewerPort);

    const port = this.ports.filter(port => !takenPorts.includes(port))[0];

    if(!port) throw new Error('No available player slots!');

    return port;
  };
};
