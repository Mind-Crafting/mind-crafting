const { Router } = require('express');

const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_AUTH);

module.exports = Router()
  .post('/', (req, res, next) => {

    console.log(req.body);

    web
      .chat
      .postMessage({
        channel: 'general',
        text: req.body.event.text
      })
      .then(() => res.send({ message: 'message sent!' }))
      .catch(next);
  });
