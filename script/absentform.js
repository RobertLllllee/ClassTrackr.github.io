document.getElementById('sidebar-toggle-btn').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar');
    var mainHeader = document.querySelector('.main-header');
    var mainContent = document.querySelector('.main-content');
    
    // Check if the sidebar is opened or closed
    if (sidebar.classList.contains('sidebar-closed')) {
      sidebar.classList.remove('sidebar-closed');
      mainHeader.style.left = '255px'; // Adjust this value to match your sidebar width
      mainContent.style.marginLeft = '250px'; // Adjust this value to match your sidebar's width
    } else {
      sidebar.classList.add('sidebar-closed');
      mainHeader.style.left = '0';
      mainContent.style.marginLeft = '0';
    }
    
  });
  

document.addEventListener('DOMContentLoaded', function () {
    const checkStudentButton = document.getElementById('checkStudentButton');
    const studentDetailsContainer = document.getElementById('studentDetails');
    const absenceDetailsContainer = document.getElementById('absence-details');
    const absenceRequestDetailsContainer = document.getElementById('absence-request-details');

    checkStudentButton.addEventListener('click', async function () {
        const studentID = document.getElementById('studentID').value;

        try {
            const response = await fetch('http://localhost:5500/checkStudent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentID }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    updateStudentDetails(data.studentDetails);
                    toggleDetailsContainers(true, true, false);
                } else {
                    clearStudentDetails();
                    alert(data.message);
                    toggleDetailsContainers(false, false, false);
                }
            } else {
                clearStudentDetails();
                alert('Failed to retrieve student details');
                toggleDetailsContainers(false, false, false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while processing your request');
            toggleDetailsContainers(false, false, false);
        }
    });

    function updateStudentDetails(studentDetails) {
        for (const key in studentDetails) {
            if (studentDetails.hasOwnProperty(key)) {
                const element = document.getElementById(key);
                if (element) {
                    if (key === 'StudentDOB') {
                        updateDOBDetails(element, studentDetails[key]);
                    } else {
                        element.textContent = JSON.stringify(studentDetails[key]);
                    }
                }
            }
        }
    }

    function clearStudentDetails() {
        const detailElements = document.querySelectorAll('#studentDetails span');
        detailElements.forEach(element => {
            element.textContent = '';
        });
    }

    function updateDOBDetails(parentElement, dobObject) {
        for (const key in dobObject) {
            if (dobObject.hasOwnProperty(key)) {
                const element = document.getElementById(`DOB${key}`);
                if (element) {
                    element.textContent = JSON.stringify(dobObject[key]);
                }
            }
        }
    }

    function toggleDetailsContainers(showStudentDetails, showAbsenceDetails, showAbsenceRequestDetails) {
        studentDetailsContainer.style.display = showStudentDetails ? 'block' : 'none';
        absenceDetailsContainer.style.display = showAbsenceDetails ? 'block' : 'none';
        absenceRequestDetailsContainer.style.display = showAbsenceRequestDetails ? 'block' : 'none';
    }

    // Function to add another subject and instructor field
    function addSubjectInstructor() {
        const container = document.getElementById('subject-instructor-container');
        const newItem = document.createElement('div');
        newItem.innerHTML = `
            <label for="subject">Subject:</label>
            <input type="text" name="subject[]" required>
            
            <label for="instructor">Instructor:</label>
            <input type="text" name="instructor[]" required>
        `;
        container.appendChild(newItem);
    }

    // Add event listener to the "Add Another Subject and Instructor" button
    document.querySelector('button[onclick="addSubjectInstructor()"]').addEventListener('click', addSubjectInstructor);

    // Handle form submission (you can customize this part)
    const absenceForm = document.getElementById('absence-form');
    absenceForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Gather and process form data
        const absentFrom = document.getElementById('date-absent-from').value;
        const absentUntil = document.getElementById('date-absent-until').value;
        const reason = document.getElementById('reason').value;
        const proof = document.getElementById('proof').value;
        const subjects = document.querySelectorAll('input[name="subject[]"]');
        const instructors = document.querySelectorAll('input[name="instructor[]"]');

        // Display the absence request details
        document.getElementById('display-absent-from').textContent = absentFrom;
        document.getElementById('display-absent-until').textContent = absentUntil;
        document.getElementById('display-reason').textContent = reason;
        document.getElementById('display-proof').textContent = proof;

        let subjectText = "";
        for (let i = 0; i < subjects.length; i++) {
            const subject = subjects[i].value;
            const instructor = instructors[i].value;
            subjectText += `Subject ${i + 1}: ${subject}, Instructor: ${instructor}\n`;
        }
        document.getElementById('display-subject').textContent = subjectText;

        // Show the absence request details section
        toggleDetailsContainers(true, true, true);

        // Add a section for the lecturer's signature
        const lecturerSignatureContainer = document.createElement('div');
        lecturerSignatureContainer.innerHTML = `
            <h2>Lecturer's Signature</h2>
            <label for="lecturerSignature">Lecturer's Signature:</label>
            <input type="text" id="lecturerSignature" name="lecturerSignature" required><br>
            <button type="button" onclick="submitFormWithSignature()">Submit Form with Signature</button>
        `;

        // Append the new container to the document
        document.body.appendChild(lecturerSignatureContainer);

        // Add an event listener to the new button for submitting the form with the signature
        document.querySelector('button[onclick="submitFormWithSignature()"]').addEventListener('click', async function () {
            // You can handle form submission with lecturer's signature here
            alert('Form submitted with lecturer\'s signature');
        });
    });
});

// Function to check instructor
async function checkInstructor() {
    const instructorName = document.getElementById('instructorName').value;

    try {
        const response = await fetch('http://localhost:5500/checkInstructor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instructorName }),
        });

        if (response.ok) {
            const data = await response.json();

            if (data.exists) {
                alert('Instructor exists. You can submit the form.');
                // Enable the submit button or perform other actions
            } else {
                alert('Instructor does not exist. Please check the name.');
                // Disable the submit button or perform other actions
            }
        } else {
            alert('Failed to check instructor. Please try again.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while checking instructor.');
    }
}

// Function to submit form with signature
async function submitFormWithSignature() {
    const lecturerSignature = document.getElementById('lecturerSignature').value;

    try {
        const response = await fetch('http://localhost:5500/submitFormWithSignature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lecturerSignature }),
        });

        if (response.ok) {
            const data = await response.json();

            if (data.success) {
                alert('Form submitted successfully with lecturer\'s signature');
                // You can perform further actions, e.g., notify the user
            } else {
                alert('Failed to submit form with lecturer\'s signature');
            }
        } else {
            alert('Failed to submit form with lecturer\'s signature');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while submitting form with lecturer\'s signature');
    }
}
