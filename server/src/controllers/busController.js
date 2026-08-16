const { Bus, User } = require('../models');
const LostFound = require('../models/LostFound');
const { calculateLegalMaxFare } = require('../utils/fareEngine');

// Public Commuter View: Only returns verified buses with owner payout details
const getAllBuses = async (req, res) => {
  try {
    const { country, stateProvince, district, originChowk, destinationChowk, busType } = req.query;
    let filter = { verificationStatus: 'verified' };

    if (country && country !== 'all') {
      filter.$or = [{ originCountry: country }, { destCountry: country }];
    }
    if (stateProvince && stateProvince !== 'all') {
      filter.$or = [{ originProvince: stateProvince }, { destProvince: stateProvince }];
    }
    if (district && district !== 'all') {
      filter.$or = [{ originDistrict: district }, { destDistrict: district }, { 'routeChowks.district': district }];
    }
    if (busType && busType !== 'all') {
      filter.busType = busType;
    }

    let buses = await Bus.find(filter)
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating')
      .populate('operatorId', 'name phone email')
      .sort({ updatedAt: -1 });

    if (originChowk || destinationChowk) {
      buses = buses.filter(b => {
        const matchesOrigin = !originChowk || 
          b.originChowk.toLowerCase().includes(originChowk.toLowerCase().trim()) ||
          b.routeChowks.some(c => c.name.toLowerCase().includes(originChowk.toLowerCase().trim()));

        const matchesDest = !destinationChowk || 
          b.destinationChowk.toLowerCase().includes(destinationChowk.toLowerCase().trim()) ||
          b.routeChowks.some(c => c.name.toLowerCase().includes(destinationChowk.toLowerCase().trim()));

        return matchesOrigin && matchesDest;
      });
    }

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Operator Fleet View
const getOperatorBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ operatorId: req.user.id })
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Compliance View
const getAdminComplianceBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('operatorId', 'name email phone operatorKyc')
      .populate('driverId', 'name phone averageRating')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Bus with Owner Payout and KYC Data
