console.log('QR code generator js is loaded');

let qrContainer = document.getElementById("qrcode");
let codeContainer = document.getElementById("code");
let expiryMessage = document.getElementById("expiry-message");
let countdownContainer = document.getElementById("countdown");
let attendanceListContainer = document.getElementById("attendanceListContainer");
let countdownInterval;

function populateTimeslots() {
    const timeslotSelect = document.getElementById("timeslot");
    timeslotSelect.innerHTML = "";

    const currentDate = new Date();
    const startTime = new Date();
    startTime.setHours(8, 0, 0); // Example start time (8:00 AM)
    const endTime = new Date();
    endTime.setHours(17, 0, 0); // Example end time (5:00 PM)

    while (startTime < endTime) {
        const option = document.createElement("option");
        option.text = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        timeslotSelect.add(option);
        startTime.setTime(startTime.getTime() + 60 * 1000); // Add 1 minute
    }
}

async function fetchSubjects(semester) {
    try {
        const response = await fetch(`http://localhost:5500/fetchSubjects?semester=${semester}`);
        const subjects = await response.json();

        const subjectSelect = document.getElementById("subject");
        subjectSelect.innerHTML = "";

        if (subjects && subjects.length > 0) {
            subjects.forEach((subject, index) => {
                const option = document.createElement("option");
                option.value = subject;
                option.text = subject;
                subjectSelect.add(option);
            });
        } else {
            const defaultOption = document.createElement("option");
            defaultOption.text = "No subjects available";
            subjectSelect.add(defaultOption);
        }
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
}

async function fetchSemesters() {
    try {
        const response = await fetch('http://localhost:5500/fetchSemesters');
        const semesters = await response.json();

        const semesterSelect = document.getElementById("semester");
        semesterSelect.innerHTML = "";

        if (semesters && semesters.length > 0) {
            semesters.forEach((semester, index) => {
                const option = document.createElement("option");
                option.value = semester;
                option.text = semester;
                semesterSelect.add(option);
            });

            // Trigger fetching subjects for the default semester
            const defaultSemester = semesterSelect.value;
            fetchSubjects(defaultSemester);
        } else {
            const defaultOption = document.createElement("option");
            defaultOption.text = "No semesters available";
            semesterSelect.add(defaultOption);
        }
    } catch (error) {
        console.error('Error fetching semesters:', error);
    }
}

populateTimeslots();
fetchSemesters();

document.getElementById("semester").addEventListener("change", function() {
    const selectedSemester = this.value;
    fetchSubjects(selectedSemester);
});

function generateCustomFormat() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let customFormat = "";

    for (let i = 0; i < 6; i++) {
        customFormat += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return customFormat;
}

function fetchAttendanceList(customFormat) {
    try {
        // Fetch attendance list based on the customFormat
        fetch(`http://localhost:5500/fetchAttendanceList?customFormat=${customFormat}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display the attendance list in a table
                    displayAttendanceList(data.attendanceList);
                } else {
                    console.error('Error fetching attendance list:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching attendance list:', error);
            });
    } catch (error) {
        console.error('Error fetching attendance list:', error);
    }
}

function displayAttendanceList(attendanceList) {
    // Clear previous data
    attendanceListContainer.innerHTML = '';

    // Create a table
    const table = document.createElement('table');
    table.border = '1';

    // Create headers
    const headerRow = document.createElement('tr');
    const headers = ['Student Name', 'Student ID', 'Date', 'Timeslot', 'Subject', 'Instructor Name'];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    // Create rows with attendance data
    attendanceList.forEach(attendance => {
        const row = document.createElement('tr');
        const data = [
            attendance.StudentName,
            attendance.studentId,
            attendance.date,
            attendance.timeslot,
            attendance.subject,
            attendance.instructorName
        ];
        data.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    // Append the table to the container
    attendanceListContainer.appendChild(table);
}

function generateQRCode() {
    const date = document.getElementById("date").value;
    const timeslot = document.getElementById("timeslot").value;
    const subject = document.getElementById("subject").value;

    // Retrieve the instructor's name from localStorage or session variable
    const instructor = localStorage.getItem("instructorName") || "DefaultInstructor";

    const customFormat = generateCustomFormat();
    const qrText = `${date} - ${timeslot} - ${subject} - ${customFormat}`;

    // Log the details to the console
    console.log("Generated QR Code Details:");
    console.log("Date:", date);
    console.log("Timeslot:", timeslot);
    console.log("Subject:", subject);
    console.log("Instructor:", instructor);
    console.log("Custom Format:", customFormat);

    // Save the generated code and details to localStorage
    const details = {
        date,
        timeslot,
        subject,
        instructor,
        customFormat
    };
    localStorage.setItem("generatedDetails", JSON.stringify(details));

    // Clear previous data
    qrContainer.innerHTML = '';
    codeContainer.innerHTML = '';
    expiryMessage.innerHTML = '';
    countdownContainer.innerHTML = '';
    attendanceListContainer.innerHTML = '';

    // Create a new QR code using qrcode.js
    const qrcode = new QRCode(qrContainer, {
        text: qrText,
        width: 128,
        height: 128
    });

    // Display the code along with the QR code
    codeContainer.textContent = `Code: ${customFormat}`;

    // Save the generated code to localStorage
    localStorage.setItem("generatedCode", customFormat);

    // Fetch and display attendance list based on the customFormat
    fetchAttendanceList(customFormat);

    const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes in milliseconds

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeRemaining = expirationTime - now;

        if (timeRemaining <= 0) {
            countdownContainer.innerHTML = 'Expired';
            expiryMessage.innerHTML = 'Time limit reached. Please generate a new QR code.';
            clearInterval(countdownInterval);
        } else {
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
            countdownContainer.innerHTML = `Expires in ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

document.getElementById("generate-button").addEventListener("click", generateQRCode);

document.getElementById("refresh-button").addEventListener("click", function() {
    // Retrieve the currently generated customFormat from localStorage
    const generatedCode = localStorage.getItem("generatedCode");

    // Check if a QR code has been generated
    if (generatedCode) {
        // Call fetchAttendanceList with the currently generated customFormat
        fetchAttendanceList(generatedCode);
    } else {
        // Handle the case when no QR code has been generated
        console.error("No QR code has been generated.");
    };
});
// //Final version
// let qrContainer = document.getElementById("qrcode");
// let codeContainer = document.getElementById("code");
// let expiryMessage = document.getElementById("expiry-message");
// let countdownContainer = document.getElementById("countdown");
// let countdownInterval; // Declare the countdownInterval variable outside the function

// // Populate the timeslot dropdown with dynamic values
// function populateTimeslots() {
//     const timeslotSelect = document.getElementById("timeslot");
//     timeslotSelect.innerHTML = "";

//     const currentDate = new Date();
//     const startTime = new Date();
//     startTime.setHours(8, 0, 0); // Example start time (8:00 AM)
//     const endTime = new Date();
//     endTime.setHours(17, 0, 0); // Example end time (5:00 PM)

//     while (startTime < endTime) {
//         const option = document.createElement("option");
//         option.text = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//         timeslotSelect.add(option);
//         startTime.setTime(startTime.getTime() + 60 * 1000); // Add 1 minute
//     }
// }

// populateTimeslots(); // Initialize timeslots

// // Function to generate a custom code
// function generateCustomFormat() {
//     // Generate a random combination of alphabets (both upper and lower case) and digits (e.g., "aB1C2")
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let customFormat = "";

//     for (let i = 0; i < 6; i++) {
//         customFormat += characters.charAt(Math.floor(Math.random() * characters.length));
//     }

//     return customFormat;
// }

// // Function to generate the QR code
// function generateQRCode() {
//     // Get selected options
//     const date = document.getElementById("date").value;
//     const timeslot = document.getElementById("timeslot").value;
//     const subject = document.getElementById("subject").value;

//     // Create a custom format using alphabets (both upper and lower case) and digits
//     const customFormat = generateCustomFormat();

//     // Combine options and custom format to create QR code content and code
//     const qrText = `${date} - ${timeslot} - ${subject} - ${customFormat}`;
    
//     // Clear the previous countdown interval, if it exists
//     if (countdownInterval) {
//         clearInterval(countdownInterval);
//     }

//     // Update QR code and code containers
//     qrContainer.innerHTML = '';
//     codeContainer.innerHTML = '';
//     expiryMessage.innerHTML = '';
//     countdownContainer.innerHTML = '';

//     // Create a new QR code using qrcode.js
//     const qrcode = new QRCode(qrContainer, {
//         text: qrText,
//         width: 128,
//         height: 128
//     });

//     // Display the code along with the QR code
//     codeContainer.textContent = `Code: ${customFormat}`;

//     // Calculate the expiration time (5 minutes from now)
//     const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes in milliseconds

//     // Update the countdown timer every second
//     countdownInterval = setInterval(() => {
//         const now = new Date().getTime();
//         const timeRemaining = expirationTime - now;

//         if (timeRemaining <= 0) {
//             // Display an expiration message when the timer reaches 0
//             countdownContainer.innerHTML = 'Expired';
//             clearInterval(countdownInterval);
//         } else {
//             // Format the time remaining as minutes and seconds
//             const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
//             const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
//             countdownContainer.innerHTML = `Expires in ${minutes}m ${seconds}s`;
//         }
//     }, 1000); // Update every second
// }

// // Attach the generateQRCode function to the button click event
// document.getElementById("generate-button").addEventListener("click", generateQRCode);

//-----------------------------------------------------------------------------------------------------------------

// let qrContainer = document.getElementById("qrcode");
// let expiryMessage = document.getElementById("expiry-message");

// // Populate the timeslot dropdown with dynamic values
// function populateTimeslots() {
//     const timeslotSelect = document.getElementById("timeslot");
//     timeslotSelect.innerHTML = "";

//     const currentDate = new Date();
//     const startTime = new Date();
//     startTime.setHours(8, 0, 0); // Example start time (8:00 AM)
//     const endTime = new Date();
//     endTime.setHours(17, 0, 0); // Example end time (5:00 PM)

//     while (startTime < endTime) {
//         const option = document.createElement("option");
//         option.text = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//         timeslotSelect.add(option);
//         startTime.setTime(startTime.getTime() + 60 * 1000); // Add 1 minute
//     }
// }

// populateTimeslots(); // Initialize timeslots

// function generateQRCode() {
//     // Get selected options
//     const date = document.getElementById("date").value;
//     const timeslot = document.getElementById("timeslot").value;
//     const subject = document.getElementById("subject").value;

//     // Create a custom format using alphabets (both upper and lower case) and digits
//     const customFormat = generateCustomFormat();

//     // Combine options and custom format to create QR code content
//     const qrText = `${date} - ${timeslot} - ${subject} - ${customFormat}`;

//     // Clear any existing QR code and expiry message
//     qrContainer.innerHTML = '';
//     expiryMessage.innerHTML = '';

//     // Create a new QR code using qrcode.js
//     const qrcode = new QRCode(qrContainer, {
//         text: qrText,
//         width: 128,
//         height: 128
//     });

//     // Set a timer to remove/hide the QR code and display expiry message after 5 minutes
//     setTimeout(() => {
//         qrContainer.innerHTML = '';
//         expiryMessage.innerHTML = 'Code Expired';
//     }, 5 * 60 * 1000); // 5 minutes in milliseconds
// }

// function generateCustomFormat() {
//     // Generate a random combination of alphabets (both upper and lower case) and digits (e.g., "aB1C2")
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let customFormat = "";

//     for (let i = 0; i < 6; i++) {
//         customFormat += characters.charAt(Math.floor(Math.random() * characters.length));
//     }

//     return customFormat;
// }

// // Attach the generateQRCode function to the button click event
// document.getElementById("generate-button").addEventListener("click", generateQRCode);

// ---------------------------------------------------------------------------------------------------------------------
//testing 
// let qrContainer = document.getElementById("qrcode");
// let codeContainer = document.getElementById("code");
// let expiryMessage = document.getElementById("expiry-message");
// let countdownContainer = document.getElementById("countdown");

// // Populate the timeslot dropdown with dynamic values
// function populateTimeslots() {
//     const timeslotSelect = document.getElementById("timeslot");
//     timeslotSelect.innerHTML = "";

//     const currentDate = new Date();
//     const startTime = new Date();
//     startTime.setHours(8, 0, 0); // Example start time (8:00 AM)
//     const endTime = new Date();
//     endTime.setHours(17, 0, 0); // Example end time (5:00 PM)

//     while (startTime < endTime) {
//         const option = document.createElement("option");
//         option.text = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//         timeslotSelect.add(option);
//         startTime.setTime(startTime.getTime() + 60 * 1000); // Add 1 minute
//     }
// }

// populateTimeslots(); // Initialize timeslots

// function generateQRCode() {
//     // Get selected options
//     const date = document.getElementById("date").value;
//     const timeslot = document.getElementById("timeslot").value;
//     const subject = document.getElementById("subject").value;

//     // Create a custom format using alphabets (both upper and lower case) and digits
//     const customFormat = generateCustomFormat();

//     // Combine options and custom format to create QR code content and code
//     const qrText = `${date} - ${timeslot} - ${subject} - ${customFormat}`;
    
//     // Update QR code and code containers
//     qrContainer.innerHTML = '';
//     codeContainer.innerHTML = '';
//     expiryMessage.innerHTML = '';
//     countdownContainer.innerHTML = '';

//     // Create a new QR code using qrcode.js
//     const qrcode = new QRCode(qrContainer, {
//         text: qrText,
//         width: 128,
//         height: 128
//     });

//     // Display the code along with the QR code
//     codeContainer.textContent = `Code: ${customFormat}`;

//  // Calculate the expiration time (5 minutes from now)
//  const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes in milliseconds

//  // Update the countdown timer every second
//  countdownInterval = setInterval(() => {
//      const now = new Date().getTime();
//      const timeRemaining = expirationTime - now;

//      if (timeRemaining <= 0) {
//          // Display an expiration message when the timer reaches 0
//          countdownContainer.innerHTML = 'Expired';
//          clearInterval(countdownInterval);
//      } else {
//          // Format the time remaining as minutes and seconds
//          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
//          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
//          countdownContainer.innerHTML = `Expires in ${minutes}m ${seconds}s`;
//      }
//  }, 1000); // Update every second
// }

// function generateCustomFormat() {
//     // Generate a random combination of alphabets (both upper and lower case) and digits (e.g., "aB1C2")
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let customFormat = "";

//     for (let i = 0; i < 6; i++) {
//         customFormat += characters.charAt(Math.floor(Math.random() * characters.length));
//     }

//     return customFormat;
// }

// // Attach the generateQRCode function to the button click event
// document.getElementById("generate-button").addEventListener("click", generateQRCode);
//------------------------------------------------------------------------------------------------------------------------------
