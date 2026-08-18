require('dotenv').config({ path: './server/.env' });
require('dotenv').config();
const mongoose = require('mongoose');
const { User, Bus } = require('./server/src/models');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing in .env!');

    await mongoose.connect(mongoUri);
    console.log('🍃 Connected to MongoDB Atlas...');

    await User.deleteMany({});
    await Bus.deleteMany({});
    console.log('🗑️  Cleared existing Users and Buses.');

    const defaultPassword = 'Password123!';

    // 1. Authority / Admin
    const admin = await User.create({
      name: 'Transport Authority Officer',
      email: 'admin@transit.com',
      phone: '+977 9800000000',
      password: defaultPassword,
      role: 'admin',
      governmentId: {
        idType: 'National ID (NID/Aadhaar)',
        idNumber: 'GOV-NID-889900',
        issuingDistrictOrAuthority: 'Ministry of Transport, Singha Durbar',
        isVerified: true
      },
      isVerified: true
    });

    // 2. Bus Operator / Owner
    const operator = await User.create({
      name: 'Dhaulagiri Superline Transport Pvt Ltd',
      email: 'operator1@transit.com',
      phone: '+977 9851022334',
      password: defaultPassword,
      role: 'operator',
      governmentId: {
        idType: 'Citizenship (Nagarikta)',
        idNumber: '27-01-70-11223',
        issuingDistrictOrAuthority: 'Kathmandu DAO',
        isVerified: true
      },
      operatorKyc: {
        companyName: 'Dhaulagiri Superline Transport Pvt Ltd',
        registrationNumber: 'REG-DOTM-2024-88',
        panVatNumber: 'PAN-601928374',
        businessAddress: 'Gongabu New Bus Park, Kathmandu',
        isVerified: true
      },
      isVerified: true
    });

    // 3. Driver
    const driver = await User.create({
      name: 'Ram Bahadur Thapa',
      email: 'driver1@transit.com',
      phone: '+977 9841890011',
      password: defaultPassword,
      role: 'driver',
      governmentId: {
        idType: 'Citizenship (Nagarikta)',
        idNumber: '34-01-72-88771',
        issuingDistrictOrAuthority: 'Kaski (Pokhara)',
        isVerified: true
      },
      driverKyc: {
        licenseNumber: '01-06-00998812',
        licenseCategory: 'Heavy Vehicle (Category B/G)',
        licenseExpiry: '2029-12-31',
        employedByOperatorId: operator._id,
        policeClearanceVerified: true,
        yearsOfExperience: 8
      },
      isVerified: true
    });

    // 4. Passenger
    const passenger = await User.create({
      name: 'Anil Mahato',
      email: 'passenger1@transit.com',
      phone: '+977 9801234567',
      password: defaultPassword,
      role: 'passenger',
      governmentId: {
        idType: 'Citizenship (Nagarikta)',
        idNumber: '27-01-78-99443',
        issuingDistrictOrAuthority: 'Kathmandu',
        isVerified: true
      },
      isVerified: true
    });

    // 5. Buses
    await Bus.create({
      busName: 'Dhaulagiri Super Deluxe Express',
      busNumber: 'BA-01-KHA-8822',
      registrationNumber: 'BA 2 KHA 8822',
      operatorId: operator._id,
      driverId: driver._id,
      contactPhone: '+977 9851022334',
      originCountry: 'Nepal',
      originProvince: 'Bagmati Province',
      originDistrict: 'Kathmandu',
      originChowk: 'Gongabu New Bus Park',
      destCountry: 'Nepal',
      destProvince: 'Gandaki Province',
      destDistrict: 'Kaski (Pokhara)',
      destinationChowk: 'Prithvi Chowk',
      busType: 'AC Deluxe',
      baseFare: 750,
      capacity: 40,
      verificationStatus: 'verified',
      bluebookNumber: 'BB-99214-KTM',
      routePermitNumber: 'RP-2024-8822',
      insurancePolicyNumber: 'INS-NLIC-88912',
      currentLocation: {
        type: 'Point',
        coordinates: [85.0500, 27.8100]
      },
      currentChowkIndex: 2,
      isLive: true,
      currentSpeed: 54,
      payoutDetails: {
        esewaId: '9851022334',
        khaltiId: '9851022334',
        upiId: 'dhaulagiri.transit@upi',
        bankName: 'Nabil Bank Ltd',
        accountNumber: '01200175008899',
        accountHolderName: 'Dhaulagiri Superline Transport Pvt Ltd'
      },
      routeChowks: [
        { name: 'Gongabu New Bus Park', district: 'Kathmandu', sequence: 1, coordinates: [85.3120, 27.7340], estimatedMinutesFromStart: 0, fareFromStart: 0 },
        { name: 'Kalanki Chowk', district: 'Kathmandu', sequence: 2, coordinates: [85.2810, 27.6930], estimatedMinutesFromStart: 25, fareFromStart: 50 },
        { name: 'Naubise Chowk', district: 'Dhading', sequence: 3, coordinates: [85.1610, 27.7250], estimatedMinutesFromStart: 65, fareFromStart: 180 },
        { name: 'Malekhu Chowk', district: 'Dhading', sequence: 4, coordinates: [84.8210, 27.8110], estimatedMinutesFromStart: 120, fareFromStart: 320 },
        { name: 'Mugling Highway Bazaar', district: 'Chitwan', sequence: 5, coordinates: [84.5560, 27.8610], estimatedMinutesFromStart: 175, fareFromStart: 450 },
        { name: 'Dumre Chowk', district: 'Tanahun', sequence: 6, coordinates: [84.4120, 27.9620], estimatedMinutesFromStart: 230, fareFromStart: 580 },
        { name: 'Prithvi Chowk Terminal', district: 'Kaski (Pokhara)', sequence: 7, coordinates: [83.9856, 28.2096], estimatedMinutesFromStart: 310, fareFromStart: 750 }
      ]
    });

    await Bus.create({
      busName: 'Everest Highway Sleeper',
      busNumber: 'LU-02-KHA-4411',
      registrationNumber: 'LU 2 KHA 4411',
      operatorId: operator._id,
      driverId: driver._id,
      contactPhone: '+977 9851022334',
      originCountry: 'Nepal',
      originProvince: 'Bagmati Province',
      originDistrict: 'Kathmandu',
      originChowk: 'Kalanki Chowk',
      destCountry: 'Nepal',
      destProvince: 'Madhesh Province',
      destDistrict: 'Parsa (Birgunj)',
      destinationChowk: 'Ghantaghar Bus Terminal',
      busType: 'Luxury Sleeper',
      baseFare: 850,
      capacity: 36,
      verificationStatus: 'pending',
      bluebookNumber: 'BB-77123-KTM',
      routePermitNumber: 'RP-2024-4411',
      insurancePolicyNumber: 'INS-SIC-55441',
      currentLocation: {
        type: 'Point',
        coordinates: [85.2810, 27.6930]
      },
      currentChowkIndex: 1,
      isLive: true,
      currentSpeed: 42,
      payoutDetails: {
        esewaId: '9851022334',
        khaltiId: '9851022334',
        upiId: 'everest.transit@upi',
        bankName: 'Global IME Bank',
        accountNumber: '2901010009988',
        accountHolderName: 'Everest Transport Fleet'
      },
      routeChowks: [
        { name: 'Kalanki Chowk', district: 'Kathmandu', sequence: 1, coordinates: [85.2810, 27.6930], estimatedMinutesFromStart: 0, fareFromStart: 0 },
        { name: 'Hetauda Bus Park', district: 'Makwanpur', sequence: 2, coordinates: [85.0320, 27.4280], estimatedMinutesFromStart: 180, fareFromStart: 450 },
        { name: 'Ghantaghar Bus Terminal', district: 'Parsa (Birgunj)', sequence: 3, coordinates: [84.8760, 27.0130], estimatedMinutesFromStart: 280, fareFromStart: 850 }
      ]
    });

    console.log('✅ Accounts re-seeded with single-hash password and flexible phone identifiers.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDatabase();