const { Router } = require('express');

const SlackService = require('../services/SlackService');

module.exports = Router()
  .use(isBot)
  .post('/', async(req, res, next) => {
    const isVerification = !!req.body.challenge;
    if(isVerification) res.send({ challenge: req.body.challenge });

    const { event } = req.body;
    const response = SlackService.handler(event);
    if(response) res.send({ response });
    
    res.end();
  });

function isBot(req, res, next) {
  const id = req.body.event.user;
  const botId = 'U01JRUK5VCK';

  if(id === botId) res.end();

  next();
}
