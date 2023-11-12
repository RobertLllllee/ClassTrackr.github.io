console.log('Attendance.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
  await faceapi.nets.tinyFaceDetector.load('models');
  console.log('TinyFaceDetector model loaded');
  await faceapi.nets.faceLandmark68Net.load('models');
  console.log('FaceLandmark68Net model loaded');
  await faceapi.nets.faceRecognitionNet.load('models');
  console.log('FaceRecognitionNet model loaded');
  await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
  console.log('ssd mobilenet v1 loaded');

  const takeAttendanceButton = document.getElementById('takeAttendanceButton');
  const resultMessage = document.getElementById('resultMessage');
  const studentInfo = document.getElementById('studentInfo');
  const studentName = document.getElementById('studentName');
  const studentID = document.getElementById('studentID');

  takeAttendanceButton.addEventListener('click', async () => {
    const canvas = await captureImageFromWebcam();

    if (canvas) {
      // Upload the captured image to the server
      const uploadResult = await uploadImage(canvas);

      if (uploadResult.success) {
        // Generate face descriptors for the uploaded image
        const generateDescriptorsResult = await generateDescriptors(uploadResult.studentID);

        if (generateDescriptorsResult.success) {
          // If both upload and descriptor generation are successful, show the result
          resultMessage.textContent = 'Attendance Taken';
          studentInfo.style.display = 'block';
          studentName.textContent = generateDescriptorsResult.studentName;
          studentID.textContent = generateDescriptorsResult.studentID;
        } else {
          resultMessage.textContent = 'Face descriptor generation failed';
          studentInfo.style.display = 'none';
        }
      } else {
        resultMessage.textContent = 'Image upload failed';
        studentInfo.style.display = 'none';
      }
    }
  });

  async function captureImageFromWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      document.body.appendChild(video);
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      await new Promise((resolve) => setTimeout(resolve, 1000));
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach((track) => track.stop());
      video.remove();

      return canvas;
    } catch (error) {
      console.error('Error capturing image from webcam:', error);
      return null;
    }
  }

  async function uploadImage(canvas) {
    try {
      const imageBase64 = canvas.toDataURL().split(',')[1];
      const response = await fetch('http://localhost:5500/uploadImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentID: 'S000', image: imageBase64 }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: result.success, studentID: result.studentID };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false };
    }
  }

  async function generateDescriptors(studentID) {
    try {
      const response = await fetch('http://localhost:5500/generateDescriptors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentID: studentID }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: result.success, studentName: result.studentName, studentID: result.studentID };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error generating descriptors:', error);
      return { success: false };
    }
  }
});

  // // Fetch student images from the server
  // async function fetchStudentImages() {
  //   try {
  //     const response = await fetch('http://localhost:5500/studentImages');
  //     const studentImages = await response.json();
  //     return studentImages;
  //   } catch (error) {
  //     console.error('Error fetching student images:', error);
  //     return [];
  //   }
  // }

//   // Fetch student descriptors from the server
// async function fetchStudentDescriptors() {
//   try {
//     const response = await fetch('http://localhost:5500/studentDescriptors');
//     const studentDescriptors = await response.json();

//     // Ensure each descriptor is in the format { label: 'studentID', descriptor: Float32Array }
//     const formattedDescriptors = studentDescriptors.map(({ StudentID, FaceDescriptor }) => ({
//       label: StudentID,
//       descriptor: Float32Array.from(FaceDescriptor), // Assuming FaceDescriptor is an array
//     }));

//     return formattedDescriptors;
//   } catch (error) {
//     console.error('Error fetching student descriptors:', error);
//     return [];
//   }
// }

//   async function uploadDescriptor(studentID, descriptor) {
//     try {
//       // Send the student ID and descriptor to the server
//       const response = await fetch('http://localhost:5500/uploadDescriptor', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ studentID, descriptor }),
//       });
  
//       const result = await response.json();
//       return result.success;
//     } catch (error) {
//       console.error('Error uploading descriptor:', error);
//       return false;
//     }
//   }
  


// console.log('Attendance.js loaded');

