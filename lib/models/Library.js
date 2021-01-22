const mineflayer = require('mineflayer');
const viewer = require('prismarine-viewer').mineflayer;

module.exports = class Library {
  bots;
  ports;
  gamemodes;
  adminBot;
  oneBlock = 231.5;

  constructor() {
    this.bots = [];
    this.ports = [3000, 3001];
    this.gamemodes = [
      { name: 'Maze One', playArgument: 'maze-one' },
      { name: 'Maze Two', playArgument: 'maze-two' },
      { name: 'PvP', playArgument: 'pvp' }
    ]
    this.adminBot = mineflayer.createBot({
      host: process.env.SERVER_IP,
      port: '25565',
      username: 'AdminBot',
      password: ''
    });
  }

  create(slackId) {
    const botExists = this.bots.find(bot => bot.username === slackId);
    if(botExists) throw new Error('Bot already exists!');

    const player = mineflayer.createBot({
      host: process.env.SERVER_IP,
      port: '25565',
      username: slackId,
      password: ''
    });

    player.on('end', () => this.removeBot(player.username));
    player.on('forcedMove', () => player.clearControlStates());

    this.bots.push(player);

    return player;
  }

  find(slackId) {
    const player = this.bots.find(bot => bot.username === slackId);

    if(!player) throw new Error('Player not found!')

    return player;
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
      this.adminBot.chat(`${player.username} logged in!`);
      this.adminBot.chat(`/say ${player.username} logged in!`);
      this.adminBot.chat(`/op ${player.username}`);
      const port = this.getFreePort();
      player.viewerPort = port;
      viewer(player, { firstPerson: true, port });
    });
  }

  botFindGamemode(player, gamemodeCommand) {
    player.once('spawn', () => {
      player.chat('/kill');

      let itemFrame;
      
      try {
        itemFrame = this.getGamemodeEntity(player, gamemodeCommand);
      }

      catch(err) {
        slackBot
          .chat
          .postMessage({
            channel: 'general',
            text: err.message
          });
      }

      const timeout = this.oneBlock * (this.getDistance(player.entity, itemFrame) + 1);

      setTimeout(() => player.lookAt(itemFrame.position, false, () => {
        player.setControlState('forward', true)
        setTimeout(() => player.setControlState('forward', false), timeout)
      }), 3000);
    })
  }

  getFreePort = () => {
    if(!this.bots.length) return this.ports[0];

    const takenPorts = this.bots.map(bot => bot.viewerPort);

    const port = this.ports.filter(port => !takenPorts.includes(port))[0];

    if(!port) throw new Error('No available player slots!');

    return port;
  };

  getGamemodeEntity = (player, argument) => {
    const { entities } = player;
    const gamemode = this.gamemodes
      .find(mode => mode.playArgument === argument)

    if(!gamemode) throw new Error('No such gamemode!')

    const extractGamemode = itemFrame => {
      const { text } = JSON.parse(itemFrame.metadata[7].nbtData.value.display.value.Name.value);

      return text;
    }
    
    const itemFrame = Object
      .keys(entities)
      .filter(key => entities[key].name === 'item_frame')
      .map(key => {
        return {
          ...entities[key],
          gamemode: extractGamemode(entities[key])
        }
      })
      .find(frame => frame.gamemode === gamemode.name)

    if(!itemFrame) throw new Error('Couldn\'t find gamemode entity... Seek help!');

    itemFrame.position.x += 0.5;
    itemFrame.position.z += 0.5;

    return itemFrame;
  }

  getDistance = (entityOne, entityTwo) => {
    const { position: posOne } = entityOne;
    const { position: posTwo } = entityTwo;
    
    return Math.sqrt(
      (posOne.x - posTwo.x) ** 2 +
      (posOne.z - posTwo.z) ** 2
    )
  }
};
