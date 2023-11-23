// var campusCorners = [
//   {lat: 3.0885523904305785, lon: 101.68325552738705},
//   {lat: 3.0877328263564507, lon: 101.68331453598228},
//   {lat: 3.0887880819426305, lon: 101.68494531897836},
//   {lat: 3.0879363782770373, lon: 101.68498823432036},
// ];

var campusCorners = [
  {lat: 3.0909113470240244, lon: 101.68094244340399},
  {lat: 3.0857582718844694, lon: 101.68097462991051},
  {lat: 3.0912541702623395, lon: 101.68784108463078},
  {lat: 3.086347502116401, lon: 101.68897834119382},
];

var minAltitude = -100; // Replace with minimum acceptable altitude
var maxAltitude = 100; // Replace with maximum acceptable altitude

var userInside = false;
var userLeftTime = null;

function isWithinCampus(lat, lon, alt) {
  var x = lat,
    y = lon;
  var inside = false;

  for (var i = 0, j = campusCorners.length - 1; i < campusCorners.length; j = i++) {
    var xi = campusCorners[i].lat,
      yi = campusCorners[i].lon;
    var xj = campusCorners[j].lat,
      yj = campusCorners[j].lon;

    var intersect = ((yi > y) != (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  // Only check if inside based on longitude and latitude, ignore altitude
  return inside;
}

function setAttendanceToAbsent() {
  if (!userInside) {
    console.log("User attendance set to absent.");
  }
}

function getLocation(callback) {
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var alt = position.coords.altitude;

    console.log('Current Location:', lat, lon, alt);

    if (isWithinCampus(lat, lon, alt)) {
      userInside = true;
      console.log("Great! You are currently around the campus.");

      setTimeout(function () {
        if (!userInside) {
          console.log("Warning: You have left the area.");
          userLeftTime = new Date();
        }
      }, 5 * 60 * 1000);

      setTimeout(setAttendanceToAbsent, 10 * 60 * 1000);

      if (callback) {
        callback(true);
      }
    } else {
      console.log("You are not around the area, please try again");
      userLeftTime = new Date();

      if (callback) {
        callback(false);
      }
    }
  });
}

function isTenMetersAway(lat, lon) {
  if (!userInside) return false;

  var lastPosition = campusCorners[campusCorners.length - 1];
  var lastLat = lastPosition.lat;
  var lastLon = lastPosition.lon;

  var distance = Math.sqrt((lat - lastLat) ** 2 + (lon - lastLon) ** 2);
  return distance >= 0.00009;
}

function warnUserIfTenMetersAway(lat, lon) {
  if (isTenMetersAway(lat, lon)) {
    console.log("Warning: You are 10 meters away from the campus.");
  }
}

setInterval(function () {
  if (userLeftTime && new Date() - userLeftTime >= 5 * 60 * 1000) {
    warnUserIfTenMetersAway(lat, lon);
  }
}, 5 * 1000);

// Call getLocation with a callback to trigger facial recognition if successful
// getLocation(function (success) {
//   if (success) {
//     // Load facial recognition models and start webcam
//     Promise.all([
//       faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
//       faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//       faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//     ])
//       .then(function () {
//         return navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: false,
//         });
//       })
//       .then(function (stream) {
//         video.srcObject = stream;
//       })
//       .then(function () {
//         // Start facial recognition
//         startFacialRecognition();
//       })
//       .catch(function (error) {
//         console.error('Error setting up facial recognition:', error);
//       });
//   }
// });

// // Function to start facial recognition
// function startFacialRecognition() {
//   try {
//     // Get labeled face descriptions
//     getLabeledFaceDescriptions().then(function (labeledFaceDescriptors) {
//       const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

//       const canvas = faceapi.createCanvasFromMedia(video);
//       document.body.append(canvas);

//       const displaySize = { width: video.width, height: video.height };
//       faceapi.matchDimensions(canvas, displaySize);

//       setInterval(async () => {
//         try {
//           const detections = await faceapi
//             .detectAllFaces(video)
//             .withFaceLandmarks()
//             .withFaceDescriptors();

//           const resizedDetections = faceapi.resizeResults(detections, displaySize);

//           canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

//           const results = resizedDetections.map((d) => {
//             return faceMatcher.findBestMatch(d.descriptor);
//           });

//           results.forEach((result, i) => {
//             const box = resizedDetections[i].detection.box;
//             const drawBox = new faceapi.draw.DrawBox(box, {
//               label: result,
//             });
//             drawBox.draw(canvas);

//             // Display a message when a face is recognized
//             console.log('Recognized:', result.label);
//           });
//         } catch (error) {
//           console.error('Error during facial recognition:', error);
//         }
//       }, 100);
//     });
//   } catch (error) {
//     console.error('Error setting up facial recognition:', error);
//   }

//   // Display a success message for passing both location and recognition
//   document.getElementById('resultMessage').innerHTML = 'Attendance taken and recognized successfully!';
// }

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
// var campusCorners = [
//     {lat: 3.0740292340004967, lon: 101.59073576831219}, 
//     {lat: 3.074741674724174, lon: 101.59178987640011},
//     {lat: 3.074345279192275, lon: 101.59178987640011},
//     {lat: 3.0743426008435777, lon: 101.59213319913613},
//     {lat: 3.0745997222871027, lon: 101.59213319913613},
//     {lat: 3.0745997222871027, lon: 101.59286275995017},
//     {lat: 3.0735042773733623, lon: 101.59286544215904},
//     {lat: 3.0735042773733623, lon: 101.59133121868247},
//     {lat: 3.0740479824466975, lon: 101.59132585426471},
//     {lat: 3.0740345906994437, lon: 101.59073040389445},
// ];
// var campusCorners = [
//   { lat: 3.0885523904305785, lon: 101.68325552738705 },
//   { lat: 3.0877328263564507, lon: 101.68331453598228 },
//   { lat: 3.0887880819426305, lon: 101.68494531897836 },
//   { lat: 3.0879363782770373, lon: 101.68498823432036 },
// ];

// var minAltitude = -100; // Replace with minimum acceptable altitude
// var maxAltitude = 100; // Replace with maximum acceptable altitude

// var userInside = false;
// var userLeftTime = null;

// function isWithinCampus(lat, lon, alt) {
//   var x = lat,
//     y = lon;
//   var inside = false;

//   for (var i = 0, j = campusCorners.length - 1; i < campusCorners.length; j = i++) {
//     var xi = campusCorners[i].lat,
//       yi = campusCorners[i].lon;
//     var xj = campusCorners[j].lat,
//       yj = campusCorners[j].lon;

//     var intersect = ((yi > y) != (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
//     if (intersect) inside = !inside;
//   }

//   return inside && alt >= minAltitude && alt <= maxAltitude;
// }

// function setAttendanceToAbsent() {
//   if (!userInside) {
//     console.log("User attendance set to absent.");
//   }
// }

// function isTenMetersAway(lat, lon) {
//   if (!userInside) return false;

//   var lastPosition = campusCorners[campusCorners.length - 1];
//   var lastLat = lastPosition.lat;
//   var lastLon = lastPosition.lon;

//   var distance = Math.sqrt((lat - lastLat) ** 2 + (lon - lastLon) ** 2);
//   return distance >= 0.00009;
// }

// function warnUserIfTenMetersAway(lat, lon) {
//   if (isTenMetersAway(lat, lon)) {
//     console.log("Warning: You are 10 meters away from the campus.");
//   }
// }

// function getLocation(locationCallback, recognitionCallback) {
//   navigator.geolocation.getCurrentPosition(async function (position) {
//     var lat = position.coords.latitude;
//     var lon = position.coords.longitude;
//     var alt = position.coords.altitude;

//     if (isWithinCampus(lat, lon, alt)) {
//       userInside = true;
//       console.log("Great! You are currently around the campus.");

//       setTimeout(function () {
//         if (!userInside) {
//           console.log("Warning: You have left the area.");
//           userLeftTime = new Date();
//         }
//       }, 5 * 60 * 1000);

//       setTimeout(setAttendanceToAbsent, 10 * 60 * 1000);

//       if (locationCallback) {
//         locationCallback(true);

//         // Call the facial recognition function
//         await recognitionCallback();
//       }
//     } else {
//       console.log("You are not around the area, please try again");
//       userLeftTime = new Date();

//       if (locationCallback) {
//         locationCallback(false);
//       }
//     }
//   });
// }

// function startFacialRecognition() {
//   return new Promise((resolve) => {
//     Promise.all([
//       faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
//       faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//       faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//     ])
//       .then(startWebcam)
//       .catch((error) => {
//         console.error('Error loading face recognition models:', error);
//       });
    
//     function startWebcam() {
//       navigator.mediaDevices
//         .getUserMedia({
//           video: true,
//           audio: false,
//         })
//         .then((stream) => {
//           video.srcObject = stream;
//         })
//         .catch((error) => {
//           console.error('Error accessing camera:', error);
//         });
//     }
    
//     async function getLabeledFaceDescriptions() {
//       try {
//         const labels = ["JunHong"];
//         return await Promise.all(
//           labels.map(async (label) => {
//             const descriptions = [];
//             for (let i = 1; i <= 3; i++) {
//               const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
//               const detections = await faceapi
//                 .detectSingleFace(img)
//                 .withFaceLandmarks()
//                 .withFaceDescriptor();
//               descriptions.push(detections.descriptor);
//             }
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//           })
//         );
//       } catch (error) {
//         console.error('Error getting labeled face descriptions:', error);
//         return [];
//       }
//     }
    
//     video.addEventListener("play", async () => {
//       try {
//         const labeledFaceDescriptors = await getLabeledFaceDescriptions();
//         const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
    
//         const canvas = faceapi.createCanvasFromMedia(video);
//         document.body.append(canvas);
    
//         const displaySize = { width: video.width, height: video.height };
//         faceapi.matchDimensions(canvas, displaySize);
    
//         setInterval(async () => {
//           try {
//             const detections = await faceapi
//               .detectAllFaces(video)
//               .withFaceLandmarks()
//               .withFaceDescriptors();
    
//             const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
//             canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    
//             const results = resizedDetections.map((d) => {
//               return faceMatcher.findBestMatch(d.descriptor);
//             });
    
//             results.forEach((result, i) => {
//               const box = resizedDetections[i].detection.box;
//               const drawBox = new faceapi.draw.DrawBox(box, {
//                 label: result,
//               });
//               drawBox.draw(canvas);
    
//               // Display a message when a face is recognized
//               console.log('Recognized:', result.label);
//             });
//           } catch (error) {
//             console.error('Error during facial recognition:', error);
//           }
//         }, 100);
//       } catch (error) {
//         console.error('Error setting up facial recognition:', error);
//       }
//     });

//     // Display a success message for passing both location and recognition
//     document.getElementById('resultMessage').innerHTML = 'Attendance taken and recognized successfully!';

//     // Invoke the resolve function with success
//     resolve(true);
//   });
// }

// setInterval(function () {
//   if (userLeftTime && new Date() - userLeftTime >= 5 * 60 * 1000) {
//     warnUserIfTenMetersAway(lat, lon);
//   }
// }, 5 * 1000);

// // Call getLocation with callbacks for location and recognition
// getLocation(
//   function (locationSuccess) {
//     if (locationSuccess) {
//       console.log('Location check successful!');
//     } else {
//       console.log('Location check failed.');
//     }
//   },
//   async function () {
//     const recognitionSuccess = await startFacialRecognition();
//     if (recognitionSuccess) {
//       console.log('Facial recognition successful!');
//     } else {
//       console.log('Facial recognition failed.');
//     }
//   }
// );

// async function sendLocationData(lat, lon, alt) {
//   try {
//     const response = await fetch('http://localhost:5500/markAttendance', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         lat: lat,
//         lon: lon,
//         alt: alt,
//       }),
//     });

//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error('Error sending location data:', error);
//   }
// };