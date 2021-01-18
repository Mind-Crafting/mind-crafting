const { Router } = require('express');
const mineflayer = require('mineflayer');

const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_AUTH);



module.exports = Router()
  .post('/', async(req, res, next) => {
    const isBot = req.body.event.user === 'U01JRUK5VCK';
    const isEcho = req.body.event.text.split(' ')[1] === 'echo';
    const isSay = req.body.event.text.split(' ')[1] === 'say';


    if(!isBot && isEcho) {
      web
        .chat
        .postMessage({
          channel: 'general',
          text: req.body.event.text.split(' ').slice(2).join(' ')
        })
        .then(() => res.send({ message: 'message sent!' }))
        .catch(next);
    }

    if(!isBot && isSay) {
      const message = req.body.event.text.split(' ').slice(2).join(' ');

      const bot = await mineflayer.createBot({
        host: process.env.SERVER_IP,
        port: '25565',
        username: 'EchoBot',
        password: ''
      });

      bot.on('spawn', () => {
        bot.chat(message);
        bot.end();
      });

      res.sendStatus(200);
    }
  });
