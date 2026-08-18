require('dotenv').config({ path: './server/.env' });
require('dotenv').config();
const mongoose = require('mongoose');
const { Bus } = require('./server/src/models');

async function fixAndInspectBuses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('?? Connected to MongoDB Atlas...\n');

    const allBuses = await Bus.find();
    console.log(`?? Found ${allBuses.length} total buses in database:\n`);

    for (let b of allBuses) {
      let updated = false;

      if (!b.currentLocation || !b.currentLocation.coordinates || b.currentLocation.coordinates.length < 2) {
        b.currentLocation = {
          type: 'Point',
          coordinates: [85.3120, 27.7340]
        };
        updated = true;
      }

      if (b.verificationStatus !== 'verified' || !b.isLive) {
        b.verificationStatus = 'verified';
        b.isLive = true;
        updated = true;
      }

      if (updated) await b.save();

      console.log(`?? [${b.busNumber}] ${b.busName}`);
      console.log(`   Route: ${b.originDistrict} (${b.originChowk}) ? ${b.destDistrict} (${b.destinationChowk})`);
      console.log(`   Fare: NPR ${b.baseFare} | Live: ${b.isLive} | Status: ${b.verificationStatus}`);
      console.log(`   GPS Coords: [${b.currentLocation.coordinates.join(', ')}]\n`);
    }

    process.exit(0);
  } catch (err) {
    console.error('? Error:', err.message);
    process.exit(1);
  }
}

fixAndInspectBuses();
