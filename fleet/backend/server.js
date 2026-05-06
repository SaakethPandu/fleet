const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const defaultOrigins = ['http://localhost:3000'];
const envOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());

const deliveryZones = [
  {
    id: 1,
    name: 'Central Zone',
    color: '#3b82f6',
    points: [
      [17.392, 78.476],
      [17.392, 78.495],
      [17.378, 78.495],
      [17.378, 78.476],
    ],
  },
  {
    id: 2,
    name: 'East Zone',
    color: '#f97316',
    points: [
      [17.395, 78.496],
      [17.395, 78.513],
      [17.381, 78.513],
      [17.381, 78.496],
    ],
  },
];

const drivers = [
  { id: 1, name: 'Driver 1', lat: 17.385, lng: 78.486, speedLat: 0.00055, speedLng: 0.00035, route: [] },
  { id: 2, name: 'Driver 2', lat: 17.389, lng: 78.491, speedLat: 0.0003, speedLng: -0.00042, route: [] },
  { id: 3, name: 'Driver 3', lat: 17.382, lng: 78.498, speedLat: -0.0005, speedLng: 0.00028, route: [] },
  { id: 4, name: 'Driver 4', lat: 17.394, lng: 78.484, speedLat: -0.00036, speedLng: 0.00044, route: [] },
  { id: 5, name: 'Driver 5', lat: 17.388, lng: 78.505, speedLat: 0.00027, speedLng: -0.00037, route: [] },
];

const orders = [
  { id: 101, driverId: 1, statusIndex: 0 },
  { id: 102, driverId: 2, statusIndex: 1 },
  { id: 103, driverId: 3, statusIndex: 2 },
  { id: 104, driverId: 4, statusIndex: 0 },
  { id: 105, driverId: 5, statusIndex: 1 },
];

const orderStatuses = ['Picked', 'Out for delivery', 'Delivered'];

function clampToBounds(driver) {
  if (driver.lat > 17.398 || driver.lat < 17.376) {
    driver.speedLat *= -1;
  }
  if (driver.lng > 78.515 || driver.lng < 78.474) {
    driver.speedLng *= -1;
  }
}

function updateDriverPositions() {
  drivers.forEach((driver) => {
    driver.lat += driver.speedLat;
    driver.lng += driver.speedLng;
    clampToBounds(driver);

    driver.route.push([Number(driver.lat.toFixed(6)), Number(driver.lng.toFixed(6))]);
    if (driver.route.length > 20) {
      driver.route.shift();
    }
  });
}

function rotateOrderStatuses() {
  orders.forEach((order) => {
    if (Math.random() > 0.45) {
      order.statusIndex = (order.statusIndex + 1) % orderStatuses.length;
    }
  });
}

function getDriversPayload() {
  return drivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    lat: Number(driver.lat.toFixed(6)),
    lng: Number(driver.lng.toFixed(6)),
    route: driver.route,
  }));
}

function getOrdersPayload() {
  return orders.map((order) => ({
    id: order.id,
    driverId: order.driverId,
    status: orderStatuses[order.statusIndex],
  }));
}

app.get('/drivers', (req, res) => {
  res.json(getDriversPayload());
});

app.get('/orders', (req, res) => {
  res.json(getOrdersPayload());
});

app.get('/zones', (req, res) => {
  res.json(deliveryZones);
});

io.on('connection', (socket) => {
  socket.emit('drivers:update', getDriversPayload());
  socket.emit('orders:update', getOrdersPayload());
  socket.emit('zones:update', deliveryZones);
});

setInterval(() => {
  updateDriverPositions();
  rotateOrderStatuses();

  io.emit('drivers:update', getDriversPayload());
  io.emit('orders:update', getOrdersPayload());
}, 3000);

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});