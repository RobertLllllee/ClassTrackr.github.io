// (async () => {
//   const express = require('express');
//   const session = require('express-session');
//   const { MongoClient } = require('mongodb');
//   const MongoStore = require('connect-mongo');
//   const app = express();
//   const multer = require('multer');
//   const path = require('path'); // Add this line
//   const faceapi = require('face-api.js');
//   const { Canvas, Image, ImageData } = require('canvas');
//   const cors = require('cors');

//   app.use(express.json());
//   app.use(express.static('public'));
//   app.use('/models', express.static('models'));
//   app.use(cors());

//   const uri = "mongodb+srv://hongleejun:nQBHTHJQCBsPrCpQ@cluster0.laejwaw.mongodb.net/Entities";
//   const client = new MongoClient(uri);

//   async function connectToDatabase() {
//     try {
//       await client.connect();
//       console.log('Connected to MongoDB');
//     } catch (error) {
//       console.error('Error connecting to MongoDB:', error);
//     }
//   }

// // Call the function to connect to the database
// connectToDatabase();

// // Helper function to convert buffer to ImageData
// function bufferToImageData(buffer) {
//   const img = new Image();
//   img.src = buffer;
//   const canvas = new Canvas(img.width, img.height);
//   const ctx = canvas.getContext('2d');
//   ctx.drawImage(img, 0, 0, img.width, img.height);
//   return ctx.getImageData(0, 0, img.width, img.height);
// }

// async function generateFaceDescriptor(imageBuffer) {
//   const imgData = bufferToImageData(imageBuffer);
//   const detections = await faceapi.detectSingleFace(imgData).withFaceLandmarks().withFaceDescriptor();
//   if (!detections) {
//     throw new Error('No faces detected');
//   }
//   return detections.descriptor;
// }

// const mongoStore = MongoStore.create({
//   client: client,
//   dbName: 'Entities',
//   collectionName: 'sessions',
// });

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, // Set your secret key
//     resave: false,
//     saveUninitialized: true,
//     store: mongoStore,
//     cookie: {
//       secure: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   })
// );

// app.post('/login', async (req, res) => {
//   try {
//     await client.connect();
//     let collection;
//     let redirectUrl;
//     let userId;
//     let userName; // Add userName
//     let userPass;
//     switch (req.body.UserType) {
//       case 'Administrator':
//         collection = client.db("Entities").collection("Administrator");
//         redirectUrl = 'admin.html'; // Updated redirect URL
//         userId = 'AdminID';
//         userName = 'AdminName'; // Set userName for Admin
//         userPass = 'AdminPass';
//         break;
//       case 'Student':
//         collection = client.db("Entities").collection("Student");
//         redirectUrl = 'student.html'; // Updated redirect URL
//         userId = 'StudentID';
//         userName = 'StudentName'; // Set userName for Student
//         userPass = 'StudentPass';
//         break;
//       case 'Instructor':
//         collection = client.db("Entities").collection("Instructor");
//         redirectUrl = 'instructor.html'; // Updated redirect URL
//         userId = 'InstructorID';
//         userName = 'InstructorName'; // Set userName for Instructor
//         userPass = 'InstructorPass';
//         break;
//       default:
//         res.json({ success: false, message: 'Invalid User Type' });
//         return;
//     }

//     const user = await collection.findOne({
//       [userId]: req.body[userId], [userPass]: req.body[userPass]
//     });

//     if (user) {
//       req.session.userType = req.body.UserType; // Save the user type in the session
//       req.session.userId = user[userId]; // Save the user ID in the session
//       req.session.userName = user[userName]; // Save the user name in the session

//       console.log('User logged in with ID:', req.session.userId); // Log the user ID

//       res.json({
//         success: true,
//         message: 'Login successful',
//         redirect: redirectUrl,
//         userId: user[userId],
//         userName: user[userName],
//       });
//     } else {
//       res.json({ success: false, message: 'Login failed' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.json({ success: false, message: 'Error occurred' });
//   }
// });

