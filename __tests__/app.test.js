const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');

describe('mind-crafting routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'))
  });

  it('should echo a message', async() => {
    const response = request(app)
      .post('/')
      .send({
        event:{
          text: 'echo this message'
        }
      });

    });
});
