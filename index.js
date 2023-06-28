// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create Express server
const app = express();

// Set up middleware
app.use(bodyParser.json());

// Set up rooms array
let rooms = [
    {
        "id": 1,
        "name": "Oyo",
        "capacity": "5",
        "amenities": "Free breakfast, Free WiFi internet access, Free parking",
        "price_per_hour": 10,
        "bookings": [1,2,3,4,5]
    },
    {
        "id": 2,
        "name": "AirBnb",
        "capacity": "4",
        "amenities": "Private Pool, Superhost",
        "price_per_hour": 7,
        "bookings": [1,2,3,4]
    }
];

// Set up bookings array
let bookings = [];

// Endpoint to create a room
app.post('/api/rooms', (req, res) => {
  const room = {
    id: rooms.length + 1,
    name: req.body.name,
    capacity: req.body.capacity,
    amenities: req.body.amenities,
    price_per_hour: req.body.price_per_hour,
    bookings: []
  };
  rooms.push(room);
  res.json(room);
});

// Endpoint to book a room
app.post('/api/bookings', (req, res) => {
  const room = rooms.find(r => r.id === req.body.room_id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  const bookingDate = req.body.date;
  const startTime = req.body.start_time;
  const endTime = req.body.end_time;
  const isBooked = room.bookings.some(booking => {
    return booking.date === bookingDate &&
           booking.start_time === startTime &&
           booking.end_time === endTime;
  });
  if (isBooked) {
    return res.status(409).json({ error: 'Room already booked at this time' });
  }
  const booking = {
    id: bookings.length + 1,
    customer_name: req.body.customer_name,
    date: bookingDate,
    start_time: startTime,
    end_time: endTime,
    room_id: room.id
  };
  bookings.push(booking);
  room.bookings.push({
    id: booking.id,
    date: bookingDate,
    start_time: startTime,
    end_time: endTime
  });
  res.json(booking);
});

// Endpoint to list all rooms with bookings
app.get('/api/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => {
    const bookingsWithRoomName = room.bookings.map(booking => {
      return {
        id: booking.id,
        customer_name: booking.customer_name,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        room_name: room.name
      };
    });
    return {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      amenities: room.amenities,
      price_per_hour: room.price_per_hour,
      bookings: bookingsWithRoomName
    };
  });
  res.json(roomsWithBookings);
});

// Endpoint to list all customers with bookings
app.get('/api/customers', (req, res) => {
  const customersWithBookings = [];
  bookings.forEach(booking => {
    const customer = customersWithBookings.find(c => c.name === booking.customer_name);
    if (customer) {
      customer.bookings.push({
        id: booking.id,
        room_name: rooms.find(room => room.id === booking.room_id).name,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time
      });
    } else {
      customersWithBookings.push({
        name: booking.customer_name,
        bookings: [{
          id: booking.id,
          room_name: rooms.find(room => room.id === booking.room_id).name,
          date: booking.date, // Fix: include date from booking
          start_time: booking.start_time,
          end_time: booking.end_time
        }]
      });
    }
  });
  res.json(customersWithBookings);
});

// Start server
app.listen(process.env.PORT || 4000, () => console.log('Server started on port 4000'));