const createBus = async (req, res) => {
  try {
    const {
      busNumber, busName, registrationNumber,
      originCountry, originProvince, originDistrict, originChowk,
      destCountry, destProvince, destDistrict, destinationChowk,
      busType, baseFare, capacity, contactPhone, driverId, routeChowks,
      bluebookNumber, routePermitNumber, permitValidityZone, insurancePolicyNumber,
      payoutDetails
    } = req.body;

    const exists = await Bus.findOne({
      $or: [
        { busNumber: busNumber.toUpperCase().trim() },
        { registrationNumber: registrationNumber.toUpperCase().trim() }
      ]
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Bus number or registration plate is already registered.' });
    }

    const defaultOriginCoords = originCountry === 'India' ? [77.2090, 28.6139] : [85.3120, 27.7340];
    const defaultDestCoords = destCountry === 'India' ? [85.1376, 25.5941] : [83.9856, 28.2096];

    const { totalDistanceKm, maxLegalCeiling, currency } = calculateLegalMaxFare(
      defaultOriginCoords,
      defaultDestCoords,
      routeChowks,
      busType,
      originCountry || 'Nepal'
    );

    const submittedFare = Number(baseFare);
    if (submittedFare > maxLegalCeiling) {
      return res.status(400).json({
        success: false,
        message: `PRICE GOUGING VIOLATION: Submitted fare of ${currency} ${submittedFare} exceeds the legal government ceiling of ${currency} ${maxLegalCeiling} for this corridor.`
      });
    }

    if (!bluebookNumber || !routePermitNumber || !insurancePolicyNumber) {
      return res.status(400).json({
        success: false,
        message: 'KYC REJECTION: Vehicle Bluebook Number, Route Permit, and Insurance Policy are mandatory.'
      });
    }

    let routeType = 'Local City Transit';
    if (originCountry !== destCountry) routeType = 'Inter-State / Cross-Border';
    else if (originDistrict !== destDistrict) routeType = 'Inter-District Highway Express';

    const fullRouteChowks = (routeChowks && routeChowks.length > 0)
      ? routeChowks
      : [
          { name: originChowk, district: originDistrict, sequence: 1, coordinates: defaultOriginCoords, estimatedMinutesFromStart: 0, fareFromStart: 0 },
          { name: destinationChowk, district: destDistrict, sequence: 2, coordinates: defaultDestCoords, estimatedMinutesFromStart: 240, fareFromStart: submittedFare }
        ];

    const initialStatus = req.user.role === 'operator' ? 'pending_verification' : 'verified';

    const newBus = await Bus.create({
      busNumber: busNumber.toUpperCase().trim(),
      busName: busName.trim(),
      registrationNumber: registrationNumber.toUpperCase().trim(),
      operatorId: req.user.id,
      payoutDetails: payoutDetails || {
        esewaId: contactPhone || '9851000000',
        khaltiId: contactPhone || '9851000000',
        upiId: 'transit.operator@upi',
        bankName: 'Nabil Bank / SBI',
        accountNumber: '01200175000000',
        accountHolderName: busName
      },
      documents: {
        bluebookNumber: bluebookNumber.trim(),
        routePermitNumber: routePermitNumber.trim(),
        permitValidityZone: permitValidityZone || 'National Highway Corridor',
        insurancePolicyNumber: insurancePolicyNumber.trim()
      },
      verificationStatus: initialStatus,
      originCountry: originCountry || 'Nepal',
      originProvince: originProvince || 'Bagmati Province',
      originDistrict: originDistrict || 'Kathmandu',
      originChowk: originChowk.trim(),
      destCountry: destCountry || 'Nepal',
      destProvince: destProvince || 'Gandaki Province',
      destDistrict: destDistrict || 'Kaski (Pokhara)',
      destinationChowk: destinationChowk.trim(),
      routeType,
      busType: busType || 'AC Deluxe',
      baseFare: submittedFare,
      maxLegalFareCeiling: maxLegalCeiling,
      calculatedDistanceKm: totalDistanceKm,
      capacity: Number(capacity) || 40,
      contactPhone: contactPhone || req.user.phone || '+977 9800000000',
      driverId: driverId || null,
      routeChowks: fullRouteChowks,
      lastLocation: {
        type: 'Point',
        coordinates: defaultOriginCoords,
        speed: 45,
        heading: 90,
        currentChowkIndex: 0,
        updatedAt: new Date()
      }
    });

    const populated = await Bus.findById(newBus._id).populate('driverId', 'name phone averageRating');
    res.status(201).json({
      success: true,
      message: initialStatus === 'pending_verification' 
        ? 'Bus submitted for verification. Admin will review KYC documents.'
        : 'Bus created and verified.',
      bus: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Bus details or Owner Payout Settings
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('driverId', 'name phone averageRating')
      .populate('substituteDriverId', 'name phone averageRating');

    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.status(200).json({ success: true, message: 'Bus updated.', bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyBus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    bus.verificationStatus = status;
    if (status === 'verified') {
      bus.rejectionReason = '';
    } else if (status === 'rejected') {
      bus.rejectionReason = rejectionReason || 'KYC document verification failed.';
    }
    await bus.save();

    res.status(200).json({ success: true, message: `Bus verification status set to ${status}.`, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBusLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude, speed, heading, occupancy, crowdStatus, currentChowkIndex } = req.body;
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    bus.lastLocation = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
      speed: Number(speed) || 40,
      heading: Number(heading) || 0,
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

const createLostFound = async (req, res) => {
  try {
    const ticket = await LostFound.create(req.body);
    res.status(201).json({ success: true, message: 'Lost item ticket created.', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
  getOperatorBuses,
  getAdminComplianceBuses,
  createBus,
  verifyBus,
  updateBus,
  updateBusLocation,
  deleteBus,
  createLostFound
};