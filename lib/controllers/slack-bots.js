const { Router } = require('express');

const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_AUTH);

module.exports = Router()
  .post('/', (req, res, next) => {
    const isBot = req.body.event.user === 'U01JRUK5VCK';
    const isEcho = req.body.event.text.split(' ')[1] === 'echo';

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
  });
