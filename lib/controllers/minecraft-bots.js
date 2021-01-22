const { Router } = require('express');
const mineflayer = require('mineflayer');

module.exports = Router()

  .get('/', (req, res) => {

    let target = null;

    const bot = mineflayer.createBot({
      host: process.env.SERVER_IP,
      port: '25565',
      username: 'DoniBot',
      password: ''
    });

    bot.on('chat', (username, message) => {
      if (username === bot.username) return target = bot.players[username].entity
      let entity
      switch (message) {

        // Bot movement which are toggles

        case 'forward':
          bot.setControlState('forward', true);
          setTimeout(247);
          bot.setControlState('forward', false);
          break;
        // case 'forward-stop':
        //   bot.setControlState('forward', false);
        //   break;

        case 'back':
          bot.setControlState('back', true);
          break;
        case 'back-stop':
          bot.setControlState('back', false);
          break;

        case 'left':
          bot.setControlState('left', true);
          break;
        case 'left-stop':
          bot.setControlState('left', false);
          break;

        case 'right':
          bot.setControlState('right', true);
          break;
        case 'right-stop':
          bot.setControlState('right', false);
          break;

        case 'jump-on':
          bot.setControlState('jump', true);
          break;
        case 'jump-off':
          bot.setControlState('jump', false);
          break;

        // Bot movement single

        case 'jump':
          bot.setControlState('jump', true);
          bot.setControlState('jump', false);
          break;
        case 'attack':
          entity = bot.nearestEntity();
          if (entity) {
            bot.attack(entity, true);
          } else {
            bot.chat('no nearby entities');
          }
          break;
      }
    });
  });
