const Library = require('../models/Library');

const { WebClient } = require('@slack/web-api');
const slackBot = new WebClient(process.env.SLACK_BOT_AUTH);

const Bots = new Library();

module.exports = class SlackService {
  static oneBlock = 231.5;

  static handler({ text, user }) {
    const command = text.split(' ')[0];
    const argument = text.split(' ').slice(1);

    switch(command) {
      case 'echo':
        return this.echo(argument);
      case 'play':
        return this.play(user);
      case 'disconnect':
        return this.disconnect(user);
      case 'move':
        return this.move({ argument, user });

      default:
        return;
    }
      
  }

  static echo(argument) {
    const text = argument.join(' ');

    slackBot
      .chat
      .postMessage({
        channel: 'general',
        text
      });

    return text;
  }

  static play(user) {
    Bots.create(user);

    return user;
  }

  static disconnect(user) {
    Bots.disconnect(user);

    return user;
  }

  static move({ argument, user }) {
    const direction = argument[0];
    const blocks = argument[1];

    const player = Bots.find(user);

    player.setControlState(direction, true);
    setTimeout(() => player.setControlState(direction, false), blocks * this.oneBlock);

    return { user, direction, blocks };
  }
};
