const { Router } = require('express');
const mineflayer = require('mineflayer');

const { WebClient } = require('@slack/web-api');
const slackBot = new WebClient(process.env.SLACK_BOT_AUTH);

const Library = require('../models/Library');

const Bots = new Library();

const oneBlock = 231.6;

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
    const moveBack = req.body.event.text.split(' ')[1] === 'back';
    // Reversed due to Minecraft source code
    const moveRight = req.body.event.text.split(' ')[1] === 'left';
    const moveLeft = req.body.event.text.split(' ')[1] === 'right';

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
      const blocks = req.body.event.text.split(' ')[2] || 1;

      try {
        const player = Bots.find(slackId);
        player.setControlState('forward', true);
        setTimeout(() => player.setControlState('forward', false), oneBlock * blocks);
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

    if(!isBot && moveBack) {
      const slackId = req.body.event.user;
      const blocks = req.body.event.text.split(' ')[2] || 1;

      try {
        const player = Bots.find(slackId);
        player.setControlState('back', true);
        setTimeout(() => player.setControlState('back', false), oneBlock * blocks);
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

    if(!isBot && moveLeft) {
      const slackId = req.body.event.user;
      const blocks = req.body.event.text.split(' ')[2] || 1;

      try {
        const player = Bots.find(slackId);
        player.setControlState('left', true);
        setTimeout(() => player.setControlState('left', false), oneBlock * blocks);
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

    if(!isBot && moveRight) {
      const slackId = req.body.event.user;
      const blocks = req.body.event.text.split(' ')[2] || 1;

      try {
        const player = Bots.find(slackId);
        player.setControlState('right', true);
        setTimeout(() => player.setControlState('right', false), oneBlock * blocks);
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
