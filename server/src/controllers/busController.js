const { Bus, User } = require('../models');
const LostFound = require('../models/LostFound');

const SEED_CHOWK_BUSES = [
  {
    busNumber: 'BA-01-KHA-8822',
    busName: 'Kathmandu-Pokhara Deluxe AC',
    registrationNumber: 'BA 2 KHA 8822',
    country: 'Nepal',
    stateProvince: 'Bagmati Province',
    district: 'Kathmandu',
    busType: 'AC Deluxe',
    originChowk: 'Gongabu Bus Park',
    destinationChowk: 'Prithvi Chowk (Pokhara)',
    baseFare: 1100,
    capacity: 36,
    currentOccupancy: 18,
    crowdStatus: 'vacant',
    contactPhone: '+977 9851122334',
    status: 'active',
    lastLocation: { type: 'Point', coordinates: [85.1500, 27.7500], speed: 48, heading: 280, currentChowkIndex: 1, updatedAt: new Date() },
    routeChowks: [
      { name: 'Gongabu Bus Park', sequence: 1, coordinates: [85.3120, 27.7340], estimatedMinutesFromStart: 0, fareFromStart: 0 },
      { name: 'Kalanki Chowk', sequence: 2, coordinates: [85.2810, 27.6930], estimatedMinutesFromStart: 25, fareFromStart: 50 },
      { name: 'Naubise Chowk', sequence: 3, coordinates: [85.1630, 27.7260], estimatedMinutesFromStart: 70, fareFromStart: 200 },
      { name: 'Malekhu Chowk', sequence: 4, coordinates: [84.8250, 27.8100], estimatedMinutesFromStart: 130, fareFromStart: 450 },
      { name: 'Mugling Chowk', sequence: 5, coordinates: [84.5560, 27.8580], estimatedMinutesFromStart: 200, fareFromStart: 750 },
      { name: 'Damauli Chowk', sequence: 6, coordinates: [84.2810, 27.9730], estimatedMinutesFromStart: 270, fareFromStart: 950 },
      { name: 'Prithvi Chowk (Pokhara)', sequence: 7, coordinates: [83.9856, 28.2096], estimatedMinutesFromStart: 340, fareFromStart: 1100 }
    ]
  },
  {
    busNumber: 'NA-04-KHA-1945',
    busName: 'Birgunj-Kathmandu Highline',
    registrationNumber: 'NA 4 KHA 1945',
    country: 'Nepal',
    stateProvince: 'Madhesh Province',
    district: 'Parsa (Birgunj)',
    busType: 'Express',
    originChowk: 'Birgunj Ghantaghar',
    destinationChowk: 'Balkhu Chowk (Kathmandu)',
    baseFare: 800,
    capacity: 42,
    currentOccupancy: 38,
    crowdStatus: 'moderate',
    contactPhone: '+977 9812987654',
    status: 'active',
    lastLocation: { type: 'Point', coordinates: [85.0500, 27.2500], speed: 55, heading: 15, currentChowkIndex: 2, updatedAt: new Date() },
    routeChowks: [
      { name: 'Birgunj Ghantaghar', sequence: 1, coordinates: [84.8770, 27.0130], estimatedMinutesFromStart: 0, fareFromStart: 0 },
      { name: 'Simara Chowk', sequence: 2, coordinates: [84.9810, 27.1580], estimatedMinutesFromStart: 35, fareFromStart: 100 },
      { name: 'Hetauda Chowk', sequence: 3, coordinates: [85.0320, 27.4280], estimatedMinutesFromStart: 90, fareFromStart: 300 },
      { name: 'Balkhu Chowk (Kathmandu)', sequence: 4, coordinates: [85.2970, 27.6850], estimatedMinutesFromStart: 240, fareFromStart: 800 }
    ]
  },
  {
    busNumber: 'DL-01-EXP-7711',
    busName: 'Delhi-Patna Royal Sleeper Coach',
    registrationNumber: 'DL 01 AB 7711',
    country: 'India',
    stateProvince: 'Delhi NCR',
    district: 'New Delhi',
    busType: 'Sleeper Coach',
    originChowk: 'ISBT Kashmere Gate',
    destinationChowk: 'Mithapur Bus Stand (Patna)',
    baseFare: 1500,
    capacity: 34,
    currentOccupancy: 34,
    crowdStatus: 'full',
    contactPhone: '+91 9811223344',
    status: 'active',
    lastLocation: { type: 'Point', coordinates: [82.9739, 25.3176], speed: 65, heading: 115, currentChowkIndex: 2, updatedAt: new Date() },
    routeChowks: [
      { name: 'ISBT Kashmere Gate', sequence: 1, coordinates: [77.2280, 28.6670], estimatedMinutesFromStart: 0, fareFromStart: 0 },
      { name: 'Akshardham Chowk', sequence: 2, coordinates: [77.2770, 28.6180], estimatedMinutesFromStart: 30, fareFromStart: 80 },
      { name: 'Varanasi Cantt Chowk', sequence: 3, coordinates: [82.9739, 25.3176], estimatedMinutesFromStart: 500, fareFromStart: 1100 },
      { name: 'Mithapur Bus Stand (Patna)', sequence: 4, coordinates: [85.1376, 25.5941], estimatedMinutesFromStart: 720, fareFromStart: 1500 }
    ]
  }
];

