// ================ Packages =======================

const express = require('express');
require('dotenv').config();
const cors = require('cors');

// ============= Global variables =====================

const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());


// ================ Routes =============================

app.get('/location', (req, res) => {
  const jsonObj= require('./data/location.json');
  const createdLocation = new Location(jsonObj);


  if(req.query.city !== 'Lynwood') {
    return res.status(500).send('Try typing in `Lynnwood`');
  }

  res.send(createdLocation);
});

app.get('/weather', sendWeatherData);

function sendWeatherData(req, res) {
  const jsonObj2 = require('./data/weather.json');
  const newArray = [];

  jsonObj2.forEach(objInJson => {
    const newWeather = new Weather(objInJson);
    newArray.push(newWeather);
  });
  res.send(newArray);
}

// =================== All other functions ===================

function Location(jsonObj) {
  this.search_query = jsonObj[0].display_name;
  this.formatted_query = jsonObj[0].display_name;
  this.latitude = jsonObj[0].lat;
  this.longitude = jsonObj[0].lon;
}

function Weather(jsonObj2) {
  this.forecast = jsonObj2.weather.description;
  this.time = jsonObj2.valid_date;
}

// ================ Start the server ==========================

app.listen(PORT);
