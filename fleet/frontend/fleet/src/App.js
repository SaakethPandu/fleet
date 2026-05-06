import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

const defaultCenter = [17.386, 78.492];

function App() {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/drivers').then((res) => setDrivers(res.data)).catch(() => {});
    axios.get('http://localhost:5000/orders').then((res) => setOrders(res.data)).catch(() => {});
    axios.get('http://localhost:5000/zones').then((res) => setZones(res.data)).catch(() => {});

    socket.on('drivers:update', (payload) => setDrivers(payload));
    socket.on('orders:update', (payload) => setOrders(payload));
    socket.on('zones:update', (payload) => setZones(payload));

    return () => {
      socket.off('drivers:update');
      socket.off('orders:update');
      socket.off('zones:update');
    };
  }, []);

  const ordersByDriver = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      map[order.driverId] = order;
    });
    return map;
  }, [orders]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Live Map Tracking</h1>
        <p>{drivers.length} active drivers visible in real time</p>
      </header>

      <div className="content-grid">
        <section className="map-panel">
          <MapContainer center={defaultCenter} zoom={13} className="map-view" scrollWheelZoom>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {zones.map((zone) => (
              <Polygon
                key={zone.id}
                positions={zone.points}
                pathOptions={{ color: zone.color, fillOpacity: 0.16, weight: 2 }}
              >
                <Popup>{zone.name}</Popup>
              </Polygon>
            ))}

            {drivers.map((driver) => (
              <React.Fragment key={driver.id}>
                <Marker position={[driver.lat, driver.lng]}>
                  <Popup>
                    <strong>{driver.name}</strong>
                    <br />
                    Lat: {driver.lat}, Lng: {driver.lng}
                    <br />
                    Status: {ordersByDriver[driver.id]?.status || 'Waiting'}
                  </Popup>
                </Marker>
                {Array.isArray(driver.route) && driver.route.length > 1 && (
                  <Polyline positions={driver.route} pathOptions={{ color: '#22c55e', weight: 4 }} />
                )}
              </React.Fragment>
            ))}
          </MapContainer>
        </section>

        <aside className="status-panel">
          <h2>Live Order Status</h2>
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                <span>Order #{order.id}</span>
                <span>{order.status}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default App;

  