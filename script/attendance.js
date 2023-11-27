// console.log("Attendance.js loaded!");

// let recognitionSuccessful = false;

// // Fetch user information when the page loads
// fetchUserInfo();

// // Retrieve the generated details from localStorage
// const detailsString = localStorage.getItem("generatedDetails");
// let details;

// if (detailsString) {
//   details = JSON.parse(detailsString);

//   // Display the details in the HTML
//   document.getElementById('date').textContent = details.date;
//   document.getElementById('timeslot').textContent = details.timeslot;
//   document.getElementById('subject').textContent = details.subject;
//   document.getElementById('instructorName').textContent = details.instructor;
// }

// // Function to fetch and display the user information
// function fetchUserInfo() {
//   const userId = sessionStorage.getItem('userId'); // Retrieve the appropriate user ID
//   const userName = sessionStorage.getItem('userName'); // Retrieve the appropriate user name

//   if (userId) {
//     // Update the dashboard with UserType, UserID, and UserName
//     document.getElementById('userID').textContent = userId;
//     document.getElementById('userName').textContent = userName; // Display userName
//   }
// }

// // Function to get labeled face descriptions
// async function getLabeledFaceDescriptions() {
//   try {
//     const labels = ["Lee Jun Hong" || "YongJun" || "ShiJie"];
//     return await Promise.all(
//       labels.map(async (label) => {
//         const descriptions = [];
//         for (let i = 1; i <= 3; i++) {
//           const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
//           const detections = await faceapi
//             .detectSingleFace(img)
//             .withFaceLandmarks()
//             .withFaceDescriptor();
//           descriptions.push(detections.descriptor);
//         }
//         return new faceapi.LabeledFaceDescriptors(label, descriptions);
//       })
//     );
//   } catch (error) {
//     console.error('Error getting labeled face descriptions:', error);
//     return [];
//   }
// }

// // Function to fetch student ID
// async function fetchStudentId(studentName) {
//   try {
//     const response = await fetch(`http://localhost:5500/fetchStudentId?studentName=${studentName}`);
//     const data = await response.json();

//     if (data.success) {
//       return data.studentId;
//     } else {
//       console.error('Error fetching student ID:', data.message);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching student ID:', error);
//     return null;
//   }
// }

// // Function to mark attendance
// async function markAttendance(date, timeslot, subject, instructorName) {
//   try {
//     // Fetch user details from session
//     const userId = sessionStorage.getItem('userId');
//     const userName = sessionStorage.getItem('userName');

//     if (!userId || !userName) {
//       console.error('User details not found');
//       return;
//     }

//     // Use fetch to send attendance data to the server
//     const response = await fetch('http://localhost:5500/updateAttendance', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         StudentName: userName,
//         studentId: userId,
//         date: date,
//         timeslot: timeslot,
//         subject: subject,
//         instructorName: instructorName,
//       }),
//     });

//     const data = await response.json();

//     if (data.success) {
//       console.log('Attendance record updated successfully');
//     } else {
//       console.error('Error updating attendance:', data.message);
//     }
//   } catch (error) {
//     console.error('Error marking attendance:', error);
//   }
// }

// // Function to start facial recognition
// function startFacialRecognition() {
//   Promise.all([
//     faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
//     faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//     faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//   ])
//     .then(startWebcam)
//     .catch((error) => {
//       console.error('Error loading face recognition models:', error);
//     });

//   function startWebcam() {
//     navigator.mediaDevices
//       .getUserMedia({
//         video: true,
//         audio: false,
//       })
//       .then((stream) => {
//         video.srcObject = stream;
//       })
//       .catch((error) => {
//         console.error('Error accessing camera:', error);
//       });
//   }

//   video.addEventListener("play", async () => {
//     try {
//       const labeledFaceDescriptors = await getLabeledFaceDescriptions();
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

//           results.forEach(async (result, i) => {
//             const box = resizedDetections[i].detection.box;
//             const drawBox = new faceapi.draw.DrawBox(box, {
//               label: result,
//             });
//             drawBox.draw(canvas);

//             // Display a message when a face is recognized
//             console.log('Recognized:', result.label);
//             recognitionSuccessful = true; // Set the flag to true

//             // Mark attendance in the collection if recognition is successful
//             if (recognitionSuccessful) {
//               markAttendance(details.date, details.timeslot, details.subject, details.instructor);
//               recognitionSuccessful = false; // Reset the flag
//             }
//           });
//         } catch (error) {
//           console.error('Error during facial recognition:', error);
//         }
//       }, 100);
//     } catch (error) {
//       console.error('Error setting up facial recognition:', error);
//     }
//   });
// }

