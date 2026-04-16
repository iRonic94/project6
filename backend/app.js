//user PW admin
//mongodb+srv://test:<db_password>@clusterpractice.lzalvcr.mongodb.net/ mongoDB connection
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use(bodyParser.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
