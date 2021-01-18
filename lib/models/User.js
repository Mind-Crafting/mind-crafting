const pool = require('../utils/pool');

module.exports = class User {
    id;
    slackId;

    constructor(row) {
      this.id = row.id;
      this.slackId = row.slack_id;
    }

    static async insert(user) {
      const { rows } = await pool.query(
        'INSERT INTO users (slack_id) VALUES($1) RETURNING *', [slackId]
      );

      return new User(rows[0]);
    }

    static async find() {
        const { rows } = await pool.query(
          'SELECT * FROM users'
        );
    
        return rows.map(row => new User(row));
      }
    

    static async findById(id) {
        const { rows } = await pool.query(
          'SELECT * FROM users WHERE id=$1',
          [id]
        );
    
        if(!rows[0]) return null;
        else return new User(rows[0]);
      }
    
      static async update(id, user) {
        const { rows } = await pool.query(
          `UPDATE users
           SET slack_id=$1,    
           WHERE id=$2
           RETURNING *
          `,
          [slackId, id]
        );
    
        return new User(rows[0]);
      }
    
      static async delete(id) {
        const { rows } = await pool.query(
          'DELETE FROM users WHERE id=$1 RETURNING *',
          [id]
        );
    
        return new User(rows[0]);
      }
    };

    