// // Call getLocation with a callback to trigger facial recognition if successful
// getLocation(function (success) {
//   if (success) {
//     // Start facial recognition
//     startFacialRecognition();
//   }
// });
console.log("Attendance.js loaded!");

let recognitionSuccessful = true; // Flag to track whether recognition has occurred

// Fetch user information when the page loads
fetchUserInfo();

// Retrieve the generated details from localStorage
const detailsString = localStorage.getItem("generatedDetails");
let details;

if (detailsString) {
  details = JSON.parse(detailsString);

  // Display the details in the HTML
  document.getElementById('date').textContent = details.date;
  document.getElementById('timeslot').textContent = details.timeslot;
  document.getElementById('subject').textContent = details.subject;
  document.getElementById('instructorName').textContent = details.instructor;
}

// Function to fetch and display the user information
function fetchUserInfo() {
  const userId = sessionStorage.getItem('userId'); // Retrieve the appropriate user ID
  const userName = sessionStorage.getItem('userName'); // Retrieve the appropriate user name

  if (userId) {
    // Update the dashboard with UserType, UserID, and UserName
    document.getElementById('userID').textContent = userId;
    document.getElementById('userName').textContent = userName; // Display userName
  }
}

// Function to get labeled face descriptions
async function getLabeledFaceDescriptions() {
  try {
    const labels = ["YongJun" , "ShiJie"];
    return await Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 3; i++) {
          const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  } catch (error) {
    console.error('Error getting labeled face descriptions:', error);
    return [];
  }
}

// Function to fetch student ID
async function fetchStudentId(studentName) {
  try {
    const response = await fetch(`http://localhost:5500/fetchStudentId?studentName=${studentName}`);
    const data = await response.json();

    if (data.success) {
      return data.studentId;
    } else {
      console.error('Error fetching student ID:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching student ID:', error);
    return null;
  }
}

async function markAttendance(date, timeslot, subject, instructorName, customFormat) {
  try {
    // Fetch user details from session
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    if (!userId || !userName) {
      console.error('User details not found');
      return;
    }

    // Use fetch to send attendance data to the server
    const response = await fetch('http://localhost:5500/updateAttendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        StudentName: userName,
        studentId: userId,
        date: date,
        timeslot: timeslot,
        subject: subject,
        instructorName: instructorName,
        customFormat: customFormat, // Include custom code in attendance data
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Attendance record updated successfully');

      // Fetch updated information from the server
      const updatedInfo = await fetchUpdatedInfo();

      // Display the updated information in the QR.html page
      displayUpdatedInfo(updatedInfo);

      // Redirect to the dashboard
      window.location.href = 'student.html';
    } else {
      console.error('Error updating attendance:', data.message);
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
  }
}

// Function to fetch updated information from the server
async function fetchUpdatedInfo() {
  try {
    const response = await fetch('http://localhost:5500/fetchUpdatedInfo'); // Add a new endpoint to fetch updated info
    const data = await response.json();

    if (data.success) {
      return data.updatedInfo;
    } else {
      console.error('Error fetching updated information:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching updated information:', error);
    return null;
  }
}

// Function to display the updated information in the QR.html page
function displayUpdatedInfo(updatedInfo) {
  // Update the QR.html page with the updated information
  const updatedInfoContainer = document.getElementById('updatedInfo');
  if (updatedInfoContainer) {
    updatedInfoContainer.innerHTML = `<p>Student Name: ${updatedInfo.studentName}</p><p>Student ID: ${updatedInfo.studentId}</p>`;
  }
}

// Function to start facial recognition
function startFacialRecognition() {
  Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  ])
    .then(startWebcam)
    .catch((error) => {
      console.error('Error loading face recognition models:', error);
    });

  function startWebcam() {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  }

  video.addEventListener("play", async () => {
    try {
      const labeledFaceDescriptors = await getLabeledFaceDescriptions();
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

      const canvas = faceapi.createCanvasFromMedia(video);
      document.body.append(canvas);

      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        try {
          const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

          const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor);
          });

          results.forEach(async (result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: result,
            });
            drawBox.draw(canvas);

            // Display a message when a face is recognized
            console.log('Recognized:', result.label);

            // Mark attendance only if recognition is successful and it hasn't been marked before
            if (recognitionSuccessful) {
            console.log('Marking attendance...');
            markAttendance(details.date, details.timeslot, details.subject, details.instructor, details.customFormat);

              recognitionSuccessful = false; // Reset the flag
            }
          });
        } catch (error) {
          console.error('Error during facial recognition:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error setting up facial recognition:', error);
    }
  });
}

startFacialRecognition();

// Call getLocation with a callback to trigger facial recognition if successful
// getLocation(function (success) {
//   if (success) {
//     // Start facial recognition
//     startFacialRecognition();
//   }
// });

