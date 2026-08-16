const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const mongoose = require('mongoose');

const User = require('../server/src/models/User');
const Bus = require('../server/src/models/Bus');
const Route = require('../server/src/models/Route');
const Trip = require('../server/src/models/Trip');
const Location = require('../server/src/models/Location');
const Emergency = require('../server/src/models/Emergency');
const Maintenance = require('../server/src/models/Maintenance');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in server/.env');
    }

    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      Trip.deleteMany({}),
      Location.deleteMany({}),
      Emergency.deleteMany({}),
      Maintenance.deleteMany({})
    ]);

    console.log('[Seed] Creating Users...');
    const users = await User.create([
      {
        name: 'Transit Admin',
        email: 'admin@transit.com',
        password: 'Password123!',
        role: 'admin',
        phone: '+91 9876543210'
      },
      {
        name: 'Ramesh Kumar (Driver 1)',
        email: 'driver1@transit.com',
        password: 'Password123!',
        role: 'driver',
        phone: '+91 9876543211'
      },
      {
        name: 'Suresh Rao (Driver 2)',
        email: 'driver2@transit.com',
        password: 'Password123!',
        role: 'driver',
        phone: '+91 9876543212'
      },
      {
        name: 'Anil Passenger',
        email: 'passenger1@transit.com',
        password: 'Password123!',
        role: 'passenger',
        phone: '+91 9876543213'
      },
      {
        name: 'Priya Sharma',
        email: 'passenger2@transit.com',
        password: 'Password123!',
        role: 'passenger',
        phone: '+91 9876543214'
      }
    ]);

    const adminUser = users[0];
    const driver1 = users[1];
    const driver2 = users[2];

    console.log('[Seed] Creating Routes and GPS Stops...');
    const routes = await Route.create([
      {
        name: 'Route 1: Central Station to Campus Terminal',
        startPoint: 'Central Railway Station',
        endPoint: 'Main Campus Terminal',
        distanceKm: 14.5,
        estimatedMinutes: 35,
        stops: [
          {
            name: 'Central Railway Station Gate 1',
            sequence: 1,
            location: { type: 'Point', coordinates: [80.5401, 16.2250] },
            estimatedMinutesFromStart: 0
          },
          {
            name: 'City Library Crossing',
            sequence: 2,
            location: { type: 'Point', coordinates: [80.5455, 16.2295] },
            estimatedMinutesFromStart: 8
          },
          {
            name: 'Tech Park South Gate',
            sequence: 3,
            location: { type: 'Point', coordinates: [80.5510, 16.2340] },
            estimatedMinutesFromStart: 18
          },
          {
            name: 'Main Campus Terminal',
            sequence: 4,
            location: { type: 'Point', coordinates: [80.5562, 16.2395] },
            estimatedMinutesFromStart: 35
          }
        ]
      },
      {
        name: 'Route 2: North Metro to East Gate',
        startPoint: 'North Metro Interchange',
        endPoint: 'University East Gate',
        distanceKm: 9.8,
        estimatedMinutes: 24,
        stops: [
          {
            name: 'North Metro Interchange',
            sequence: 1,
            location: { type: 'Point', coordinates: [80.5310, 16.2410] },
            estimatedMinutesFromStart: 0
          },
          {
            name: 'Hospital Circle',
            sequence: 2,
            location: { type: 'Point', coordinates: [80.5415, 16.2445] },
            estimatedMinutesFromStart: 10
          },
          {
            name: 'University East Gate',
            sequence: 3,
            location: { type: 'Point', coordinates: [80.5520, 16.2480] },
            estimatedMinutesFromStart: 24
          }
        ]
      }
    ]);

    const route1 = routes[0];
    const route2 = routes[1];

    console.log('[Seed] Creating Buses...');
    const buses = await Bus.create([
      {
        busNumber: 'BUS-101',
        registrationNumber: 'AP-07-TX-1001',
        capacity: 45,
        status: 'active',
        driverId: driver1._id,
        routeId: route1._id,
        lastLocation: { type: 'Point', coordinates: [80.5455, 16.2295] },
        lastUpdated: new Date()
      },
      {
        busNumber: 'BUS-102',
        registrationNumber: 'AP-07-TX-1002',
        capacity: 50,
        status: 'idle',
        driverId: driver2._id,
        routeId: route2._id,
        lastLocation: { type: 'Point', coordinates: [80.5310, 16.2410] },
        lastUpdated: new Date()
      }
    ]);

    const bus1 = buses[0];
    const bus2 = buses[1];

    // Assign buses to drivers
    await User.findByIdAndUpdate(driver1._id, { assignedBus: bus1._id });
    await User.findByIdAndUpdate(driver2._id, { assignedBus: bus2._id });

    console.log('[Seed] Creating Active Trip & Real-Time Telemetry...');
    const activeTrip = await Trip.create({
      busId: bus1._id,
      driverId: driver1._id,
      routeId: route1._id,
      status: 'in_progress',
      startTime: new Date(Date.now() - 15 * 60 * 1000) // Started 15 mins ago
    });

    await Location.create({
      busId: bus1._id,
      tripId: activeTrip._id,
      location: { type: 'Point', coordinates: [80.5455, 16.2295] },
      speed: 34,
      heading: 45,
      updatedAt: new Date()
    });

    console.log('[Seed] Creating Maintenance Records...');
    await Maintenance.create([
      {
        busId: bus1._id,
        serviceType: 'routine_service',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        odometerReadingKm: 12450,
        status: 'scheduled',
        notes: 'Regular 10,000 km oil and filter change'
      },
      {
        busId: bus2._id,
        serviceType: 'brake_repair',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        odometerReadingKm: 28900,
        status: 'scheduled',
        notes: 'Front brake pad inspection and calibration'
      }
    ]);

    console.log('\n=============================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.table([
      { Role: 'Admin', Email: 'admin@transit.com', Password: 'Password123!' },
      { Role: 'Driver', Email: 'driver1@transit.com', Password: 'Password123!' },
      { Role: 'Driver', Email: 'driver2@transit.com', Password: 'Password123!' },
      { Role: 'Passenger', Email: 'passenger1@transit.com', Password: 'Password123!' },
      { Role: 'Passenger', Email: 'passenger2@transit.com', Password: 'Password123!' }
    ]);
    console.log(`Routes Created: ${routes.length}`);
    console.log(`Buses Created: ${buses.length}`);
    console.log(`Active Trips Created: 1 (Bus ${bus1.busNumber})`);
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
