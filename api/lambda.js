const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app'); // your Express app
exports.handler = serverlessExpress({ app });