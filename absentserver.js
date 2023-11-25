const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');
const cors = require('cors');

app.use(cors());

const uri = "mongodb+srv://hongleejun:nQBHTHJQCBsPrCpQ@cluster0.laejwaw.mongodb.net/Entities";

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

app.listen(5500, () => console.log('Server started'));

