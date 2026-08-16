require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const { User, Bus, Ticket, LostFound } = require('./server/src/models');

async function inspectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smarttransit');
    console.log('connected to mongodb for inspection...\n');

    const users = await User.find().lean();
    const buses = await Bus.find().lean();
    const tickets = await Ticket.find().lean();

    console.log(`=== USERS COLLECTION (${users.length} records) ===`);
    users.forEach(u => console.log(`- [${u.role.toUpperCase()}] ${u.name} | Phone: ${u.phone || u.email} | ID Verified: ${!!u.governmentId?.idNumber}`));

    console.log(`\n=== BUSES COLLECTION (${buses.length} records) ===`);
    buses.forEach(b => console.log(`- [${b.busNumber}] ${b.busName} (${b.originDistrict} ➔ ${b.destDistrict}) | Status: ${b.verificationStatus}`));

    console.log(`\n=== TICKETS COLLECTION (${tickets.length} records) ===`);
    tickets.forEach(t => console.log(`- [${t.ticketNumber}] Passenger: ${t.passengerName} | Seats: ${t.selectedSeats.join(', ')} | Fare: ${t.currency} ${t.totalFare}`));

    process.exit(0);
  } catch (err) {
    console.error('Inspection error:', err);
    process.exit(1);
  }
}

inspectDB();