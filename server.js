// Creating a server
// 1. touch server.js
// 1.5 touch .eslintrc.json
// 1.5 touch .env
// 2. run `npm init` (say yes to everything) (creates package.json)
// 3. GET THE SERVER RUNNING
// 4. install the packages (libraries) `npm install <PACKAGENAME> <PACKAGENAME> <ETC>`
//    on day 6- those are express and dotenv
//    dotenv : loads the environment file (".env") for us
//    express: the app itself - runs the server (http requests, responses, cookies, servery things)
//    cors: allows local testing of our server
// 5. in the js file - load the packages
// 6. configure the `app`
// 7. tell the server to listen on the port
// 8. start writing routes to handle requests from the client

// // ================ Packages =======================

// const express = require('express');
// require('dotenv').config(); // reads the file : `.env`
// const cors  = require('cors');

// // ============= Global variables =====================

// const PORT = process.env.PORT || 3003; // short cuircuiting and choosing PORT if it exists in the env, otherwise 3003
// const app = express();
// app.use(cors()); // enables the server to talk to local things

// // ================ Routes =============================

// // from the front end : $.ajax('http://localhost:3000/location', options)
// // because my front end makes a request to the /location route, my route needs the name `/location`

// app.get('/location', (request, response) =>{
//   // load json from file
//   // pass it through the constructor
//   // send it to the front end

//   const jsonObject = require('./data/location.json');
//   const constructedLocation = new Location(jsonObject);

//   response.send(constructedLocation);
// });


// // Process for a route
// // if we are given example data that works, just try sending it, if it works, you are going in the right path

// app.get('/restaurants', sendRestaurantData);

// function sendRestaurantData(request, response){
//   // read the json file
//   // format the data
//   // send it with .send

//   const jsonObj = require('./data/restaurants.json');
//   const arrFromJson = jsonObj.nearby_restaurants;
//   const newArr = [];

//   // request.query is where the question always lives (Amelia asks for 3 claps -> request.query.claps)
//   if(request.query.city !== 'Lynnwood'){
//     // tell them off (constructively)
//     return response.status(500).send('try something more like `Lynnwood`');
//   }

//   arrFromJson.forEach(objInTheJSON => {
//     const newRest = new Restaurant(objInTheJSON);
//     newArr.push(newRest);
//   });
//   // for each obj in the json file, make a constructed obj and put it in arr
//   // send arr
//   response.send(newArr);
// }

// // =================== All other functions ===================

// function Location(jsonObject){
//   console.log(jsonObject);

//   this.formatted_query = jsonObject[0].display_name;
//   this.latitude = jsonObject[0].lat;
//   this.longitude = jsonObject[0].lon;

// }

// function Restaurant(jsonObject){
//   console.log(jsonObject);
//   this.restaurant = jsonObject.restaurant.name;
//   this.cuisines= jsonObject.restaurant.cuisines;
//   this.locality = jsonObject.restaurant.location.locality_verbose;
// }

// // ================ Start the server ==========================

// app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));