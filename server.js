// ==================== Packages ====================

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const { response } = require('express');

// ==================== Global variables ====================

const PORT = process.env.PORT || 3003;
const app = express();
const locationKey = process.env.GEOCODE_API_KEY;
const databaseUrl = process.env.DATABASE_URL;
const weatherKey = process.env.WEATHER_API_KEY;
const hikeKey = process.env.TRAIL_API_KEY;
const movieKey = process.env.MOVIE_API_KEY;
const resturantKey = process.env.YELP_API_KEY;

// ==================== Express Configs ====================
app.use(cors());
const client = new pg.Client(databaseUrl);
client.on('error', (error) => console.error(error));

// ==================== Routes ====================


// ==================== Location API Route ====================

app.get('/location', getLocation);

function getLocation(req, res) {
  const cityToSearchFor = req.query.city.toLowerCase();

  const select = 'SELECT * FROM cities WHERE search_query=$1';

  client.query(select, [cityToSearchFor])
    .then(resultsFromSql => {

      if(resultsFromSql.rowCount === 1) {
        res.send(resultsFromSql.rows[0]);
      } else {
        const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${locationKey}&q=${cityToSearchFor}&format=json`;

        superagent.get(urlToSearch)
          .then(results => {
            const superagentResultArray = results.body[0];
            const createdLocation = new Location(superagentResultArray);
            res.send(createdLocation);

            const city = createdLocation.search_query.toLowerCase();
            console.log(city);
            const fullCity = createdLocation.formatted_query;
            const lat = parseFloat(createdLocation.latitude);
            const lon = parseFloat(createdLocation.longitude);
            const queryString = 'INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)';
            const locationArray = [city, fullCity, lat, lon];

            client.query(queryString, locationArray)
              .then (() => response.status(201).send('Created a new location'))
              .catch(error => {
                res.status(500).send(error.message);
              });
          });
      }
    });
}

// ==================== Weather API Route ====================

app.get('/weather', sendWeatherData);

function sendWeatherData(req, res) {
  const cityToSearchFor = req.query.formatted_query.split(',')[0];
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
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
}

// ==================== Trail API Route ====================

app.get('/trails', sendTrailData);

function sendTrailData(req, res) {
  const latInfo = req.query.latitude;
  const lonInfo = req.query.longitude;
  const urlToSearch = `https://www.hikingproject.com/data/get-trails?lat=${latInfo}&lon=${lonInfo}&maxDistance=10&key=${hikeKey}`;

  superagent.get(urlToSearch)
    .set('key', hikeKey)
    .then(resultFromHiking => {
      const jsonObj3 = resultFromHiking.body;
      let hikeArray = jsonObj3.trails.map(objInJson => {
        const newHike = new Hike(objInJson);
        return newHike;
      });
      hikeArray = hikeArray.slice(0, 10);
      res.send(hikeArray);
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
}

// ==================== Movies API Route ====================

app.get('/movies', sendMovieData);

function sendMovieData(req, res) { //<--I need to work on finding a request
  const urlToSearch = `https://api.themoviedb.org/3/movie/550?api_key=${movieKey}&callback=test`;//<--I am not sure if this is the right URL for my search

  superagent.get(urlToSearch)
    .set('key', movieKey)
    .then(resultFromMovies => {
      const jsonObj4 = resultFromMovies.body;
      // console.log(jsonObj4);
      let movieArray = jsonObj4.map(objInJson => {//<--Need more information from website URL
        const newMovie = new Movie(objInJson);
        return newMovie;
      });
      res.send(movieArray);
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
}

// ==================== YELP API Route ====================

app.get('/restaurants', sendRestaurantData);

function sendRestaurantData(req,res) {
  const latInfo = req.query.latitude;
  const lonInfo = req.query.longitude;
  // const pageStart = req.query.page * 20; <--Still working on pagination
  const urlToSearch = `https://api.yelp.com/v3/businesses/search?term=delis&latitude=${latInfo}&longitude=${lonInfo}`; //<--Not sure if I am using the right URL for the search

  superagent.get(urlToSearch)
    .set('key', resturantKey)
    .then(resultFromRestaurant => {
      const jsonObj5 = resultFromRestaurant.body;
      // console.log(jsonObj5);
      let restaurantArray = jsonObj5.businesses.map(objInJson => { //Once I am able to get ahold of the YELP data, then I will determine the resaurant array. I think it is businesses
        const newRestaurant = new Restaurant(objInJson);
        return newRestaurant;
      });
      res.send(restaurantArray);
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
}

// ==================== All other functions ====================

function Location(superagentResultArray) {
  this.search_query = superagentResultArray.display_name.split(',')[0];
  this.formatted_query = superagentResultArray.display_name;
  this.latitude = superagentResultArray.lat;
  this.longitude = superagentResultArray.lon;
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
  this.trail_url = jsonObj3.url;
  this.conditions = jsonObj3.conditionStatus;
  this.condition_date = jsonObj3.conditionDate.split(' ')[0];
  this.condition_time = jsonObj3.conditionDate.split(' ')[1];
}

function Movie (jsonObj4) {
  this.title = jsonObj4.title;
  this.overview = jsonObj4.overview;
  this.average_votes = jsonObj4.vote.average;
  this.total_votes = jsonObj4.vote_count;
  this.image_url = jsonObj4.backdrop_path;
  this.popularity = jsonObj4.popularity;
  this.released_on = jsonObj4.release_date;
}

function Restaurant (jsonObj5) {
  this.name = jsonObj5.name;
  this.image_url = jsonObj5.image_url;
  this.price = jsonObj5.price;
  this.rating = jsonObj5.rating;
  this.url = jsonObj5.url;
}

// ==================== Start the server ====================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`up on ${PORT}, its over ${PORT}!!!`));
  });
