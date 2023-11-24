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

// Ensure to call fetchSemesters to initialize the semesters dropdown
fetchSemesters();

populateTimeslots();
fetchSemesters();

// Variable to store modified statuses
let modifiedStatuses = {};

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

function modifyAttendanceStatus(studentId, currentStatus) {
    const newStatus = prompt("Modify attendance status (Absent, Present, Leave):", currentStatus);

    if (newStatus !== null) {
        // Call the backend endpoint to update the attendance status
        fetch('http://localhost:5500/modifyAttendanceStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Attendance status updated successfully');
                // Refresh the attendance list after modification
                const generatedCode = localStorage.getItem("generatedCode");
                if (generatedCode) {
                    fetchAttendanceList(generatedCode);
                } else {
                    console.error("No QR code has been generated.");
                }
            } else {
                console.error('Error updating attendance status:', data.message);
                // Handle the error, e.g., show an error message to the user
            }
        })
        .catch(error => {
            console.error('Error updating attendance status:', error);
            // Handle the error, e.g., show an error message to the user
        });
    }
}

function saveModifiedStatus(studentId, selectedStatus) {
    // Call the backend endpoint to save the modified attendance status
    fetch('http://localhost:5500/modifyAttendanceStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, status: selectedStatus }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Attendance status updated successfully');
            // Refresh the attendance list after modification
            // You may need to fetch the updated attendance list and call displayAttendanceList again
        } else {
            console.error('Error updating attendance status:', data.message);
            // Handle the error, e.g., show an error message to the user
        }
    })
    .catch(error => {
        console.error('Error updating attendance status:', error);
        // Handle the error, e.g., show an error message to the user
    });
}

function displayAttendanceList(attendanceList) {
    // Clear previous data
    attendanceListContainer.innerHTML = '';

    // Create a table
    const table = document.createElement('table');
    table.border = '1';

    // Create headers
    const headerRow = document.createElement('tr');
    const headers = ['Student Name', 'Student ID', 'Date', 'Timeslot', 'Subject', 'Instructor Name', 'Status', 'Action'];
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
            attendance.instructorName,
            attendance.status,
            'Modify', // Placeholder for the modify button
        ];
        data.forEach((cellData, index) => {
            const cell = document.createElement('td');
            if (index === data.length - 1) {
                // For the last cell (Action), create a modify button
                const modifyButton = document.createElement('button');
                modifyButton.textContent = 'Modify';
                modifyButton.addEventListener('click', () => {
                    // When the modify button is clicked, show the dropdown for modifying status
                    showModifyDropdown(attendance.studentId, attendance.StudentName);
                });
                cell.appendChild(modifyButton);
            } else {
                cell.textContent = cellData;
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    // Append the table to the container
    attendanceListContainer.appendChild(table);
}

function showModifyDropdown(studentId, studentName) {
    const attendanceListContainer = document.getElementById("attendanceListContainer");

    // Check if the attendanceListContainer is not null before setting innerHTML
    if (attendanceListContainer) {
        // Create a dropdown for modifying the status
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("modify-dropdown");

        const dropdownLabel = document.createElement("label");
        dropdownLabel.textContent = "Modify Status:";
        dropdownContainer.appendChild(dropdownLabel);

        const statusDropdown = document.createElement("select");
        statusDropdown.id = "statusDropdown";
        const options = ["Present", "Absent", "Leave"];
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.text = optionText;
            statusDropdown.appendChild(option);
        });

        // Set the default option to "Present"
        statusDropdown.value = "Present";

        dropdownContainer.appendChild(statusDropdown);

        // Create a button for modifying the status
        const modifyButton = document.createElement("button");
        modifyButton.textContent = "Modify";
        modifyButton.addEventListener("click", () => {
        const selectedStatus = statusDropdown.value;

        // Store the modified status in the variable
        modifiedStatuses[studentId] = selectedStatus;

        // Call a function to update the displayed status
        updateDisplayedStatus(studentId, selectedStatus);
    });

        dropdownContainer.appendChild(modifyButton);

        // Append the dropdown to the attendanceListContainer
        attendanceListContainer.appendChild(dropdownContainer);
    } else {
        console.error("Attendance List Container not found");
    }
}

function updateDisplayedStatus(studentId, newStatus) {
    // Update the displayed status in the table
    const tableRows = document.querySelectorAll("#attendanceListContainer table tr");
    tableRows.forEach(row => {
        const idCell = row.cells[1]; // Assuming the second cell is the student ID cell
        if (idCell.textContent === studentId) {
            // Update the status cell
            const statusCell = row.cells[row.cells.length - 2]; // Assuming the second-to-last cell is the status cell
            statusCell.textContent = newStatus;
        }
    });
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

function saveAttendanceList(attendanceList) {
    // Call the backend endpoint to save the attendance list
    fetch('http://localhost:5500/saveAttendanceList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceList),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Attendance list saved successfully');
            // You can provide feedback to the user, e.g., show a success message
        } else {
            console.error('Error saving attendance list:', data.message);
            // Handle the error, e.g., show an error message to the user
        }
    })
    .catch(error => {
        console.error('Error saving attendance list:', error);
        // Handle the error, e.g., show an error message to the user
    });
}

function handleModifyStatus(studentId, selectedStatus) {
    // Implement logic to update the status in your data or make a server request

    // For now, let's log the selected status
    console.log(`Student ID: ${studentId}, Selected Status: ${selectedStatus}`);
}

document.getElementById("generate-button").addEventListener("click", generateQRCode);
document.getElementById("refresh-button").addEventListener("click", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

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
document.getElementById("saveSubmitButton").addEventListener("click", async () => {
    // Prepare the data to be saved
    const date = document.getElementById("date").value;
    const timeslot = document.getElementById("timeslot").value;
    const semester = document.getElementById("semester").value;
    const subject = document.getElementById("subject").value;
    const instructorName = "Instructor Name"; // Replace with the actual instructor name

    const studentsData = [];

    // Iterate through the modifiedStatuses and prepare data for each student
    for (const [studentId, status] of Object.entries(modifiedStatuses)) {
        studentsData.push({
            studentId,
            status,
        });
    }

    // Prepare the payload to be sent to the server
    const payload = {
        date,
        timeslot,
        semester,
        subject,
        instructorName,
        studentsData,
    };

    try {
        // Send a request to your server to update/insert the data in the database
        const response = await fetch("http://localhost:5500/updateModifiedAttendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
            // Clear the modifiedStatuses variable after successfully updating the database
            modifiedStatuses = {};
            // Display a success message or take any other action as needed
            console.log("Data updated successfully");
        } else {
            console.error("Error updating data:", result.message);
            // Display an error message or take any other action as needed
        }
    } catch (error) {
        console.error("Error updating data:", error);
        // Display an error message or take any other action as needed
    }
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
