// Haversine formula to calculate distance between two lat/lng coordinates in km
function haversineDistance(coords1, coords2) {
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

module.exports = { haversineDistance };
