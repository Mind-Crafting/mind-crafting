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
        return this.play({ argument, user });
      case 'disconnect':
        return this.disconnect(user);
      case 'move':
        return this.move({ argument, user });
      case 'look':
        return this.look({ argument, user });
      case 'find':
        return this.find(user);

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

  static play({ argument, user }) {
    Bots.create(user, argument);

    return user;
  }

  static disconnect(user) {
    Bots.disconnect(user);

    return user;
  }

  static move({ argument, user }) {
    let direction = argument[0];
    const blocks = argument[1];

    const dirSwitch = {
      left: 'right',
      right: 'left',
      forward: 'forward',
      back: 'back'
    };

    direction = dirSwitch[direction];

    const player = Bots.find(user);

    player.setControlState(direction, true);
    setTimeout(() => player.setControlState(direction, false), blocks * this.oneBlock);

    return { user, direction, blocks };
  }

  static look({ argument, user }) {
    const direction = argument[0];

    const rotateYaw = (yaw, radians) => {
      return yaw + radians;
    };

    const rotatePitch = (pitch, radians) => {
      let sum = pitch + radians;

      if(sum >= Math.PI / 2) sum = Math.PI / 2;
      if(sum <= -Math.PI / 2) sum = -Math.PI / 2;

      return sum;
    };

    const player = Bots.find(user);
    const yaw = player.entity.yaw;
    const pitch = player.entity.pitch;

    switch(direction) {
      case 'right': {
        const newYaw = rotateYaw(yaw, - Math.PI / 2);
        player.look(newYaw, pitch);
        break;
      }    
      case 'left': {
        const newYaw = rotateYaw(yaw, Math.PI / 2);
        player.look(newYaw, pitch);
        break;
      }
      case 'up': {
        const newPitch = rotatePitch(pitch, Math.PI / 4);
        player.look(yaw, newPitch);
        break;
      }
      case 'down':  {
        const newPitch = rotatePitch(pitch, - Math.PI / 4);
        player.look(yaw, newPitch);
        break;
      }
      case 'center': {
        player.look(yaw, 0);
        break;
      }
    }

    return { user, direction };
  }

  static find(user) {
    const player = Bots.find(user);

    return user;
  }
};
