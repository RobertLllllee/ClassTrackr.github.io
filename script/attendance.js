console.log('attendance.js loaded');
window.onload = function() {
  // Fetch user information when the page loads
  fetchUserInfo();

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
};

async function performFacialRecognition() {
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
  
  async function getLabeledFaceDescriptions() {
    try {
      const labels = ["JunHong"];
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
  
          results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: result,
            });
            drawBox.draw(canvas);
  
            // Display a message when a face is recognized
            console.log('Recognized:', result.label);
          });
        } catch (error) {
          console.error('Error during facial recognition:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error setting up facial recognition:', error);
    }
  });

return true;
}

async function sendAttendanceData(imageData) {
  try {
    const response = await fetch('http://localhost:5500/markAttendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData, // Pass the captured image data here
      }),
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error sending attendance data:', error);
  }
}

document.getElementById('takeAttendanceButton').addEventListener('click', async () => {
  try {
    // Perform facial recognition (replace this with your actual logic)
    const isFacialRecognitionSuccessful = await performFacialRecognition();

    // Check if the user is inside the location (replace this with your actual logic)
    const isInsideLocation = await getLocation();

    // Trigger attendance marking if both conditions are met
    if (isFacialRecognitionSuccessful && isInsideLocation) {
      const response = await fetch('http://localhost:5500/markAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // No need to send additional data if not required on the server
        }),
      });

      const data = await response.json();

      // Handle the server response here (display success message, no need to get anything)
      if (data.success) {
        // Display success message
        console.log('Attendance marked successfully');
      } else {
        // Display error message
        console.error('Failed to mark attendance:', data.message);
      }
    } else {
      // Display a message indicating that conditions are not met
      console.log('Conditions for attendance marking are not met.');
    }
  } catch (error) {
    console.error('Error during attendance marking:', error);
  }
});

// const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
// const detectorConfig = {
//   runtime: 'mediapipe', // or 'tfjs'
// }
// const detector = await faceDetection.createDetector(model, detectorConfig);

// // Function to capture video from the user's webcam
// async function setupCamera() {
//   const video = document.getElementById('video');
//   const stream = await navigator.mediaDevices.getUserMedia({ 'video': {} });
//   video.srcObject = stream;

//   return new Promise((resolve) => {
//     video.onloadedmetadata = () => {
//       resolve(video);
//     };
//   });
// }

// // Function to detect faces in each video frame
// async function detectFaces() {
//   const video = await setupCamera();

//   // Function to preprocess the video frame and perform face recognition
//   async function processFrame() {
//     const predictions = await detector.estimateFaces(video);

//     if (predictions.length > 0) {
//       const faceImage = extractFaceImage(video, predictions[0]); // Implement this function to extract the face image
//       const embeddings = await computeEmbeddingsForFace(faceImage); // Implement this function to compute face embeddings

//       // Retrieve embeddings for the known student from StudentDescriptors
//       const studentID = document.getElementById('studentID').innerText;
//       const knownUserEmbeddings = await retrieveEmbeddingsForStudent(studentID);

//       if (knownUserEmbeddings) {
//         // Compare embeddings with knownUserEmbeddings
//         const similarityScore = calculateSimilarity(embeddings, knownUserEmbeddings);

//         if (similarityScore > threshold) {
//           // Face recognized as the known student
//           const recognizedStudent = await getStudentInfo(studentID); // Implement this function to get student information
//           displayRecognitionResult(recognizedStudent);
//         } else {
//           // Face not recognized
//           displayRecognitionResult(null);
//         }
//       } else {
//         console.log('Embeddings not available for the student.');
//         // Handle the case when embeddings are not available
//       }
//     }

//     // Repeat the detection on the next animation frame
//     requestAnimationFrame(processFrame);
//   }

//   // Start face detection and recognition
//   processFrame();
// }

// // Function to extract the face image from the video frame
// function extractFaceImage(video, prediction) {
//   const { x, y, width, height } = prediction.boundingBox;
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d');

//   canvas.width = width;
//   canvas.height = height;

//   context.drawImage(video, x, y, width, height, 0, 0, width, height);

//   const faceImage = context.getImageData(0, 0, width, height);

