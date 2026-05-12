import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite/React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DonorMap = ({ centerLat, centerLng, donors, radiusKm }) => {
  const position = [centerLat || 17.3850, centerLng || 78.4867];

  return (
    <MapContainer center={position} zoom={12} style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Hospital/Center Marker */}
      <Marker position={position}>
        <Popup>
          <strong>Requesting Location</strong>
        </Popup>
      </Marker>

      {/* Radius Circle */}
      {radiusKm && (
        <Circle 
          center={position} 
          pathOptions={{ fillColor: '#C0392B', color: '#C0392B', fillOpacity: 0.1 }} 
          radius={radiusKm * 1000} 
        />
      )}

      {/* Donor Markers */}
      {donors?.map((donor) => (
        <Marker key={donor.id} position={[donor.latitude, donor.longitude]}>
          <Popup>
            <strong>{donor.name}</strong><br/>
            Blood Type: {donor.bloodType.replace('_', '+').replace('POS', '').replace('NEG', '-')}<br/>
            Readiness: {donor.readinessScore}/100<br/>
            Distance: {donor.distance?.toFixed(1)} km
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DonorMap;
