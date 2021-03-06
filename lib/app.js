const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

app.use('/', require('./controllers/slack-bots'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
