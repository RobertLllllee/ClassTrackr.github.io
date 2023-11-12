// Without Exceeding 10 meters functions Only location checking functions
// Define the corners of your campus and acceptable altitude range
// var campusCorners = [
//   {lat: 3.0740292340004967, lon: 101.59073576831219}, 
//   {lat: 3.074741674724174, lon: 101.59178987640011},
//   {lat: 3.074345279192275, lon: 101.59178987640011},
//   {lat: 3.0743426008435777, lon: 101.59213319913613},
//   {lat: 3.0745997222871027, lon: 101.59213319913613},
//   {lat: 3.0745997222871027, lon: 101.59286275995017},
//   {lat: 3.0735042773733623, lon: 101.59286544215904},
//   {lat: 3.0735042773733623, lon: 101.59133121868247},
//   {lat: 3.0740479824466975, lon: 101.59132585426471},
//   {lat: 3.0740345906994437, lon: 101.59073040389445},
//   ];

//   var minAltitude = -100; // Replace with minimum acceptable altitude
//   var maxAltitude = 100; // Replace with maximum acceptable altitude
  
//   // Check if a point is within the campus
//   function isWithinCampus(lat, lon, alt) {
//     var x = lat, y = lon;
  
//     var inside = false;
//     for (var i = 0, j = campusCorners.length - 1; i < campusCorners.length; j = i++) {
      // var xi = campusCorners[i].lat, yi = campusCorners[i].lon;
      // var xj = campusCorners[j].lat, yj = campusCorners[j].lon;
  
    //   var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    //   if (intersect) inside = !inside;
    // }
  
//     return inside && alt >= minAltitude && alt <= maxAltitude;
//   }
  
//   navigator.geolocation.getCurrentPosition(function(position) {
//     var lat = position.coords.latitude;
//     var lon = position.coords.longitude;
//     var alt = position.coords.altitude;
  
//     if (isWithinCampus(lat, lon, alt)) {
//       console.log("Attendance taken successfully");
//     } else {
//       console.log("You are not around the area, please try again");
//     }
//   });
  

//With Exceeding 10 meters functions and location track and check functions
// Define the corners of your campus and acceptable altitude range
var campusCorners = [
    {lat: 3.0740292340004967, lon: 101.59073576831219}, 
    {lat: 3.074741674724174, lon: 101.59178987640011},
    {lat: 3.074345279192275, lon: 101.59178987640011},
    {lat: 3.0743426008435777, lon: 101.59213319913613},
    {lat: 3.0745997222871027, lon: 101.59213319913613},
    {lat: 3.0745997222871027, lon: 101.59286275995017},
    {lat: 3.0735042773733623, lon: 101.59286544215904},
    {lat: 3.0735042773733623, lon: 101.59133121868247},
    {lat: 3.0740479824466975, lon: 101.59132585426471},
    {lat: 3.0740345906994437, lon: 101.59073040389445},
];

var minAltitude = -100; // Replace with minimum acceptable altitude
var maxAltitude = 100; // Replace with maximum acceptable altitude

var userInside = false;
var userLeftTime = null;

// Function to check if a point is within the campus
function isWithinCampus(lat, lon, alt) {
  var x = lat, y = lon;
  var inside = false;

  for (var i = 0, j = campusCorners.length - 1; i < campusCorners.length; j = i++) {
    // Define intersection logic as before
    var xi = campusCorners[i].lat, yi = campusCorners[i].lon;
    var xj = campusCorners[j].lat, yj = campusCorners[j].lon;
    
    var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside && alt >= minAltitude && alt <= maxAltitude;
}

// Function to set user attendance to 'absent' after 10 minutes
function setAttendanceToAbsent() {
  if (!userInside) {
    console.log("User attendance set to absent.");
  }
}

navigator.geolocation.getCurrentPosition(function (position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var alt = position.coords.altitude;

  if (isWithinCampus(lat, lon, alt)) {
    userInside = true;
    console.log("Attendance taken successfully");

    // Set a timeout for 5 minutes to warn the user if they leave the area
    setTimeout(function () {
      if (!userInside) {
        console.log("Warning: You have left the area.");
        userLeftTime = new Date();
      }
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Set a timeout for 10 minutes to mark attendance as 'absent'
    setTimeout(setAttendanceToAbsent, 10 * 60 * 1000); // 10 minutes in milliseconds
  } else {
    console.log("You are not around the area, please try again");
    userLeftTime = new Date();
  }
});

// Function to check if the user is 10 meters away from the campus
function isTenMetersAway(lat, lon) {
  if (!userInside) return false;

  var lastPosition = campusCorners[campusCorners.length - 1]; // Last point in the campus
  var lastLat = lastPosition.lat;
  var lastLon = lastPosition.lon;

  // Calculate the distance between the current location and the last campus corner
  var distance = Math.sqrt((lat - lastLat) ** 2 + (lon - lastLon) ** 2);
  return distance >= 0.00009; // 0.00009 represents approximately 10 meters
}

// Function to warn the user if they are 10 meters away from the campus
function warnUserIfTenMetersAway(lat, lon) {
  if (isTenMetersAway(lat, lon)) {
    console.log("Warning: You are 10 meters away from the campus.");
  }
}

// Periodically check if the user is 10 meters away (every 5 seconds)
setInterval(function () {
  if (userLeftTime && (new Date() - userLeftTime) >= 5 * 60 * 1000) {
    warnUserIfTenMetersAway(lat, lon);
  }
}, 5 * 1000); // 5 seconds in milliseconds
