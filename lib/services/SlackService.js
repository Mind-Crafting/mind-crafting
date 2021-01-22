const Library = require('../models/Library');

const { WebClient } = require('@slack/web-api');
const slackBot = new WebClient(process.env.SLACK_BOT_AUTH);

const Bots = new Library();

module.exports = class SlackService {
  // Time in milliseconds to walk a single block in-game
  static oneBlock = 231.5;

  static awsLink = 'http://ec2-3-138-151-182.us-east-2.compute.amazonaws.com/';

  // Figures out what to do based on user input
  static handler({ text, user }) {
    const command = text.split(' ')[0];
    const argument = text.split(' ').slice(1);

    // List of all the available commands
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
      case 'attack':
        return this.attack(user);
      case 'murder':
        return this.murder(user);
      case 'help':
        return this.help();
      case 'Command':
        return 'Command not found!';

      default: {
        slackBot
          .chat
          .postMessage({
            channel: 'general',
            text: 'Command not found!'
          });

        return 'Command not found!';
      }
    }
  }

  // Be able to make a bot repeat what typed in slack
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

  // Creates bot, find available player slots and returns a link to the viewer site
  static play({ argument, user }) {
    const player = Bots.create(user);
    const gamemodeCommand = argument[0];

    try {
      Bots.makeViewer(player);
      Bots.botFindGamemode(player, gamemodeCommand);

      slackBot
        .chat
        .postMessage({
          channel: 'general',
          text: `Your viewer link is ${this.awsLink}`
        });
    }

    catch(err) {
      slackBot
        .chat
        .postMessage({
          channel: 'general',
          text: err.message
        });
    }

    return user;
  }

  static disconnect(user) {
    try {
      Bots.disconnect(user);
    }

    catch(err) {
      slackBot
        .chat
        .postMessage({
          channel: 'general',
          text: err.message
        });
    }

    return user;
  }

  // Makes the user be able to move in four direction
  static move({ argument, user }) {
    let direction = argument[0];
    // the number of blocks in that direction that the user wants to travel
    const blocks = argument[1];

    // Allows the user to switch directions
    // Left and right is switch in the mineflayer source code
    const dirSwitch = {
      left: 'right',
      right: 'left',
      forward: 'forward',
      back: 'back'
    };

    direction = dirSwitch[direction];

    const player = Bots.find(user);

    // Actually make the bot move based on user direction and distance
    player.setControlState(direction, true);
    setTimeout(() => player.setControlState(direction, false), blocks * this.oneBlock);

    return { user, direction, blocks };
  }

  // Makes the bot able to look around in forty-five degree angles
  static look({ argument, user }) {
    const direction = argument[0];

    const rotateYaw = (yaw, radians) => {
      return yaw + radians;
    };

    // 
    const rotatePitch = (pitch, radians) => {
      let sum = pitch + radians;

      // From how minecraft works the pitch is limited to be ninety degrees in both directions, this solves the case of whenever the user uses a degree higher
      // higher than the normal limit of minecraft

      // makes bot look up
      if(sum >= Math.PI / 2) sum = Math.PI / 2;
      // makes bot look down
      if(sum <= -Math.PI / 2) sum = -Math.PI / 2;

      return sum;
    };

    const player = Bots.find(user);
    const yaw = player.entity.yaw;
    const pitch = player.entity.pitch;

    // List of commands for look
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
      // Centers the pitch to 0 while leaving yaw alone
      case 'center': {
        player.look(yaw, 0);
        break;
      }
    }

    return { user, direction };
  }

  // Plays a arm swing animation for now
  static attack(user) {
    const player = Bots.find(user);

    player.swingArm();

    return user;
  }

  static murder(user) {
    const player = Bots.find(user);

    player.attack(player.nearestEntity, true);

    return user;
  }

  // Useful command to show all the commands the user can do
  static help() {
    const text = 'Here is a list of commands and syntax:\n'
    + 'play [maze-one, maze-two, pvp]\n'
    + 'disconnect\n'
    + 'move [forward, back, left, right] [a number]\n'
    + 'look [right, left]\n'
    + 'attack';


    slackBot
      .chat
      .postMessage({
        channel: 'general',
        text
      });

    return 'Help.';
  }
};
