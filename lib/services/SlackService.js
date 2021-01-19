const Library = require('../models/Library');

const { WebClient } = require('@slack/web-api');
const slackBot = new WebClient(process.env.SLACK_BOT_AUTH);

const Bots = new Library();

module.exports = class SlackService {
  static handler(commandText) {
    const command = commandText.split(' ')[0];
    const argument = commandText.split(' ').slice(1);

    switch(command) {
      case 'echo':
        return this.echo(argument);

      default:
        return;
    }
      
  }

  static echo(argument) {
    const message = argument.join(' ');

    slackBot
      .chat
      .postMessage({
        channel: 'general',
        message
      });

    return message;
  }

};
