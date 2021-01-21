const { Router } = require('express');

const SlackService = require('../services/SlackService');

module.exports = Router()
  .post('/', async(req, res, next) => {
    const isVerification = !!req.body.challenge;
    if(isVerification) res.send({ challenge: req.body.challenge });

    const { event } = req.body;
    const response = SlackService.handler(event);
    if(response) res.send({ response });
    
    next();
  });
