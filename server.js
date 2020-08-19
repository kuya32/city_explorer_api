// ================ Packages =======================

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

// ============= Global variables =====================

const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());

// ================ Weather API Route =============================

app.get('/location', (req, res) => {

  const cityToSearchFor = req.query.city;
  const locationKey = process.env.GEOCODE_API_KEY;
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${cityToSearchFor}&format=json`;
  superagent.get(urlToSearch)
    .then(randomStuff => {
      const superagentResultArray = randomStuff.body;
      const createdLocation = new Location(superagentResultArray);
      res.send(createdLocation);
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
});

// ================ Weather API Route =============================

app.get('/weather', sendWeatherData);

function sendWeatherData(req, res) {
  const cityToSearchFor = req.query.formatted_query.split(',')[0];
  const weatherKey = process.env.WEATHER_API_KEY;
  const urlToSearch = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityToSearchFor}&key=${weatherKey}`;

  superagent.get(urlToSearch)

    .set('key', weatherKey)
    .then(resultFromWeatherbit => {
      const jsonObj2 = resultFromWeatherbit.body;
      let weatherArray = jsonObj2.data.map(objInJson => {
        const newWeather = new Weather(objInJson);
        return newWeather;
      });
      weatherArray = weatherArray.slice(0,8);
      res.send(weatherArray);
    });
}

// ================ Trail API Route =============================

app.get('/trails', sendTrailData);

function sendTrailData(req, res) {
  const hikeKey = process.env.TRAIL_API_KEY;
  const latInfo = req.query.latitude;
  const lonInfo = req.query.longitude;
  const urlToSearch = `https://www.hikingproject.com/data/get-trails?lat=${latInfo}&lon=${lonInfo}&maxDistance=10&key=${hikeKey}`;

  superagent.get(urlToSearch)
    .set('key', hikeKey)
    .then(resultFromHiking => {
      const jsonObj3 = resultFromHiking.body;
      // console.log(jsonObj3);
      let hikeArray = jsonObj3.trails.map(objInJson => {
        const newHike = new Hike(objInJson);
        return newHike;
      });
      hikeArray = hikeArray.slice(0, 10);
      res.send(hikeArray);
    });
}

// =================== All other functions ===================

function Location(superagentResultArray) {
  // this.search_query = superagentResultArray[0].
  this.formatted_query = superagentResultArray[0].display_name;
  this.latitude = superagentResultArray[0].lat;
  this.longitude = superagentResultArray[0].lon;
}

function Weather(jsonObj2) {
  this.forecast = jsonObj2.weather.description;
  this.time = jsonObj2.valid_date;
}

function Hike(jsonObj3) {
  this.name = jsonObj3.name;
  this.location = jsonObj3.location;
  this.length = jsonObj3.length;
  this.stars = jsonObj3.stars;
  this.star_votes = jsonObj3.starVotes;
  this.summary = jsonObj3.summary;
  this.conditions = jsonObj3.conditionStatus;
  this.condition_date = jsonObj3.conditionDate;
  this.condition_time = jsonObj3.conditionDetails;
}
// ================ Start the server ==========================

app.listen(PORT, () => console.log(`up on ${PORT}, its over ${PORT}!!!`));