const seedBuses = async () => {
  const count = await Bus.countDocuments();
  if (count === 0) {
    const drivers = await User.find({ role: 'driver' });
    const formatted = SEED_CHOWK_BUSES.map((b, i) => ({
      ...b,
      driverId: drivers[i % (drivers.length || 1)]?._id || null
    }));
    await Bus.insertMany(formatted);
    console.log('[Transit Engine] Seeded Chowk-wise Bus Database.');
  }
};
seedBuses().catch(console.error);

// Get buses with chowk & regional search
const getAllBuses = async (req, res) => {
  try {
    const { country, stateProvince, district, originChowk, destinationChowk, busType } = req.query;
    let filter = {};

    if (country && country !== 'all') filter.country = country;
    if (stateProvince && stateProvince !== 'all') filter.stateProvince = stateProvince;
    if (district && district !== 'all') filter.district = district;
    if (busType && busType !== 'all') filter.busType = busType;

    let buses = await Bus.find(filter)
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating')
      .sort({ updatedAt: -1 });

    // In-memory filter for chowks matching route stops
    if (originChowk || destinationChowk) {
      buses = buses.filter(b => {
        const matchesOrigin = !originChowk || b.routeChowks.some(c => c.name.toLowerCase().includes(originChowk.toLowerCase().trim()));
        const matchesDest = !destinationChowk || b.routeChowks.some(c => c.name.toLowerCase().includes(destinationChowk.toLowerCase().trim()));
        return matchesOrigin && matchesDest;
      });
    }

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update bus details & substitute driver
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating');

    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Driver telemetry emitter
const updateBusLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude, speed, heading, occupancy, crowdStatus, currentChowkIndex } = req.body;
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    bus.lastLocation = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
      speed: Number(speed) || bus.lastLocation.speed || 40,
      heading: Number(heading) || bus.lastLocation.heading || 0,
      currentChowkIndex: currentChowkIndex !== undefined ? Number(currentChowkIndex) : bus.lastLocation.currentChowkIndex,
      updatedAt: new Date()
    };
    bus.status = 'active';
    if (occupancy !== undefined) bus.currentOccupancy = Number(occupancy);
    if (crowdStatus) bus.crowdStatus = crowdStatus;

    await bus.save();
    res.status(200).json({ success: true, lastLocation: bus.lastLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Lost & Found ticket
const createLostFound = async (req, res) => {
  try {
    const ticket = await LostFound.create(req.body);
    res.status(201).json({ success: true, message: 'Lost item report submitted.', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin create bus
const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin delete bus
const deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Bus deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBuses,
  createBus,
  updateBus,
  updateBusLocation,
  deleteBus,
  createLostFound
};