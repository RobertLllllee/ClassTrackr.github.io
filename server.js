const express = require('express');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const MongoStore = require('connect-mongo');
const app = express();
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

// Use a middleware to add the connected client to the request object
app.use((req, res, next) => {
  try {
    req.dbClient = client; // Pass the connected client directly
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

app.get('/fetchSemesters', async (req, res) => {
  try {
      const collection = client.db("Entities").collection("Subject");
      const semesters = await collection.distinct("semester");
      res.json(semesters);
  } catch (error) {
      console.error('Error fetching semesters:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/fetchSubjects', async (req, res) => {
  try {
    const semester = req.query.semester;
    const collection = client.db("Entities").collection("Subject");
    const subjectsData = await collection.findOne({ semester: parseInt(semester) });

    if (subjectsData && subjectsData.subjects && subjectsData.subjects.length > 0) {
      const subjects = subjectsData.subjects.map(subject => subject.name);
      res.json(subjects);
    } else {
      console.error('Subjects not found for the given semester:', semester);
      res.status(404).json({ error: 'Subjects not found for the given semester' });
    }
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/getTimetable', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('Entities');
    const collection = database.collection('Timetable');
    const courseCode = req.body.courseCode;

    const timetable = await collection.find({ course_code: courseCode }).toArray();

    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving timetable");
  } finally {
    await client.close();
  }
});

app.get('/fetchStudentId', async (req, res) => {
  try {
    const studentName = req.query.studentName;
    const collection = client.db("Entities").collection("Student");

    const student = await collection.findOne({ StudentName: { $regex: new RegExp(studentName, 'i') } });

    if (student) {
      res.json({ success: true, studentId: student.StudentID });
    } else {
      res.json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching student ID:', error);
    res.json({ success: false, message: 'Error fetching student ID' });
  }
});

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

// Add a new route to fetch student name by studentId
app.get('/fetchStudentName', async (req, res) => {
  try {
      const studentId = req.query.studentId;
      const collection = client.db("Entities").collection("Student");

      const student = await collection.findOne({ StudentID: studentId });

      if (student) {
          res.json({ success: true, studentName: student.StudentName });
      } else {
          res.json({ success: false, message: 'Student not found' });
      }
  } catch (error) {
      console.error('Error fetching student name:', error);
      res.json({ success: false, message: 'Error fetching student name' });
  }
});

app.post('/updateAttendance', async (req, res) => {
  try {
    console.log('Received attendance data:', req.body);

    const collection = client.db("Entities").collection("AttendanceRecords");

    if (!req.body || !req.body.StudentName || !req.body.date || !req.body.timeslot || !req.body.subject || !req.body.instructorName) {
      console.error('Invalid attendance data received:', req.body);
      res.json({ success: false, message: 'Invalid attendance data' });
      return;
    }

    // Check if customFormat is present, if not, set a default value or handle accordingly
    const customFormat = req.body.customFormat || 'DefaultCustomFormat';

    const studentId = await fetchStudentId(req.body.StudentName);

    if (studentId) {
      req.body.studentId = studentId;
      req.body.customFormat = customFormat; // Add customFormat to the request body

      const result = await collection.insertOne(req.body);

if (result && result.ops && result.ops.length > 0) {
  console.log('Attendance record inserted:', result.ops[0]);
} else {
  console.error('Error inserting attendance record. Result:', result);
}

      res.json({ success: true, message: 'Attendance record updated successfully' });
    } else {
      console.error('Student ID not found for name:', req.body.StudentName);
      res.json({ success: false, message: 'Student ID not found' });
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.json({ success: false, message: 'Error updating attendance' });
  }
});

app.get('/fetchAttendanceList', async (req, res) => {
  try {
      const collection = client.db("Entities").collection("AttendanceRecords");

      // Retrieve the customFormat from the query parameters
      const customFormat = req.query.customFormat;

      // Filter the attendance records based on the customFormat
      const attendanceList = await collection.find({ customFormat }).toArray();

      res.json({ success: true, attendanceList });
  } catch (error) {
      console.error('Error fetching attendance list:', error);
      res.json({ success: false, message: 'Error fetching attendance list' });
  }
});

app.get('/fetchUpdatedInfo', (req, res) => {
  try {
    // Fetch the updated information from your database or any source
    const updatedInfo = {
      studentName: 'Updated Student Name', // Replace with the actual updated data
      studentId: 'Updated Student ID', // Replace with the actual updated data
    };

    res.json({ success: true, updatedInfo });
  } catch (error) {
    console.error('Error fetching updated information:', error);
    res.json({ success: false, message: 'Error fetching updated information' });
  }
});

app.get('/checksubject/:studentId', async (req, res) => {
  try {
      const studentId = req.params.studentId;

      // Step 2: Fetch Current Semester
      const student = await req.dbClient.db("Entities").collection("Student").findOne(
          { StudentID: studentId },
          { projection: { StudentCurSem: 1 } }
      );

      if (!student || !student.StudentCurSem) {
          return res.status(404).send('Student not found or missing current semester information.');
      }

      const currentSemester = student.StudentCurSem;

      // Step 3: Fetch Subjects for Current Semester
      const subjects = await req.dbClient.db("Entities").collection("Subject").findOne(
          { semester: currentSemester },
          { projection: { subjects: 1 } }
      );

      if (!subjects || !subjects.subjects || !subjects.subjects[currentSemester]) {
          return res.status(404).send('Subjects not found for the current semester.');
      }

      const semesterSubjects = subjects.subjects[currentSemester];

      // Step 4: Display Subjects in HTML
      res.render('checksubject', { studentId, currentSemester, semesterSubjects });
  } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/fetchStudentCurSemSubjects', async (req, res) => {
  try {
    const studentId = req.query.studentId;
    const studentCollection = client.db("Entities").collection("Student");

    const student = await studentCollection.findOne({ StudentID: studentId });

    if (student) {
      const currentSemester = student.StudentCurSem;

      // Fetch subjects for the current semester from the Subject collection
      const subjectCollection = client.db("Entities").collection("Subject");
      const subjects = await subjectCollection.find({ semester: currentSemester }).toArray();

      res.json({ success: true, currentSemester, subjects });
    } else {
      res.json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching student current semester and subjects:', error);
    res.json({ success: false, message: 'Error fetching student current semester and subjects' });
  }
});

app.get('/fetchSubjectsBySemester', async (req, res) => {
  try {
    const semester = req.query.semester;
    const collection = client.db("Entities").collection("Subject");

    const subjects = await collection.find({ semester: parseInt(semester) }).toArray();

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects by semester:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/modifyAttendanceStatus', async (req, res) => {
  try {
      const collection = client.db("Entities").collection("AttendanceRecords");

      // Retrieve studentId and status from the request body
      const { studentId, status } = req.body;

      // Update the attendance record with the new status
      const result = await collection.updateOne({ studentId }, { $set: { status } });

      if (result && result.modifiedCount > 0) {
          console.log(`Attendance status updated for student ${studentId} to ${status}`);
          res.json({ success: true, message: 'Attendance status updated successfully' });
      } else {
          console.error('Error updating attendance status. Result:', result);
          res.json({ success: false, message: 'Error updating attendance status' });
      }
  } catch (error) {
      console.error('Error updating attendance status:', error);
      res.json({ success: false, message: 'Error updating attendance status' });
  }
});

app.post('/saveAttendanceList', async (req, res) => {
  try {
      const attendanceList = req.body;

      // Create a new collection or use an existing one for storing attendance
      const collection = client.db("Entities").collection("Attendance");

      // Insert the attendance list into the collection
      const result = await collection.insertMany(attendanceList);

      if (result && result.ops && result.ops.length > 0) {
          console.log('Attendance list saved:', result.ops);
          res.json({ success: true, message: 'Attendance list saved successfully' });
      } else {
          console.error('Error saving attendance list. Result:', result);
          res.json({ success: false, message: 'Error saving attendance list' });
      }
  } catch (error) {
      console.error('Error saving attendance list:', error);
      res.json({ success: false, message: 'Error saving attendance list' });
  }
});

// Add this endpoint to handle the modification of attendance status
app.post('/modifyAttendanceStatus', async (req, res) => {
  try {
      const collection = req.dbClient.db("Entities").collection("AttendanceRecords");

      // Retrieve studentId and status from the request body
      const { studentId, status } = req.body;

      // Update the attendance record with the new status
      const result = await collection.updateOne({ studentId }, { $set: { status } });

      if (result && result.modifiedCount > 0) {
          console.log(`Attendance status updated for student ${studentId} to ${status}`);
          res.json({ success: true, message: 'Attendance status updated successfully' });
      } else {
          console.error('Error updating attendance status. Result:', result);
          res.json({ success: false, message: 'Error updating attendance status' });
      }
  } catch (error) {
      console.error('Error updating attendance status:', error);
      res.json({ success: false, message: 'Error updating attendance status' });
  }
});

app.post('/updateModifiedAttendance', async (req, res) => {
  try {
      const { date, timeslot, semester, subject, instructorName, studentsData } = req.body;

      // Your logic to update the Attendance collection with modified statuses
      // This will depend on your database schema and how you store attendance data

      // For demonstration purposes, let's assume you have an Attendance collection
      // with fields: date, timeslot, semester, subject, instructorName, students

      const collection = client.db("Entities").collection("Attendance");

      // Check if the record already exists for the specified date and timeslot
      const existingRecord = await collection.findOne({
          date,
          timeslot,
      });

      if (existingRecord) {
          // Update the existing record
          await collection.updateOne(
              {
                  date,
                  timeslot,
              },
              {
                  $set: {
                      semester,
                      subject,
                      instructorName,
                      students: studentsData, // Assuming studentsData is an array of student objects
                  },
              }
          );
      } else {
          // Insert a new record
          await collection.insertOne({
              date,
              timeslot,
              semester,
              subject,
              instructorName,
              students: studentsData, // Assuming studentsData is an array of student objects
          });
      }

      res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (error) {
      console.error('Error updating attendance:', error);
      res.json({ success: false, message: 'Error updating attendance' });
  }
});

app.post('/updateTotalClassAttended', async (req, res) => {
  try {
    const { studentId } = req.body;

    const studentCollection = req.dbClient.db("Entities").collection("Student");
    const attendanceCollection = req.dbClient.db("Entities").collection("Attendance");

    // Find the student by StudentID
    const student = await studentCollection.findOne({ StudentID: studentId });

    if (student) {
      // Check the attendance for the student on the given date and timeslot
      const attendanceRecord = await attendanceCollection.findOne({
        'students.studentId': studentId,
        date: req.body.date,  // Add the date from the request body
        timeslot: req.body.timeslot,  // Add the timeslot from the request body
      });

      if (attendanceRecord) {
        // Check if the student's status is "Present"
        const studentAttendance = attendanceRecord.students.find(
          (s) => s.studentId === studentId && s.status === 'Present'
        );

        if (studentAttendance) {
          // Update the TotalClassAttended for the student
          const result = await studentCollection.updateOne(
            { StudentID: studentId },
            { $inc: { TotalClassAttended: 1 } }
          );

          if (result.modifiedCount > 0) {
            res.json({ success: true, message: 'TotalClassAttended updated successfully' });
          } else {
            res.json({ success: false, message: 'TotalClassAttended not updated' });
          }
        } else {
          res.json({ success: false, message: 'Student marked as Absent or on Leave' });
        }
      } else {
        res.json({ success: false, message: 'No attendance record found for the student on the given date and timeslot' });
      }
    } else {
      res.json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating TotalClassAttended:', error);
    res.status(500).json({ success: false, message: 'Error updating TotalClassAttended' });
  }
});

// Your existing checkStudent route
app.post('/checkStudent', async (req, res) => {
  try {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const database = client.db("Entities");
      const collection = database.collection("Student");

      const studentId = req.body.studentID;
      const student = await collection.findOne({ StudentID: studentId });
      console.log("Student data from database:", student);

      if (student) {
          // Student found in the database
          const studentDetails = {
              _id: student._id,
              StudentID: student.StudentID,
              StudentEmail: student.StudentEmail,
              StudentSession: student.StudentSession,
              StudentSection: student.StudentSection,
              StudentCourse: student.StudentCourse,
              StudentTel: student.StudentTel,
              StudentGender: student.StudentGender,
              StudentDOB: student.StudentDOB,
              StudentSubject: student.StudentSubject,
              userType: student.userType,
              StudentName: student.StudentName
          };

          res.json({
              success: true,
              studentDetails: studentDetails
          });
      } else {
          // Student not found
          res.json({ success: false, message: 'Student not found in the database' });
      }

      client.close();
  } catch (err) {
      console.error(err);
      res.json({ success: false, message: 'Error occurred' });
  }
});

// New route to check instructor
app.post('/checkInstructor', async (req, res) => {
  try {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const database = client.db("Entities");
      const collection = database.collection("Instructor");

      const instructorName = req.body.instructorName;
      const instructor = await collection.findOne({ InstructorName: instructorName });

      if (instructor) {
          // Instructor found in the database
          res.json({ exists: true });
      } else {
          // Instructor not found
          res.json({ exists: false });
      }

      client.close();
  } catch (err) {
      console.error(err);
      res.json({ exists: false, message: 'Error occurred while checking instructor' });
  }
});

// Your existing route to submit form with lecturer's signature
app.post('/submitFormWithSignature', (req, res) => {
  const lecturerSignature = req.body.lecturerSignature;

  // Process the form submission with the lecturer's signature as needed
  console.log('Form submitted with lecturer\'s signature:', lecturerSignature);

  // You can send a response back to the client if needed
  res.json({ success: true, message: 'Form submitted successfully with lecturer\'s signature' });
});

app.post('/submitAbsenceForm', async (req, res) => {
  try {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const database = client.db("Entities"); // Replace with your actual database name
      const collection = database.collection("AbsentForm");

      // Extract form data from the request
      const { studentID, dateAbsentFrom, dateAbsentUntil, reason, proof, subjects, instructors } = req.body;

      // Construct the absence form object
      const absenceForm = {
          studentID,
          dateAbsentFrom,
          dateAbsentUntil,
          reason,
          proof,
          subjects,
          instructors,
          status: "Pending" // Add a status field to track the approval status
      };

      // Insert the absence form into the collection
      await collection.insertOne(absenceForm);

      res.json({ success: true, message: 'Absence form submitted successfully' });
  } catch (err) {
      console.error(err);
      res.json({ success: false, message: 'Error occurred while submitting absence form' });
  } finally {
      client.close();
  }
});

app.post('/getTotalClassAttended', async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const studentCollection = client.db("Entities").collection("Student");

    // Find the student by StudentID
    const student = await studentCollection.findOne({ StudentID: studentId });

    if (student) {
      res.json({ success: true, totalClassAttended: student.TotalClassAttended });
    } else {
      res.json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching TotalClassAttended:', error);
    res.status(500).json({ success: false, message: 'Error fetching TotalClassAttended' });
  }
});

async function getStudentTotalClasses(studentId) {
  try {
    const studentCollection = client.db("Entities").collection("Student");
    const student = await studentCollection.findOne({ StudentID: studentId });

    if (student && student.StudentCurSem) {
      const subjectCollection = client.db("Entities").collection("Subject");
      const subjectsData = await subjectCollection.findOne({ semester: student.StudentCurSem });

      if (subjectsData && subjectsData.subjects && subjectsData.subjects.length > 0) {
        return calculateTotalClasses(subjectsData.subjects);
      } else {
        console.error('Subjects not found for the current semester:', student.StudentCurSem);
        return null;
      }
    } else {
      console.error('Student not found or missing current semester information.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching student TotalClasses:', error);
    return null;
  }
}

function calculateTotalClasses(subjects) {
  let totalClasses = 0;

  subjects.forEach(subject => {
    totalClasses += subject.daysPerWeek * subject.weeks;
  });

  return totalClasses;
}

app.post('/updateTotalClasses', async (req, res) => {
  try {
    const { studentId } = req.body;

    const totalClasses = await getStudentTotalClasses(studentId);

    if (totalClasses !== null) {
      const result = await client.db("Entities").collection("Student").updateOne(
        { StudentID: studentId },
        { $set: { TotalClasses: totalClasses } }
      );

      if (result.modifiedCount > 0) {
        res.json({ success: true, message: 'TotalClasses updated successfully', totalClasses });
      } else {
        res.json({ success: false, message: 'TotalClasses not updated' });
      }
    } else {
      res.json({ success: false, message: 'Error calculating TotalClasses or student not found' });
    }
  } catch (error) {
    console.error('Error updating TotalClasses:', error);
    res.status(500).json({ success: false, message: 'Error updating TotalClasses' });
  }
});

app.post('/getTotalClasses', async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const studentCollection = client.db("Entities").collection("Student");

    // Find the student by StudentID
    const student = await studentCollection.findOne({ StudentID: studentId });

    if (student) {
      res.json({ success: true, totalClasses: student.TotalClasses });
    } else {
      res.json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching TotalClasses:', error);
    res.status(500).json({ success: false, message: 'Error fetching TotalClasses' });
  }
});

app.post('/updateAttendanceRate', async (req, res) => {
  try {
    const { studentId, attendanceRate } = req.body;

    const result = await client.db("Entities").collection("Student").updateOne(
      { StudentID: studentId },
      { $set: { AttendanceRate: parseFloat(attendanceRate) } }
    );

    if (result.modifiedCount > 0) {
      res.json({ success: true, message: 'Attendance Rate updated successfully', attendanceRate });
    } else {
      res.json({ success: false, message: 'Attendance Rate not updated' });
    }
  } catch (error) {
    console.error('Error updating Attendance Rate:', error);
    res.status(500).json({ success: false, message: 'Error updating Attendance Rate' });
  }
});

app.get('/getAttendanceReport', async (req, res) => {
  try {
      const collection = client.db("Entities").collection('Attendance');

      // Exclude the _id field from the projection
      const projection = { _id: 0 };

      const attendanceData = await collection.find({}, { projection }).toArray();

      res.json(attendanceData);
  } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.listen(5500, () => console.log('Server Started!'));

// client.connect()
//     .then(() => {
//         db = client.db('Entities');
       
//     })
//     .catch(err => console.error('Error connecting to the database:', err));

// app.get('/subjects', async (req, res) => {
//     try {
//         const subjects = await db.collection('Subject').find().toArray();
//         res.json(subjects);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.post('/deleteSubject', async (req, res) => {
//   try {
//       await client.connect();
//       const db = client.db("Entities");
//       const collection = db.collection('Subject');
//       const subjectId = req.body.subjectId;

//       const result = await collection.deleteOne({ _id: subjectId });
//       if (result.deletedCount === 1) {
//           res.json({ success: true });
//       } else {
//           res.json({ success: false, message: 'No subject found with that ID.' });
//       }
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });
// app.listen(5500, () => console.log('Server Started!'));

// app.get('/fetchStudentDetails', async (req, res) => {
//   try {
//     const studentId = req.query.studentId;
//     const collection = client.db("Entities").collection("Student");
//     const student = await collection.findOne({ StudentID: studentId });

//     if (student) {
//       res.json({
//         success: true,
//         studentId: student.StudentID,
//         studentEmail: student.StudentEmail,
//         // Add more fields as needed
//       });
//     } else {
//       res.json({ success: false, message: 'Student not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching student details:', error);
//     res.json({ success: false, message: 'Error fetching student details' });
//   }
// });