//   return faceImage;
// }

// // Function to compute embeddings for the face
// async function computeEmbeddingsForFace(faceImage) {
//   // Implement this function to use TensorFlow.js to compute embeddings for the face
//   // You may need to load your face recognition model and preprocess the face image
//   const embeddings = await computeEmbeddingsUsingTFJS(faceImage);
//   return embeddings;
// }

// // Function to retrieve embeddings for a known student from StudentDescriptors
// async function retrieveEmbeddingsForStudent(studentID) {
//   const response = await fetch(`/getStudentEmbeddings?studentID=${studentID}`);
//   const data = await response.json();
//   return data.embeddings; // Adjust the response structure based on your server-side implementation
// }

// // Function to get student information
// async function getStudentInfo(studentID) {
//   const response = await fetch(`/getStudentInfo?studentID=${studentID}`);
//   const data = await response.json();
//   return data.student; // Adjust the response structure based on your server-side implementation
// }

// // Function to calculate similarity score between embeddings
// function calculateSimilarity(embeddings1, embeddings2) {
//   // Implement this function based on your similarity scoring method
//   // E.g., cosine similarity, Euclidean distance, etc.
//   // Return a numerical score indicating the similarity
// }

// // Function to display the recognition result on the webpage
// function displayRecognitionResult(student) {
//   const resultMessage = document.getElementById('resultMessage');
//   const studentInfo = document.getElementById('studentInfo');

//   if (student) {
//     resultMessage.innerText = 'Student recognized!';
//     studentInfo.innerHTML = `
//       <p>Student Name: ${student.studentName}</p>
//       <p>Student ID: ${student.studentID}</p>
//     `;
//   } else {
//     resultMessage.innerText = 'Face not recognized.';
//     studentInfo.innerHTML = '';
//   }
// }

// // Run face detection and recognition when the page loads
// document.addEventListener('DOMContentLoaded', detectFaces);

// // const video = document.getElementById("video");

// // Promise.all([
// //   faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
// //   faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
// //   faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
// // ]).then(startWebcam);

// // function startWebcam() {
// //   navigator.mediaDevices
// //     .getUserMedia({
// //       video: true,
// //       audio: false,
// //     })
// //     .then((stream) => {
// //       video.srcObject = stream;
// //     })
// //     .catch((error) => {
// //       console.error(error);
// //     });
// // }

// // function getLabeledFaceDescriptions() {
// //   const labels = ["JunHong"];
// //   return Promise.all(
// //     labels.map(async (label) => {
// //       const descriptions = [];
// //       for (let i = 1; i <= 3; i++) {
// //         const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
// //         const detections = await faceapi
// //           .detectSingleFace(img)
// //           .withFaceLandmarks()
// //           .withFaceDescriptor();
// //         descriptions.push(detections.descriptor);
// //       }
// //       return new faceapi.LabeledFaceDescriptors(label, descriptions);
// //     })
// //   );
// // }

// // video.addEventListener("play", async () => {
// //   const labeledFaceDescriptors = await getLabeledFaceDescriptions();
// //   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

// //   const canvas = faceapi.createCanvasFromMedia(video);
// //   document.body.append(canvas);

// //   const displaySize = { width: video.width, height: video.height };
// //   faceapi.matchDimensions(canvas, displaySize);

// //   setInterval(async () => {
// //     const detections = await faceapi
// //       .detectAllFaces(video)
// //       .withFaceLandmarks()
// //       .withFaceDescriptors();

// //     const resizedDetections = faceapi.resizeResults(detections, displaySize);

// //     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

// //     const results = resizedDetections.map((d) => {
// //       return faceMatcher.findBestMatch(d.descriptor);
// //     });
// //     results.forEach((result, i) => {
// //       const box = resizedDetections[i].detection.box;
// //       const drawBox = new faceapi.draw.DrawBox(box, {
// //         label: result,
// //       });
// //       drawBox.draw(canvas);
// //     });
// //   }, 100);
// // });

// // console.log('Attendance.js loaded');

