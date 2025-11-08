// backend/test-mongo.js
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting to', process.env.MONGO_URI ? 'Atlas (MONGO_URI set)' : 'no URI found');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected OK');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

test();
