import serverlessExpress from '@vendia/serverless-express';
import app from './app.js';

// Create the Lambda handler
export const handler = serverlessExpress({ app });