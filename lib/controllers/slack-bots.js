const { Router } = require('express');

const SlackService = require('../services/SlackService');

module.exports = Router()
  .post('/', verify, isBot, async(req, res, next) => {
    const { event } = req.body;
    const response = SlackService.handler(event);
    if(response) return res.send({ response });
    
    next();
  });

function verify(req, res, next) {
  const isVerification = !!req.body.challenge;
  if(isVerification) return res.send({ challenge: req.body.challenge });

  next();
}

function isBot(req, res, next) {
  const botId = 'U01JRUK5VCK';
  const id = req.body.event.user;

  if(id === botId) return res.end();

  next();
}
