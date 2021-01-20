const { Router } = require('express');
const mineflayer = require('mineflayer');

const { WebClient } = require('@slack/web-api');
const slackBot = new WebClient(process.env.SLACK_BOT_AUTH);

const Library = require('../models/Library');
const SlackService = require('../services/SlackService');

const Bots = new Library();

const oneBlock = 231.6;

module.exports = Router()
  .post('/', async(req, res, next) => {
    const isVerification = !!req.body.challenge;
    if(isVerification) res.send({ challenge: req.body.challenge });

    const isBot = req.body.event.user === 'U01JRUK5VCK';
    // const isSay = req.body.event.text.split(' ')[1] === 'say';

    const lookRight = req.body.event.text.split(' ')[1] === 'lookright';
    const lookLeft = req.body.event.text.split(' ')[1] === 'lookleft';
    const lookUp = req.body.event.text.split(' ')[1] === 'lookup';
    const lookDown = req.body.event.text.split(' ')[1] === 'lookdown';



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

    if(!isBot && lookLeft) {
      const slackId = req.body.event.user;
      
      try {
        const player = Bots.find(slackId);
        const yaw = player.entity.yaw
        const pitch = player.entity.pitch
        player.look(yaw + Math.PI/2, pitch)
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

    if(!isBot && lookRight) {
      const slackId = req.body.event.user;
      
      try {
        const player = Bots.find(slackId);
        const yaw = player.entity.yaw
        const pitch = player.entity.pitch
        player.look(yaw - Math.PI/2, pitch)
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

    if(!isBot && lookUp) {
      const slackId = req.body.event.user;
      
      try {
        const player = Bots.find(slackId);
        const yaw = player.entity.yaw
        const pitch = player.entity.pitch
        player.look(yaw, pitch + Math.PI/4)
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

    if(!isBot && lookDown) {
      const slackId = req.body.event.user;
      
      try {
        const player = Bots.find(slackId);
        const yaw = player.entity.yaw
        const pitch = player.entity.pitch
        player.look(yaw, pitch - Math.PI/4)
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
