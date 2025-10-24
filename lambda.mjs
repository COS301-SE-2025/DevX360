/*import serverlessExpress from '@vendia/serverless-express';
import app from './api/app.js';

// Create a wrapper function to handle URL transformation before passing to Express
const transformUrl = (event) => {
  let path = event.rawPath || event.path || '/';
  
  console.log('Lambda received path:', path);
  
  // Strip stage prefix if present
  if (path.startsWith('/dev/')) {
    path = path.replace(/^\/dev/, '');
  }
  
  // Add /api prefix if not already present and not a static file
  if (!path.startsWith('/api/') && !path.startsWith('/uploads/')) {
    path = '/api' + path;
  }
  
  console.log('Transformed path:', path);
  
  // Update the event object
  if (event.rawPath) event.rawPath = path;
  if (event.path) event.path = path;
  
  return event;
};

const serverlessExpressInstance = serverlessExpress({ app });

export const handler = async (event, context) => {
  console.log('Lambda handler called with event:', JSON.stringify(event, null, 2));
  console.log("MONGODB_URI env:", process.env.MONGODB_URI);
  
  // Transform the URL before passing to serverless-express
  const transformedEvent = transformUrl(event);
  
  return serverlessExpressInstance(transformedEvent, context);
};*/

import serverlessExpress from '@vendia/serverless-express';
import mongoose from 'mongoose';
import app from './api/app.js';

// Global connection promise to reuse across Lambda invocations
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  console.log('Establishing new database connection');
  
  // Lambda-optimized MongoDB connection settings
  const mongooseOptions = {
    maxPoolSize: 5, // Reduced for Lambda
    serverSelectionTimeoutMS: 15000, // 15 seconds
    socketTimeoutMS: 20000, // 20 seconds
    connectTimeoutMS: 15000, // 15 seconds
    bufferCommands: false, // Disable mongoose buffering
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    cachedDb = mongoose.connection;
    console.log('Connected to MongoDB Atlas');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Create a wrapper function to handle URL transformation before passing to Express
const transformUrl = (event) => {
  let path = event.rawPath || event.path || '/';
  
  console.log('Lambda received path:', path);
  
  // Strip stage prefix if present
  if (path.startsWith('/dev/')) {
    path = path.replace(/^\/dev/, '');
  }
  
  // Add /api prefix if not already present and not a static file
  if (!path.startsWith('/api/') && !path.startsWith('/uploads/')) {
    path = '/api' + path;
  }
  
  console.log('Transformed path:', path);
  
  // Update the event object
  if (event.rawPath) event.rawPath = path;
  if (event.path) event.path = path;
  
  return event;
};

const serverlessExpressInstance = serverlessExpress({ app });

export const handler = async (event, context) => {
  console.log('Lambda handler called with event:', JSON.stringify(event, null, 2));
  console.log("MONGODB_URI env:", process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  
  // Ensure database connection before processing request
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Database connection failed',
        error: error.message
      })
    };
  }
  
  // Transform the URL before passing to serverless-express
  const transformedEvent = transformUrl(event);
  
  return serverlessExpressInstance(transformedEvent, context);
};