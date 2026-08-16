// Haversine formula to compute distance in KM between two GPS coordinates
const calculateHaversineDistance = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) return 15; // default fallback 15km
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadWindingFactor = 1.35; // Accounts for mountain/highway road bends
  return Math.round(R * c * roadWindingFactor);
};

/**
 * Standard Government Tariff Rates (DoTM Nepal & RTO India):
 * - Base Boarding Charge: NPR 25 / INR 15
 * - Per KM Highway Rate: NPR 2.90/km (Nepal) | INR 1.95/km (India)
 * - Vehicle Class Surcharges:
 *   - Standard Local: 1.0x
 *   - Express: 1.15x
 *   - AC Deluxe: 1.40x
 *   - Super Deluxe: 1.55x
 *   - Sleeper Coach: 1.75x
 */
const calculateLegalMaxFare = (originCoords, destCoords, intermediateChowks = [], busType = 'AC Deluxe', country = 'Nepal') => {
  let totalDistanceKm = 0;
  const allWaypoints = [];

  if (originCoords && originCoords.length === 2) allWaypoints.push(originCoords);
  if (intermediateChowks && intermediateChowks.length > 0) {
    intermediateChowks.forEach((c) => {
      if (c.coordinates && c.coordinates.length === 2) allWaypoints.push(c.coordinates);
    });
  }
  if (destCoords && destCoords.length === 2) allWaypoints.push(destCoords);

  if (allWaypoints.length >= 2) {
    for (let i = 0; i < allWaypoints.length - 1; i++) {
      totalDistanceKm += calculateHaversineDistance(allWaypoints[i], allWaypoints[i + 1]);
    }
  } else {
    totalDistanceKm = 120; // default estimated distance
  }

  const isNepal = country === 'Nepal';
  const baseRate = isNepal ? 30 : 20;
  const perKmRate = isNepal ? 2.90 : 1.95;

  const multipliers = {
    'Standard Local': 1.0,
    'Express': 1.15,
    'AC Deluxe': 1.40,
    'Super Deluxe': 1.55,
    'Sleeper Coach': 1.75
  };

  const multiplier = multipliers[busType] || 1.40;
  const rawFare = (baseRate + totalDistanceKm * perKmRate) * multiplier;
  
  // Round to nearest 10 with 10% maximum legal surge buffer
  const maxLegalCeiling = Math.ceil((rawFare * 1.10) / 10) * 10;

  return {
    totalDistanceKm,
    maxLegalCeiling,
    currency: isNepal ? 'NPR' : 'INR'
  };
};

module.exports = {
  calculateHaversineDistance,
  calculateLegalMaxFare
};