const serverlessExpress = require('@vendia/serverless-express');
const app = require('./api/app.js');

exports.handler = serverlessExpress({ app });