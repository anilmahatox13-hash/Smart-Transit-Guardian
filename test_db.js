require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

console.log("Testing connection to:", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : "NO URI FOUND");

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ SUCCESS! Connected to MongoDB Atlas successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.log("\n❌ CONNECTION FAILED WITH EXACT ERROR:");
    console.log("Error Name   :", err.name);
    console.log("Error Message:", err.message);
    process.exit(1);
  });