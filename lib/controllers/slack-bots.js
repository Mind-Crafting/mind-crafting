const { Router } = require('express');

const SlackService = require('../services/SlackService');

module.exports = Router()
  .post('/', async(req, res, next) => {
    const isVerification = !!req.body.challenge;
    if(isVerification) res.send({ challenge: req.body.challenge });

    const { event } = req.body;
    const response = SlackService.handler(event);
    if(response) res.send({ response });

    // if(!isBot && isSay) {
    //   const message = req.body.event.text.split(' ').slice(2).join(' ');

    //   const bot = await mineflayer.createBot({
    //     host: process.env.SERVER_IP,
    //     port: '25565',
    //     username: 'EchoBot',
    //     password: ''
    //   });

    //   bot.on('spawn', () => {
    //     bot.chat(message);
    //     bot.end();
    //   });

    //   res.sendStatus(200);
    // }

    next();
  });