// document.addEventListener('DOMContentLoaded', async () => {
//   console.log('Loading models...');
//   await faceapi.nets.tinyFaceDetector.load('models');
//   console.log('TinyFaceDetector model loaded');
//   await faceapi.nets.faceLandmark68Net.load('models');
//   console.log('FaceLandmark68Net model loaded');
//   await faceapi.nets.faceRecognitionNet.load('models');
//   console.log('FaceRecognitionNet model loaded');
//   await faceapi.nets.ssdMobilenetv1.loadFromUri('models');
//   console.log('ssd mobilenet v1 loaded');

//   const takeAttendanceButton = document.getElementById('takeAttendanceButton');
//   const resultMessage = document.getElementById('resultMessage');
//   const studentInfo = document.getElementById('studentInfo');
//   const studentName = document.getElementById('studentName');
//   const studentID = document.getElementById('studentID');

//   takeAttendanceButton.addEventListener('click', async () => {
//     // Capture an image from a webcam
//     const image = await captureImageFromWebcam();

//     if (image) {
//       // Perform face recognition
//       const recognizedStudent = await recognizeStudent(image);

//       if (recognizedStudent) {
//         // Display result
//         resultMessage.textContent = 'Attendance Taken';
//         studentInfo.style.display = 'block';
//         studentName.textContent = recognizedStudent.name;
//         studentID.textContent = recognizedStudent.id;
//       } else {
//         // Handle case when no student is recognized
//         resultMessage.textContent = 'No student recognized';
//         studentInfo.style.display = 'none';
//       }
//     }
//   });

//   async function captureImageFromWebcam() {
//     try {
//       // Access the user's webcam
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const video = document.createElement('video');
//       document.body.appendChild(video);
//       video.srcObject = stream;
//       await video.play();

//       // Create a canvas to capture the image
//       const canvas = document.createElement('canvas');
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const context = canvas.getContext('2d');

//       // Capture the image after a short delay to allow auto-focus
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);

//       // Stop the webcam stream and remove the video element
//       stream.getTracks().forEach((track) => track.stop());
//       video.remove();

//       // Return the captured image as a canvas
//       return canvas;
//     } catch (error) {
//       console.error('Error capturing image from webcam:', error);
//       return null;
//     }
//   }

//   async function recognizeStudent(image) {
//     try {
//       // Convert the captured image to a face-api.js Image element
//       const img = new Image();
//       img.src = image.toDataURL('image/jpeg');

//       // Detect faces in the captured image
//       const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

//       if (detections.length === 0) {
//         console.log('No faces detected in the captured image');
//         return null;
//       }

//       // Fetch student images and descriptors from the server
//       const studentImages = await fetchStudentImages();
//       const studentDescriptors = await fetchStudentDescriptors();

//       if (studentDescriptors.length === 0) {
//         console.log('No facial descriptors available. Capture descriptors first.');
//         return null;
//       }

//       // Modify FaceMatcher initialization to handle empty descriptors
//       const faceMatcher = new faceapi.FaceMatcher(studentDescriptors);
//       const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);

//       if (bestMatch.label) {
//         // Student recognized
//         const recognizedStudent = studentImages.find((student) => student.id === bestMatch.label);
//         return recognizedStudent;
//       } else {
//         // No student recognized
//         return null;
//       }
//     } catch (error) {
//       console.error('Error recognizing student:', error);
//       return null;
//     }
//   }

//   // Fetch student images from the server
//   async function fetchStudentImages() {
//     try {
//       const response = await fetch('http://localhost:5500/studentImages');
//       const studentImages = await response.json();
//       return studentImages;
//     } catch (error) {
//       console.error('Error fetching student images:', error);
//       return [];
//     }
//   }

 // // Fetch student descriptors from the server
  // async function fetchStudentDescriptors() {
  //   try {
  //     const response = await fetch('http://localhost:5500/studentDescriptors');
  //     const studentDescriptors = await response.json();

  //     // Ensure each descriptor is in the format { label: 'studentID', descriptor: Float32Array }
  //     const formattedDescriptors = studentDescriptors.map(({ StudentID, FaceDescriptor }) => ({
  //       label: StudentID,
  //       descriptor: Float32Array.from(FaceDescriptor), // Assuming FaceDescriptor is an array
  //     }));

  //     return formattedDescriptors;
  //   } catch (error) {
  //     console.error('Error fetching student descriptors:', error);
  //     return [];
  //   }
  // }


// });
 