// // Image upload route
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post('/uploadImage', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       console.log('No image file provided');
//       return res.status(400).json({ success: false, message: 'No image file provided' });
//     }

//     const studentID = req.body.studentID;
//     console.log('Student ID:', studentID);
//     const imageBuffer = req.file.buffer;
//     console.log('Image received:', imageBuffer);

//     // Store the image in the StudentImages collection
//     const studentImages = client.db('Entities').collection('StudentImages');
//     const resultImage = await studentImages.insertOne({ StudentID: studentID, ImageData: imageBuffer });
//     console.log('Insert image result:', resultImage);

//     if (resultImage.acknowledged) {
//       console.log('Image upload successful');

//       // Generate facial descriptor for the uploaded image
//       const faceDescriptor = await generateFaceDescriptor(imageBuffer);

//       // Store the descriptor along with the student ID in the StudentDescriptors collection
//       const success = await storeFaceDescriptor(studentID, faceDescriptor);

//       if (success) {
//         console.log('Face descriptor stored successfully');
//         res.status(200).json({ success: true, message: 'Image and face descriptor stored successfully' });
//       } else {
//         console.log('Face descriptor storage failed');
//         res.status(500).json({ success: false, message: 'Face descriptor storage failed' });
//       }
//     } else {
//       console.log('Image upload failed');
//       res.status(500).json({ success: false, message: 'Image upload failed' });
//     }
//   } catch (error) {
//     console.error('Error during image upload:', error.message);
//     res.status(500).json({ success: false, message: 'Image upload failed' });
//   }
//   const faceDescriptor = await generateFaceDescriptor(imageBuffer);

//   const studentDescriptors = client.db('Entities').collection('StudentDescriptors');
//   await studentDescriptors.insertOne({ StudentID: studentID, FaceDescriptor: faceDescriptor });
// });

// app.get('/getDescriptors', async (req, res) => {
//   try {
//     const studentDescriptors = client.db('Entities').collection('StudentDescriptors');
//     const descriptors = await studentDescriptors.find({}).toArray();
//     res.json(descriptors);
//   } catch (error) {
//     res.status(500).send('Error fetching descriptors');
//   }
// });

// app.listen(5500, () => console.log('Server Started!'));
// })();
const express = require('express');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const MongoStore = require('connect-mongo');
const app = express();
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(express.static('public'));
app.use('/models', express.static('models'));
app.use(cors());

const uri = "mongodb+srv://hongleejun:nQBHTHJQCBsPrCpQ@cluster0.laejwaw.mongodb.net/Entities";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Call the function to connect to the database
connectToDatabase();

const mongoStore = MongoStore.create({
  client: client,
  dbName: 'Entities',
  collectionName: 'sessions',
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.post('/login', async (req, res) => {
  try {
    await client.connect();
    let collection;
    let redirectUrl;
    let userId;
    let userName;
    let userPass;
    switch (req.body.UserType) {
      case 'Administrator':
        collection = client.db("Entities").collection("Administrator");
        redirectUrl = 'admin.html';
        userId = 'AdminID';
        userName = 'AdminName';
        userPass = 'AdminPass';
        break;
      case 'Student':
        collection = client.db("Entities").collection("Student");
        redirectUrl = 'student.html';
        userId = 'StudentID';
        userName = 'StudentName';
        userPass = 'StudentPass';
        break;
      case 'Instructor':
        collection = client.db("Entities").collection("Instructor");
        redirectUrl = 'instructor.html';
        userId = 'InstructorID';
        userName = 'InstructorName';
        userPass = 'InstructorPass';
        break;
      default:
        res.json({ success: false, message: 'Invalid User Type' });
        return;
    }

    const user = await collection.findOne({
      [userId]: req.body[userId], [userPass]: req.body[userPass]
    });

    if (user) {
      req.session.userType = req.body.UserType;
      req.session.userId = user[userId];
      req.session.userName = user[userName];

      console.log('User logged in with ID:', req.session.userId);

      res.json({
        success: true,
        message: 'Login successful',
        redirect: redirectUrl,
        userId: user[userId],
        userName: user[userName],
      });
    } else {
      res.json({ success: false, message: 'Login failed' });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error occurred' });
  }
});

app.post('/markAttendance', async (req, res) => {
  try {
    if (!req.body.image || !req.body.lat || !req.body.lon || !req.body.alt) {
      res.status(400).json({ success: false, message: 'Invalid request. Please provide image data, latitude, longitude, and altitude.' });
      return;
    }

    // Check if the request contains image data
    const imageData = req.body.image;

    // Check if the request contains location data
    const lat = req.body.lat;
    const lon = req.body.lon;
    const alt = req.body.alt;

    // Perform facial recognition check
    const isFacialRecognitionSuccessful = performFacialRecognition(imageData);

    // Perform location tracking check
    const isLocationTrackingSuccessful = isWithinCampus(lat, lon, alt) && !isTenMetersAway(lat, lon);

    // Check the results of both checks
    if (isFacialRecognitionSuccessful && isLocationTrackingSuccessful) {
      // Mark attendance in the database or perform any other necessary actions
      res.json({ success: true, message: 'Attendance marked successfully' });
    } else if (!isFacialRecognitionSuccessful && !isLocationTrackingSuccessful) {
      res.status(400).json({ success: false, message: 'Attendance not marked. Facial recognition and location tracking both failed.' });
    } else if (!isFacialRecognitionSuccessful) {
      res.status(400).json({ success: false, message: 'Attendance not marked. Facial recognition failed.' });
    } else if (!isLocationTrackingSuccessful) {
      res.status(400).json({ success: false, message: 'Attendance not marked. Location tracking failed.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error occurred' });
  }
});

app.listen(5500, () => console.log('Server Started!'));

// // Load a pre-trained face recognition model
// async function loadFaceRecognitionModel() {
//   // Replace 'path/to/your/model.json' with the actual path to your TensorFlow.js face recognition model JSON file
//   const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/demos/face-detection/index.html?model=mediapipe_face_detector');
//   return model;
// }

// // Preprocess the image and convert it to a tensor
// function preprocessImage(imageBuffer) {
//   // Placeholder for image preprocessing logic
//   const image = tf.node.decodeImage(imageBuffer);
  
//   // Convert to grayscale if needed
//   const grayscaleImage = image.mean(2);

//   // Resize the image if needed (adjust dimensions based on your model requirements)
//   const resizedImage = tf.image.resizeBilinear(grayscaleImage, [160, 160]);

//   // Normalize pixel values to be in the range [0, 1]
//   const normalizedImage = resizedImage.div(255.0);

//   // Expand dimensions to match model input shape (batch size of 1)
//   const expandedImage = normalizedImage.expandDims(0);

//   // Cleanup: Dispose of intermediate tensors
//   image.dispose();
//   grayscaleImage.dispose();
//   resizedImage.dispose();
//   normalizedImage.dispose();

//   return expandedImage;
// }

// // Compute embeddings for the given image using the loaded model
// async function computeEmbeddingsForStudentImage(model, imageBuffer) {
//   // Preprocess the image
//   const preprocessedImage = preprocessImage(imageBuffer);

//   // Make predictions with the model to get embeddings
//   const embeddings = model.predict(preprocessedImage);

//   // Convert embeddings tensor to a JavaScript array
//   const embeddingsArray = embeddings.arraySync()[0];

//   // Cleanup: Dispose of intermediate tensors
//   preprocessedImage.dispose();
//   embeddings.dispose();

//   return embeddingsArray;
// }

// // Image upload route
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post('/uploadImage', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       console.log('No image file provided');
//       return res.status(400).json({ success: false, message: 'No image file provided' });
//     }

//     const studentID = req.body.studentID;
//     console.log('Student ID:', studentID);
//     const imageBuffer = req.file.buffer;
//     console.log('Image received:', imageBuffer);

//     // Store the image in the StudentImages collection
//     const studentImages = client.db('Entities').collection('StudentImages');
//     const resultImage = await studentImages.insertOne({ StudentID: studentID, ImageData: imageBuffer });
//     console.log('Insert image result:', resultImage);

//     if (resultImage.acknowledged) {
//       // Compute and store embeddings in the StudentDescriptors collection
//       const model = await loadFaceRecognitionModel();
//       const embeddings = await computeEmbeddingsForStudentImage(model, imageBuffer);
      
//       const studentDescriptorsCollection = client.db('Entities').collection('StudentDescriptors');
//       const resultEmbeddings = await studentDescriptorsCollection.updateOne(
//         { StudentID: studentID },
//         { $set: { Embeddings: embeddings } },
//         { upsert: true }
//       );

//       if (resultEmbeddings.acknowledged) {
//         console.log('Embeddings stored successfully');
//         res.json({ success: true, message: 'Image upload and embeddings stored successfully' });
//       } else {
//         console.log('Failed to store embeddings');
//         res.status(500).json({ success: false, message: 'Failed to store embeddings' });
//       }
//     } else {
//       console.log('Image upload failed');
//       res.status(500).json({ success: false, message: 'Image upload failed' });
//     }
//   } catch (error) {
//     console.error('Error during image upload:', error);
//     // Handle errors appropriately
//     res.status(500).json({ success: false, message: 'Error during image upload', error: error.message });
//   }
// });



// // Image upload route
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post('/uploadImage', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       console.log('No image file provided');
//       return res.status(400).json({ success: false, message: 'No image file provided' });
//     }

//     const studentID = req.body.studentID;
//     console.log('Student ID:', studentID);
//     const imageBuffer = req.file.buffer;
//     console.log('Image received:', imageBuffer);

//     // Store the image in the StudentImages collection
//     const studentImages = client.db('Entities').collection('StudentImages');
//     const resultImage = await studentImages.insertOne({ StudentID: studentID, ImageData: imageBuffer });
//     console.log('Insert image result:', resultImage);

//     if (resultImage.acknowledged) {
//       console.log('Image upload successful');
//       res.json({ success: true, message: 'Image upload successful' });
//     } else {
//       console.log('Image upload failed');
//       res.status(500).json({ success: false, message: 'Image upload failed' });
//     }
//   } catch (error) {
//     console.error('Error during image upload:', error);

//     // Check if it's a specific error from the face descriptor generation
//     if (error.message.includes('No faces detected')) {
//       res.status(400).json({ success: false, message: 'No faces detected in the uploaded image' });
//     } else {
//       res.status(500).json({ success: false, message: 'Error during image upload', error: error.message });
//     }
//   }
// });

// app.listen(5500, () => console.log('Server Started!'));

