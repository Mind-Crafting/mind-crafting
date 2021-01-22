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
    ],
    this.adminBot = mineflayer.createBot({
      host: process.env.SERVER_IP,
      port: '25565',
      username: 'AdminBot',
      password: ''
    });
  }

  // Creates a usable bot in-game
  create(slackId) {
    // Checks if you already have a bot with the same slackId
    const botExists = this.bots.find(bot => bot.username === slackId);
    if(botExists) throw new Error('Bot already exists!');

    // Creates a playable bot with the username of the users slackId
    const player = mineflayer.createBot({
      host: process.env.SERVER_IP,
      port: '25565',
      username: slackId,
      password: ''
    });

    // Removes the bots from this.bots if the connetion is ended
    player.on('end', () => this.removeBot(player.username));

    // Listens to whenever the bot gets moved using commands
    player.on('forcedMove', () => player.clearControlStates());

    this.bots.push(player);

    return player;
  }

  // Finds a bot with the said slackId
  find(slackId) {
    const player = this.bots.find(bot => bot.username === slackId);

    if(!player) throw new Error('Player not found!');

    return player;
  }

  // Finds bot in this.bots and end its connection to the server
  disconnect(slackId) {
    const bot = this.find(slackId);

    bot.end();

    return slackId;
  }

  // Removes a bot object from this.bots
  removeBot(slackId) {
    const bot = this.find(slackId);

    const index = this.bots.indexOf(bot);
    if(index > -1) this.bots.splice(index, 1);

    return slackId;
  }

  // Creates a prismarine-viewer (bot viewer)
  makeViewer(player) {
    player.once('spawn', () => {
      const port = this.getFreePort();
      player.viewerPort = port;
      viewer(player, { firstPerson: true, port });
    });
  }

  // Moves the bot to the correct in-game position
  botFindGamemode(player, gamemodeCommand) {
    player.once('spawn', () => {
      this.adminBot.chat(`${player.username} logged in!`);
      this.adminBot.chat(`/op ${player.username}`);
      player.chat('/kill');

      let itemFrame,
        timeout;

      // Stores the correct entity in the item frame variable
      try {
        itemFrame = this.getGamemodeEntity(player, gamemodeCommand);
        timeout = this.oneBlock * (this.getDistance(player.entity, itemFrame) + 1);
      }

      catch(err) {
        slackBot
          .chat
          .postMessage({
            channel: 'general',
            text: err.message
          });
      }

      // Makes the bot to position itself to face the correct entity automatically
      setTimeout(() => player.lookAt(itemFrame.position, false, () => {
        player.setControlState('forward', true);
        setTimeout(() => player.setControlState('forward', false), timeout);
      }), 3000);
    });
  }

  // Finds a non-occupied viewer port and returns it
  getFreePort = () => {
    if(!this.bots.length) return this.ports[0];

    const takenPorts = this.bots.map(bot => bot.viewerPort);

    const port = this.ports.filter(port => !takenPorts.includes(port))[0];

    if(!port) throw new Error('No available player slots!');

    return port;
  };

  // Gets the entity object corresponding to the player selected gamemode
  getGamemodeEntity = (player, argument) => {
    const { entities } = player;

    // Grabs the player argument from this.gamemodes
    const gamemode = this.gamemodes
      .find(mode => mode.playArgument === argument);

    if(!gamemode) throw new Error('No such gamemode!');

    // Gets the name of the item displayed in item frames
    // Item frames are non rendered on viewer
    const extractGamemode = itemFrame => {
      const { text } = JSON.parse(itemFrame.metadata[7].nbtData.value.display.value.Name.value);

      return text;
    };
    
    // Looks for all entities around the bot, then filters for entities with the name of item frame
    const itemFrame = Object
      .keys(entities)
      .filter(key => entities[key].name === 'item_frame')
      .map(key => {
        return {
          ...entities[key],
          gamemode: extractGamemode(entities[key])
        };
      })
      .find(frame => frame.gamemode === gamemode.name);

    if(!itemFrame) throw new Error('Couldn\'t find gamemode entity... Seek help!');

    // Bot and item frame interaction so bot can find its way to the correct gamemode
    itemFrame.position.x += 0.5;
    itemFrame.position.z += 0.5;

    return itemFrame;
  }

  // Gets the distance between entity objects

  getDistance = (entityOne, entityTwo) => {
    const { position: posOne } = entityOne;
    const { position: posTwo } = entityTwo;
    
    return Math.sqrt(
      (posOne.x - posTwo.x) ** 2 +
      (posOne.z - posTwo.z) ** 2
    );
  }
};
