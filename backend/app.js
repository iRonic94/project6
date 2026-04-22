//user PW admin
//mongodb+srv://test:<db_password>@clusterpractice.lzalvcr.mongodb.net/ mongoDB connection
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://admin:admin@clusterpractice.lzalvcr.mongodb.net/')
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });



app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//allow which static folder to serve
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(bodyParser.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
