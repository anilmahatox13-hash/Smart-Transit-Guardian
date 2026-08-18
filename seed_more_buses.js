require('dotenv').config({ path: './server/.env' });
require('dotenv').config();
const mongoose = require('mongoose');
const { Bus, User } = require('./server/src/models');

async function seedFleet() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing in .env!');

    await mongoose.connect(mongoUri);
    console.log('🍃 Connected to MongoDB Atlas...');

    // Find or create a default operator and driver to attach to vehicles
    let operator = await User.findOne({ role: 'operator' });
    let driver = await User.findOne({ role: 'driver' });

    if (!operator) {
      operator = await User.findOne({ role: 'admin' }) || await User.findOne();
    }
    if (!driver) {
      driver = operator;
    }

    const busesToAdd = [
      // 1. Sajha Yatayat (Valley Metro)
      {
        busName: 'Sajha Yatayat Green Metro',
        busNumber: 'BA-01-KHA-2024',
        registrationNumber: 'BA 1 KHA 2024',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9851023456',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Lalitpur',
        originChowk: 'Lagankhel Bus Park',
        destCountry: 'Nepal',
        destProvince: 'Bagmati Province',
        destDistrict: 'Kathmandu',
        destinationChowk: 'Budhanilkantha Chowk',
        busType: 'AC Deluxe',
        baseFare: 45,
        capacity: 42,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-KTM-10928',
        routePermitNumber: 'RP-DOTM-2024-01',
        insurancePolicyNumber: 'INS-NLIC-44510',
        currentLocation: { type: 'Point', coordinates: [85.3160, 27.7050] }, // Near Tripureshwor
        currentChowkIndex: 3,
        isLive: true,
        currentSpeed: 32,
        payoutDetails: {
          esewaId: '9851023456',
          khaltiId: '9851023456',
          bankName: 'Nabil Bank Ltd',
          accountNumber: '01900100998811',
          accountHolderName: 'Sajha Yatayat Cooperative'
        },
        routeChowks: [
          { name: 'Lagankhel Bus Park', district: 'Lalitpur', sequence: 1, coordinates: [85.3245, 27.6672], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Jawalakhel Chowk', district: 'Lalitpur', sequence: 2, coordinates: [85.3150, 27.6740], estimatedMinutesFromStart: 8, fareFromStart: 20 },
          { name: 'Kupondole Pulchowk', district: 'Lalitpur', sequence: 3, coordinates: [85.3160, 27.6890], estimatedMinutesFromStart: 18, fareFromStart: 25 },
          { name: 'Tripureshwor Chowk', district: 'Kathmandu', sequence: 4, coordinates: [85.3160, 27.7050], estimatedMinutesFromStart: 28, fareFromStart: 30 },
          { name: 'Ratna Park (Purano Buspark)', district: 'Kathmandu', sequence: 5, coordinates: [85.3155, 27.7065], estimatedMinutesFromStart: 38, fareFromStart: 35 },
          { name: 'Maharajgunj Chowk', district: 'Kathmandu', sequence: 6, coordinates: [85.3340, 27.7370], estimatedMinutesFromStart: 55, fareFromStart: 40 },
          { name: 'Budhanilkantha Chowk', district: 'Kathmandu', sequence: 7, coordinates: [85.3620, 27.7780], estimatedMinutesFromStart: 75, fareFromStart: 45 }
        ]
      },

      // 2. Mahanagar Yatayat (Ring Road Circle)
      {
        busName: 'Mahanagar Yatayat Ring Road Express',
        busNumber: 'BA-02-KHA-9901',
        registrationNumber: 'BA 2 KHA 9901',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9841890011',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Swayambhu Chowk',
        destCountry: 'Nepal',
        destProvince: 'Bagmati Province',
        destDistrict: 'Kathmandu',
        destinationChowk: 'Koteshwor Chowk',
        busType: 'Express',
        baseFare: 40,
        capacity: 45,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-KTM-22391',
        routePermitNumber: 'RP-DOTM-2024-02',
        insurancePolicyNumber: 'INS-SIC-11928',
        currentLocation: { type: 'Point', coordinates: [85.2810, 27.6930] }, // Kalanki
        currentChowkIndex: 2,
        isLive: true,
        currentSpeed: 38,
        payoutDetails: {
          esewaId: '9841890011',
          khaltiId: '9841890011',
          bankName: 'Global IME Bank',
          accountNumber: '290101994821',
          accountHolderName: 'Mahanagar Yatayat Pvt Ltd'
        },
        routeChowks: [
          { name: 'Swayambhu Chowk', district: 'Kathmandu', sequence: 1, coordinates: [85.2830, 27.7150], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Kalanki Chowk', district: 'Kathmandu', sequence: 2, coordinates: [85.2810, 27.6930], estimatedMinutesFromStart: 15, fareFromStart: 20 },
          { name: 'Balkhu Chowk', district: 'Kathmandu', sequence: 3, coordinates: [85.2970, 27.6850], estimatedMinutesFromStart: 25, fareFromStart: 25 },
          { name: 'Satdobato Chowk', district: 'Lalitpur', sequence: 4, coordinates: [85.3260, 27.6580], estimatedMinutesFromStart: 45, fareFromStart: 35 },
          { name: 'Gwarko Chowk', district: 'Lalitpur', sequence: 5, coordinates: [85.3340, 27.6690], estimatedMinutesFromStart: 55, fareFromStart: 35 },
          { name: 'Koteshwor Chowk', district: 'Kathmandu', sequence: 6, coordinates: [85.3480, 27.6770], estimatedMinutesFromStart: 70, fareFromStart: 40 }
        ]
      },

      // 3. Mayur Yatayat (Kathmandu - Banepa)
      {
        busName: 'Mayur Yatayat Superline',
        busNumber: 'BA-03-KHA-5512',
        registrationNumber: 'BA 3 KHA 5512',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9860112233',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Ratna Park (Purano Buspark)',
        destCountry: 'Nepal',
        destProvince: 'Bagmati Province',
        destDistrict: 'Kavrepalanchok',
        destinationChowk: 'Banepa Chandeshwori Chowk',
        busType: 'Super Deluxe',
        baseFare: 75,
        capacity: 40,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-KTM-55120',
        routePermitNumber: 'RP-DOTM-2024-03',
        insurancePolicyNumber: 'INS-PRU-99120',
        currentLocation: { type: 'Point', coordinates: [85.3780, 27.6740] }, // Thimi
        currentChowkIndex: 3,
        isLive: true,
        currentSpeed: 45,
        payoutDetails: {
          esewaId: '9860112233',
          khaltiId: '9860112233',
          bankName: 'NIC Asia Bank',
          accountNumber: '550192837411',
          accountHolderName: 'Mayur Transport Ltd'
        },
        routeChowks: [
          { name: 'Ratna Park (Purano Buspark)', district: 'Kathmandu', sequence: 1, coordinates: [85.3155, 27.7065], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Koteshwor Chowk', district: 'Kathmandu', sequence: 2, coordinates: [85.3480, 27.6770], estimatedMinutesFromStart: 20, fareFromStart: 25 },
          { name: 'Thimi Chowk (Radhe Radhe)', district: 'Bhaktapur', sequence: 3, coordinates: [85.3780, 27.6740], estimatedMinutesFromStart: 35, fareFromStart: 35 },
          { name: 'Sallaghari Chowk', district: 'Bhaktapur', sequence: 4, coordinates: [85.4050, 27.6720], estimatedMinutesFromStart: 45, fareFromStart: 45 },
          { name: 'Suryabinayak Chowk', district: 'Bhaktapur', sequence: 5, coordinates: [85.4220, 27.6680], estimatedMinutesFromStart: 55, fareFromStart: 50 },
          { name: 'Sanga Mahadev Chowk', district: 'Kavrepalanchok', sequence: 6, coordinates: [85.4950, 27.6430], estimatedMinutesFromStart: 75, fareFromStart: 65 },
          { name: 'Banepa Chandeshwori Chowk', district: 'Kavrepalanchok', sequence: 7, coordinates: [85.5240, 27.6320], estimatedMinutesFromStart: 90, fareFromStart: 75 }
        ]
      },

      // 4. Dhaulagiri AC Deluxe (Kathmandu - Pokhara)
      {
        busName: 'Dhaulagiri Deluxe AC Express',
        busNumber: 'GA-01-KHA-7788',
        registrationNumber: 'GA 1 KHA 7788',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9856012345',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Gongabu New Bus Park',
        destCountry: 'Nepal',
        destProvince: 'Gandaki Province',
        destDistrict: 'Kaski (Pokhara)',
        destinationChowk: 'Prithvi Chowk',
        busType: 'AC Deluxe',
        baseFare: 1100,
        capacity: 34,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-POK-77881',
        routePermitNumber: 'RP-DOTM-2024-04',
        insurancePolicyNumber: 'INS-NLIC-88912',
        currentLocation: { type: 'Point', coordinates: [84.5560, 27.8580] }, // Near Mugling
        currentChowkIndex: 5,
        isLive: true,
        currentSpeed: 56,
        payoutDetails: {
          esewaId: '9856012345',
          khaltiId: '9856012345',
          bankName: 'Nabil Bank Ltd',
          accountNumber: '01200175008899',
          accountHolderName: 'Dhaulagiri Superline Transport'
        },
        routeChowks: [
          { name: 'Gongabu New Bus Park', district: 'Kathmandu', sequence: 1, coordinates: [85.3120, 27.7340], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Kalanki Chowk', district: 'Kathmandu', sequence: 2, coordinates: [85.2810, 27.6930], estimatedMinutesFromStart: 20, fareFromStart: 50 },
          { name: 'Naubise Chowk', district: 'Dhading', sequence: 3, coordinates: [85.1630, 27.7260], estimatedMinutesFromStart: 60, fareFromStart: 200 },
          { name: 'Malekhu Chowk', district: 'Dhading', sequence: 4, coordinates: [84.8250, 27.8100], estimatedMinutesFromStart: 120, fareFromStart: 450 },
          { name: 'Mugling Bazaar Chowk', district: 'Chitwan', sequence: 5, coordinates: [84.5560, 27.8580], estimatedMinutesFromStart: 180, fareFromStart: 750 },
          { name: 'Damauli Main Chowk', district: 'Tanahun', sequence: 6, coordinates: [84.2810, 27.9730], estimatedMinutesFromStart: 250, fareFromStart: 950 },
          { name: 'Prithvi Chowk', district: 'Kaski (Pokhara)', sequence: 7, coordinates: [83.9856, 28.2096], estimatedMinutesFromStart: 320, fareFromStart: 1100 }
        ]
      },

      // 5. Purwanchal Superfast (Kathmandu - Jhapa/Birtamode)
      {
        busName: 'Purwanchal Superfast Deluxe',
        busNumber: 'NA-04-KHA-3344',
        registrationNumber: 'NA 4 KHA 3344',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9804911223',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Koteshwor Chowk',
        destCountry: 'Nepal',
        destProvince: 'Koshi Province',
        destDistrict: 'Jhapa',
        destinationChowk: 'Birtamode Muktichowk',
        busType: 'Sleeper Coach',
        baseFare: 1650,
        capacity: 32,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-JHP-33441',
        routePermitNumber: 'RP-DOTM-2024-05',
        insurancePolicyNumber: 'INS-NLIC-99321',
        currentLocation: { type: 'Point', coordinates: [86.4800, 26.7100] }, // Near Lahan
        currentChowkIndex: 3,
        isLive: true,
        currentSpeed: 64,
        payoutDetails: {
          esewaId: '9804911223',
          khaltiId: '9804911223',
          bankName: 'Prabhu Bank',
          accountNumber: '110928374619',
          accountHolderName: 'Purwanchal Yatayat Pvt Ltd'
        },
        routeChowks: [
          { name: 'Koteshwor Chowk', district: 'Kathmandu', sequence: 1, coordinates: [85.3480, 27.6770], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Bardibas Junction Chowk', district: 'Mahottari', sequence: 2, coordinates: [85.9000, 26.9800], estimatedMinutesFromStart: 180, fareFromStart: 600 },
          { name: 'Lahan Main Traffic Chowk', district: 'Siraha', sequence: 3, coordinates: [86.4800, 26.7100], estimatedMinutesFromStart: 300, fareFromStart: 950 },
          { name: 'Itahari Traffic Chowk', district: 'Sunsari', sequence: 4, coordinates: [87.2800, 26.6600], estimatedMinutesFromStart: 420, fareFromStart: 1350 },
          { name: 'Damak Central Bus Park', district: 'Jhapa', sequence: 5, coordinates: [87.6900, 26.6650], estimatedMinutesFromStart: 510, fareFromStart: 1500 },
          { name: 'Birtamode Muktichowk', district: 'Jhapa', sequence: 6, coordinates: [87.9900, 26.6300], estimatedMinutesFromStart: 570, fareFromStart: 1650 }
        ]
      },

      // 6. Lumbini Express (Kathmandu - Butwal)
      {
        busName: 'Lumbini Express Highway Coach',
        busNumber: 'LU-01-KHA-4411',
        registrationNumber: 'LU 1 KHA 4411',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9847055667',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Balkhu Chowk',
        destCountry: 'Nepal',
        destProvince: 'Lumbini Province',
        destDistrict: 'Rupandehi',
        destinationChowk: 'Butwal Traffic Chowk',
        busType: 'AC Deluxe',
        baseFare: 950,
        capacity: 40,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-BUT-44110',
        routePermitNumber: 'RP-DOTM-2024-06',
        insurancePolicyNumber: 'INS-SIC-44199',
        currentLocation: { type: 'Point', coordinates: [84.4200, 27.6900] }, // Narayangarh
        currentChowkIndex: 3,
        isLive: true,
        currentSpeed: 52,
        payoutDetails: {
          esewaId: '9847055667',
          khaltiId: '9847055667',
          bankName: 'Siddhartha Bank Ltd',
          accountNumber: '00918273645',
          accountHolderName: 'Lumbini Yatayat Pvt Ltd'
        },
        routeChowks: [
          { name: 'Balkhu Chowk', district: 'Kathmandu', sequence: 1, coordinates: [85.2970, 27.6850], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Mugling Bazaar Chowk', district: 'Chitwan', sequence: 2, coordinates: [84.5560, 27.8580], estimatedMinutesFromStart: 160, fareFromStart: 500 },
          { name: 'Narayangarh Pulchowk', district: 'Chitwan', sequence: 3, coordinates: [84.4200, 27.6900], estimatedMinutesFromStart: 220, fareFromStart: 650 },
          { name: 'Kawasoti Thana Chowk', district: 'Nawalpur', sequence: 4, coordinates: [84.1200, 27.6400], estimatedMinutesFromStart: 270, fareFromStart: 800 },
          { name: 'Butwal Traffic Chowk', district: 'Rupandehi', sequence: 5, coordinates: [83.4600, 27.7000], estimatedMinutesFromStart: 360, fareFromStart: 950 }
        ]
      },

      // 7. Mithila Super Express (Kathmandu - Janakpurdham)
      {
        busName: 'Mithila Express Super Deluxe',
        busNumber: 'NA-05-KHA-8811',
        registrationNumber: 'NA 5 KHA 8811',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9811223344',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Koteshwor Chowk',
        destCountry: 'Nepal',
        destProvince: 'Madhesh Province',
        destDistrict: 'Dhanusha (Janakpur)',
        destinationChowk: 'Janakpur Dham Bus Stand',
        busType: 'Super Deluxe',
        baseFare: 850,
        capacity: 38,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-JNK-88112',
        routePermitNumber: 'RP-DOTM-2024-07',
        insurancePolicyNumber: 'INS-NLIC-11882',
        currentLocation: { type: 'Point', coordinates: [85.9000, 26.9800] }, // Bardibas
        currentChowkIndex: 3,
        isLive: true,
        currentSpeed: 48,
        payoutDetails: {
          esewaId: '9811223344',
          khaltiId: '9811223344',
          bankName: 'Everest Bank Ltd',
          accountNumber: '990182736410',
          accountHolderName: 'Mithila Transport Pvt Ltd'
        },
        routeChowks: [
          { name: 'Koteshwor Chowk', district: 'Kathmandu', sequence: 1, coordinates: [85.3480, 27.6770], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Dhulikhel Bus Stand', district: 'Kavrepalanchok', sequence: 2, coordinates: [85.5560, 27.6250], estimatedMinutesFromStart: 45, fareFromStart: 120 },
          { name: 'Bardibas Junction Chowk', district: 'Mahottari', sequence: 3, coordinates: [85.9000, 26.9800], estimatedMinutesFromStart: 240, fareFromStart: 650 },
          { name: 'Janakpur Dham Bus Stand', district: 'Dhanusha (Janakpur)', sequence: 4, coordinates: [85.9240, 26.7270], estimatedMinutesFromStart: 320, fareFromStart: 850 }
        ]
      },

      // 8. Western Highway Deluxe (Kathmandu - Dhangadhi)
      {
        busName: 'Sudurpashchim Super Highway Coach',
        busNumber: 'SE-01-KHA-9944',
        registrationNumber: 'SE 1 KHA 9944',
        operatorId: operator?._id,
        driverId: driver?._id,
        contactPhone: '+977 9848011992',
        originCountry: 'Nepal',
        originProvince: 'Bagmati Province',
        originDistrict: 'Kathmandu',
        originChowk: 'Gongabu New Bus Park',
        destCountry: 'Nepal',
        destProvince: 'Sudurpashchim Province',
        destDistrict: 'Kailali',
        destinationChowk: 'Dhangadhi Chauraha',
        busType: 'Sleeper Coach',
        baseFare: 2200,
        capacity: 32,
        verificationStatus: 'verified',
        bluebookNumber: 'BB-DHN-99441',
        routePermitNumber: 'RP-DOTM-2024-08',
        insurancePolicyNumber: 'INS-SIC-99440',
        currentLocation: { type: 'Point', coordinates: [81.7000, 28.1500] }, // Near Kohalpur
        currentChowkIndex: 4,
        isLive: true,
        currentSpeed: 65,
        payoutDetails: {
          esewaId: '9848011992',
          khaltiId: '9848011992',
          bankName: 'Rastriya Banijya Bank',
          accountNumber: '440192837461',
          accountHolderName: 'Sudurpashchim Yatayat Pvt Ltd'
        },
        routeChowks: [
          { name: 'Gongabu New Bus Park', district: 'Kathmandu', sequence: 1, coordinates: [85.3120, 27.7340], estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: 'Mugling Bazaar Chowk', district: 'Chitwan', sequence: 2, coordinates: [84.5560, 27.8580], estimatedMinutesFromStart: 180, fareFromStart: 500 },
          { name: 'Butwal Traffic Chowk', district: 'Rupandehi', sequence: 3, coordinates: [83.4600, 27.7000], estimatedMinutesFromStart: 360, fareFromStart: 950 },
          { name: 'Kohalpur Chauraha', district: 'Banke (Nepalgunj)', sequence: 4, coordinates: [81.7000, 28.1500], estimatedMinutesFromStart: 600, fareFromStart: 1600 },
          { name: 'Attariya Traffic Chowk', district: 'Kailali', sequence: 5, coordinates: [80.5500, 28.8200], estimatedMinutesFromStart: 780, fareFromStart: 2050 },
          { name: 'Dhangadhi Chauraha', district: 'Kailali', sequence: 6, coordinates: [80.5900, 28.7000], estimatedMinutesFromStart: 820, fareFromStart: 2200 }
        ]
      }
    ];

    for (let b of busesToAdd) {
      await Bus.findOneAndUpdate(
        { busNumber: b.busNumber },
        b,
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`✓ Seeded & Verified: [${b.busNumber}] ${b.busName} (${b.originDistrict} ➔ ${b.destDistrict})`);
    }

    console.log('\n✅ Successfully added 8 active buses across all major corridors in Nepal!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedFleet();