// // document.addEventListener('DOMContentLoaded', async () => {
// //   await faceapi.nets.tinyFaceDetector.load('models');
// //   console.log('TinyFaceDetector model loaded');
// //   await faceapi.nets.faceLandmark68Net.load('models');
// //   console.log('FaceLandmark68Net model loaded');
// //   await faceapi.nets.faceRecognitionNet.load('models');
// //   console.log('FaceRecognitionNet model loaded');
// //   await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
// //   console.log('ssd mobilenet v1 loaded');

// //   const takeAttendanceButton = document.getElementById('takeAttendanceButton');
// //   const resultMessage = document.getElementById('resultMessage');
// //   const studentInfo = document.getElementById('studentInfo');
// //   const studentName = document.getElementById('studentName');
// //   const studentIDElement = document.getElementById('studentID');

// //   takeAttendanceButton.addEventListener('click', async () => {
// //     const canvas = await captureImageFromWebcam();
  
// //     if (canvas) {
// //       // Upload the captured image to the server
// //       const uploadResult = await uploadImage(canvas);
  
// //       if (uploadResult.success) {
// //         // Generate face descriptors for the uploaded image
// //         const generateDescriptorsResult = await generateDescriptors(uploadResult.studentID);
  
// //         if (generateDescriptorsResult.success) {
// //           // If both upload and descriptor generation are successful, show the result
// //           resultMessage.textContent = 'Attendance Taken';
// //           studentInfo.style.display = 'block';
// //           studentName.textContent = generateDescriptorsResult.studentName;
// //           studentID.textContent = generateDescriptorsResult.studentID;
// //         } else {
// //           resultMessage.textContent = 'Face descriptor generation failed';
// //           studentInfo.style.display = 'none';
// //         }
// //       } else {
// //         resultMessage.textContent = 'Image upload failed';
// //         studentInfo.style.display = 'none';
// //       }
// //     }
// //   });

// //   async function captureImageFromWebcam() {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
// //       const video = document.createElement('video');
// //       document.body.appendChild(video);
// //       video.srcObject = stream;
// //       await video.play();

// //       const canvas = document.createElement('canvas');
// //       canvas.width = video.videoWidth;
// //       canvas.height = video.videoHeight;
// //       const context = canvas.getContext('2d');

// //       await new Promise((resolve) => setTimeout(resolve, 1000));
// //       context.drawImage(video, 0, 0, canvas.width, canvas.height);

// //       stream.getTracks().forEach((track) => track.stop());
// //       video.remove();

// //       return canvas;
// //     } catch (error) {
// //       console.error('Error capturing image from webcam:', error);
// //       return null;
// //     }
// //   }

// //   async function uploadImage(canvas) {
// //     try {
// //       const studentID = getStudentID();
// //       if (!studentID) {
// //         console.error('Unable to determine student ID');
// //         return { success: false };
// //       }

// //       const imageBase64 = canvas.toDataURL().split(',')[1];
// //       const response = await fetch('http://localhost:5500/uploadImage', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ studentID: studentID, image: imageBase64 }),
// //       });

// //       if (response.ok) {
// //         const result = await response.json();
// //         return { success: result.success, studentID: studentID, studentName: result.studentName };
// //       } else {
// //         return { success: false };
// //       }
// //     } catch (error) {
// //       console.error('Error uploading image:', error);
// //       return { success: false };
// //     }
// //   }

// //   async function generateDescriptors(studentID) {
// //     try {
// //       const response = await fetch('http://localhost:5500/generateDescriptor', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ studentID: studentID }),
// //       });
  
// //       if (response.ok) {
// //         const result = await response.json();
// //         return { success: result.success, studentID: result.studentID, studentName: result.studentName };
// //       } else {
// //         return { success: false };
// //       }
// //     } catch (error) {
// //       console.error('Error generating descriptors:', error);
// //       return { success: false };
// //     }
// //   }

// //   // Example function to get the student ID from the session
// // function getStudentID() {
// //   try {
// //     // Your logic to obtain the student ID from the session
// //     // This is a simple example, assuming you have a session variable named 'studentID'
// //     const studentID = sessionStorage.getItem('studentID');

// //     // Return the retrieved student ID
// //     return studentID;
// //   } catch (error) {
// //     console.error('Error getting student ID from session:', error);
// //     return null;
// //   }
// // }
// // });