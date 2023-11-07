//"mongodb+srv://hongleejun:nQBHTHJQCBsPrCpQ@cluster0.laejwaw.mongodb.net/Entities"
const { Canvas, Image, createCanvas, loadImage } = require('canvas');
const faceapi = require('face-api.js');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const { MongoClient, GridFSBucket } = require('mongodb');
const fs = require('fs');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const jimp = require('jimp');

const uri = "mongodb+srv://hongleejun:nQBHTHJQCBsPrCpQ@cluster0.laejwaw.mongodb.net/Entities";
const client = new MongoClient(uri);

const mongoStore = MongoStore.create({
  client: client, // Pass your MongoDB client instance here
  dbName: 'Entities', // Replace with your database name
  collectionName: 'sessions', // Specify the collection name
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const upload = multer({ dest: 'uploads/' });

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Set your secret key
    resave: false,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
      secure: true, // Set to true when using HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // Set an appropriate expiration time
    },
  })
);

// Your loadImageFromGridFS function
app.post('/login', async (req, res) => {
  try {
    await client.connect();
    let collection;
    let redirectUrl;
    let userId;
    let userName; // Add userName
    let userPass;
    switch (req.body.UserType) {
      case 'Administrator':
        collection = client.db("Entities").collection("Administrator");
        redirectUrl = '/admin.html';
        userId = 'AdminID';
        userName = 'AdminName'; // Set userName for Admin
        userPass = 'AdminPass';
        break;
      case 'Student':
        collection = client.db("Entities").collection("Student");
        redirectUrl = '/student.html';
        userId = 'StudentID';
        userName = 'StudentName'; // Set userName for Student
        userPass = 'StudentPass';
        break;
      case 'Instructor':
        collection = client.db("Entities").collection("Instructor");
        redirectUrl = '/instructor.html';
        userId = 'InstructorID';
        userName = 'InstructorName'; // Set userName for Instructor
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
      req.session.userType = req.body.UserType; // Save the user type in the session
      req.session.userId = user[userId]; // Save the user ID in the session
      req.session.userName = user[userName]; // Save the user name in the session

      console.log('User logged in with ID:', req.session.userId); // Log the user ID

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

// Define a middleware to check if the user is logged in
function checkSession(req, res, next) {
  if (req.session.userId) {
    next(); // User is logged in; proceed to the next route
  } else {
    res.status(401).json({ message: 'User is not logged in' });
  }
}

// Apply the middleware to routes that require authentication
app.get('/secure-route', checkSession, (req, res) => {
  // This route will only be accessible if the user is logged in
  res.json({ message: 'Secure route accessed' });
});

app.post('/upload/:userId', upload.array('images'), async (req, res) => {
  const userId = req.params.userId;
  console.log('User ID:', userId);

  if (!userId) {
    return res.status(401).send('Please log in first');
  }

  const db = client.db("Entities");
  const bucket = new GridFSBucket(db, { bucketName: 'info' });
  const chunksCollection = db.collection('info.chunks');

  // Find the highest n value for the student
  const highestN = await chunksCollection.findOne(
    { files_id: userId },
    { sort: { n: -1 } }
  );

  let n = highestN ? highestN.n + 1 : 0;

  for (const file of req.files) {
    // Create a readable stream from the uploaded file
    const fileStream = fs.createReadStream(file.path);

    const chunk = {
      files_id: userId,
      n: n,
      data: fileStream, // Use the file stream as data
    };

    await chunksCollection.insertOne(chunk);

    n++; // Increment n for the next chunk
  }

  res.send('Images uploaded successfully');
});

app.get('/checkupload/:userId', async (req, res) => {
  const userId = req.params.userId;

  console.log('Checking for images for userId:', userId);

  if (!userId) {
    return res.json({ uploaded: false });
  }

  const db = client.db("Entities");
  const chunksCollection = db.collection('info.chunks');

  // Check if the user has already uploaded an image
  const existingImages = await chunksCollection.findOne({ files_id: userId });

  // console.log('Existing images:', existingImages);

  if (existingImages) {
    return res.json({ uploaded: true });
  } else {
    return res.json({ uploaded: false });
  }
});

app.listen(5500, () => console.log('Server Started!'));
