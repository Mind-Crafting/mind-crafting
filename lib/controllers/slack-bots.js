const { Router } = require('express');
const mineflayer = require('mineflayer');

const { WebClient } = require('@slack/web-api');
const slackBot = new WebClient(process.env.SLACK_BOT_AUTH);

const Library = require('../models/Library');

const Bots = new Library();

module.exports = Router()
  .post('/', async(req, res, next) => {
    const isVerification = !!req.body.challenge;
    if(isVerification) res.send({ challenge: req.body.challenge });

    const isBot = req.body.event.user === 'U01JRUK5VCK';
    const isEcho = req.body.event.text.split(' ')[1] === 'echo';
    const isSay = req.body.event.text.split(' ')[1] === 'say';
    // Play Controls
    const isPlay = req.body.event.text.split(' ')[1] === 'play';
    const isDisconnect = req.body.event.text.split(' ')[1] === 'disconnect';
    // Movement Controls
    const moveForward = req.body.event.text.split(' ')[1] === 'forward';
    const moveBackward = req.body.event.text.split(' ')[1] === 'backward';

    if(!isBot && isEcho) {
      slackBot
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

    if(!isBot && isPlay) {
      const slackId = req.body.event.user;

      try {
        Bots.create(slackId);
        res.send({ message: 'Bot logged in!' });
      }
      
      catch(err) {
        slackBot
          .chat
          .postMessage({
            channel: 'general',
            text: err.message
          });

        next(err);
      }
    }

    if(!isBot && isDisconnect) {
      const slackId = req.body.event.user;

      Bots.disconnect(slackId);

      res.send({ message: 'Bot logged out!' });
    }

    if(!isBot && moveForward) {
      const slackId = req.body.event.user;

      try {
        const player = Bots.find(slackId);
        player.setControlState('forward', true);
        setTimeout(() => player.setControlState('forward', false), 247);
        res.sendStatus(200);
      }
      
      catch(err) {
        slackBot
          .chat
          .postMessage({
            channel: 'general',
            text: err.message
          });

        next(err);
      }
    }

    if(!isBot && moveBackward) {
      const slackId = req.body.event.user;

      try {
        const player = Bots.find(slackId);
        player.setControlState('backward', true);
        setTimeout(() => player.setControlState('backward', false), 247);
        res.sendStatus(200);
      }
      
      catch(err) {
        slackBot
          .chat
          .postMessage({
            channel: 'general',
            text: err.message
          });

        next(err);
      }
    }
  });
