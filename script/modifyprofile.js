// Function to perform actions
async function performAction() {
    const userType = document.getElementById('userType').value;
    const action = document.querySelector('input[name="action"]:checked').value;

    if (action === 'display') {
        // If the action is 'display', proceed to fetch and display data
        try {
            const response = await fetch('http://localhost:5500/admin/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, userType }),
            });

            const result = await response.json();

            if (response.ok) {
                clearTable(); // Clear existing table
                displayData(result.data, userType); // Pass userType to displayData function
            } else {
                alert(result.error || 'Error performing action');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error performing action');
        }
    } else if (action === 'create') {
        // If the action is 'create', display the form for creating a profile
        if (userType === 'student' || userType === 'instructor') {
            const form = createForm(userType);
            document.body.appendChild(form);
        } else {
            alert('Invalid user type');
        }
    }
}

// Function to clear existing table
function clearTable() {
    const existingTable = document.querySelector('table');
    if (existingTable) {
        existingTable.remove();
    }
}

// Function to display data
function displayData(data, userType) {
    const table = document.createElement('table');
    table.id = 'dataTable';

    // Define columns based on user type
    const columns = userType === 'student'
        ? [
              { key: 'StudentID', label: 'Student ID' },
              { key: 'StudentName', label: 'Student Name' },
              { key: 'StudentEmail', label: 'Student Email' },
              { key: 'StudentSession', label: 'Student Session' },
              { key: 'StudentSection', label: 'Student Section' },
              { key: 'StudentCourse', label: 'Student Course' },
              { key: 'StudentTel', label: 'Student Telephone' },
              { key: 'StudentGender', label: 'Student Gender' },
              { key: 'StudentDOB', label: 'Student Date of Birth' },
              { key: 'StudentCurSem', label: 'Student Current Semester' },
              { key: 'TotalClasses', label: 'Total Classes' },
              { key: 'TotalClassAttended', label: 'Total Classes Attended' },
              { key: 'AttendanceRate', label: 'Attendance Rate' },
              { key: 'actions', label: 'Actions' },
          ]
        : userType === 'instructor'
        ? [
              { key: 'InstructorID', label: 'Instructor ID' },
              { key: 'InstructorName', label: 'Instructor Name' },
              { key: 'InstructorEmail', label: 'Instructor Email' },
              { key: 'InstructorTel', label: 'Instructor Telephone' },
              { key: 'InstructorGender', label: 'Instructor Gender' },
              { key: 'InstructorDOB', label: 'Instructor Date of Birth' },
              { key: 'actions', label: 'Actions' },
          ]
        : [];

      // Add header row
      const headerRow = table.insertRow();
      columns.forEach((column) => {
          const headerCell = document.createElement('th');
          headerCell.textContent = column.label;
          headerRow.appendChild(headerCell);
      });
  
      for (const item of data) {
        const dataRow = table.insertRow();
        columns.forEach((column) => {
            const cell = dataRow.insertCell();
            const value = column.key.includes('.')
                ? getNestedPropertyValue(item, column.key)
                : column.key === 'AttendanceRate'
                ? `${item[column.key]}%`
                : item[column.key];
            cell.textContent = value;

        });
    }
  
      document.body.appendChild(table);
  }

// Function to create the initial form for ID, Name, Tel, and Email
function createForm(userType) {
    // Remove existing form, if any
    const existingForm = document.getElementById('createForm');
    if (existingForm) {
        existingForm.remove();
    }

    const form = document.createElement('form');
    form.id = 'createForm';
    form.addEventListener('submit', (e) => validateAndSubmit(e, userType));

    // Create basic fields for ID, Name, Tel, and Email
    const idLabel = document.createElement('label');
    idLabel.textContent = `${userType.charAt(0).toUpperCase()}${userType.slice(1)} ID:`;
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.name = `${userType.charAt(0).toUpperCase()}${userType.slice(1)}ID`; // Change input name
    form.appendChild(idLabel);
    form.appendChild(idInput);
    form.appendChild(document.createElement('br'));

    const nameLabel = document.createElement('label');
    nameLabel.textContent = `${userType.charAt(0).toUpperCase()}${userType.slice(1)} Name:`;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = `${userType.charAt(0).toUpperCase()}${userType.slice(1)}Name`; // Change input name
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(document.createElement('br'));

    const telLabel = document.createElement('label');
    telLabel.textContent = `${userType.charAt(0).toUpperCase()}${userType.slice(1)} Telephone:`;
    const telInput = document.createElement('input');
    telInput.type = 'text';
    telInput.name = `${userType.charAt(0).toUpperCase()}${userType.slice(1)}Tel`; // Change input name
    form.appendChild(telLabel);
    form.appendChild(telInput);
    form.appendChild(document.createElement('br'));

    const emailLabel = document.createElement('label');
    emailLabel.textContent = `${userType.charAt(0).toUpperCase()}${userType.slice(1)} Email:`;
    const emailInput = document.createElement('input');
    emailInput.type = 'text';
    emailInput.name = `${userType.charAt(0).toUpperCase()}${userType.slice(1)}Email`; // Change input name
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(document.createElement('br'));

    // Additional fields based on user type
    if (userType === 'student') {
        createStudentFields(form);
    } else if (userType === 'instructor') {
        createInstructorFields(form);
    }

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Validate and Submit';
    form.appendChild(submitButton);

    return form;
}

// Function to create additional form fields for student data
function createStudentFields(form) {
    const sessionLabel = document.createElement('label');
    sessionLabel.textContent = 'Student Session:';
    const sessionInput = document.createElement('input');
    sessionInput.type = 'text';
    sessionInput.name = 'StudentSession';  // Corrected field name here
    form.appendChild(sessionLabel);
    form.appendChild(sessionInput);
    form.appendChild(document.createElement('br'));

    const sectionLabel = document.createElement('label');
    sectionLabel.textContent = 'Student Section:';
    const sectionInput = document.createElement('input');
    sectionInput.type = 'text';
    sectionInput.name = 'StudentSection';  // Corrected field name here
    form.appendChild(sectionLabel);
    form.appendChild(sectionInput);
    form.appendChild(document.createElement('br'));

    const courseLabel = document.createElement('label');
    courseLabel.textContent = 'Student Course:';
    const courseInput = document.createElement('input');
    courseInput.type = 'text';
    courseInput.name = 'StudentCourse';  // Corrected field name here
    form.appendChild(courseLabel);
    form.appendChild(courseInput);
    form.appendChild(document.createElement('br'));

    const genderLabel = document.createElement('label');
    genderLabel.textContent = 'Student Gender:';
    const genderInput = document.createElement('input');
    genderInput.type = 'text';
    genderInput.name = 'StudentGender';  // Corrected field name here
    form.appendChild(genderLabel);
    form.appendChild(genderInput);
    form.appendChild(document.createElement('br'));

    const studentdobLabel = document.createElement('label');
    studentdobLabel.textContent = 'Student Date of Birth (YYYY/MM/DD):';
    const studentdobInput = document.createElement('input');
    studentdobInput.type = 'text';
    studentdobInput.name = 'StudentDOB';  // Corrected field name here
    form.appendChild(studentdobLabel);
    form.appendChild(studentdobInput);
    form.appendChild(document.createElement('br'));

    const curSemLabel = document.createElement('label');
    curSemLabel.textContent = 'Student Current Semester:';
    const curSemInput = document.createElement('input');
    curSemInput.type = 'text';
    curSemInput.name = 'StudentCurSem';  // Corrected field name here
    form.appendChild(curSemLabel);
    form.appendChild(curSemInput);
    form.appendChild(document.createElement('br'));

    const passLabel = document.createElement('label');
    passLabel.textContent = 'Student Password:';
    const passInput = document.createElement('input');
    passInput.type = 'password';  // Use 'password' type for password input
    passInput.name = 'StudentPass';  // Corrected field name here
    form.appendChild(passLabel);
    form.appendChild(passInput);
    form.appendChild(document.createElement('br'));
}

// Function to create additional form fields for instructor data
function createInstructorFields(form) {
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Instructor Password:';
    const passInput = document.createElement('input');
    passInput.type = 'text';
    passInput.name = 'InstructorPass';  // Corrected field name here
    form.appendChild(passLabel);
    form.appendChild(passInput);
    form.appendChild(document.createElement('br'));

    const genderLabel = document.createElement('label');
    genderLabel.textContent = 'Instructor Gender:';
    const genderInput = document.createElement('input');
    genderInput.type = 'text';
    genderInput.name = 'InstructorGender';  // Corrected field name here
    form.appendChild(genderLabel);
    form.appendChild(genderInput);
    form.appendChild(document.createElement('br'));

    const instructordobLabel = document.createElement('label');
    instructordobLabel.textContent = 'Instructor Date of Birth (YYY/MM/DD):';
    const instructordobInput = document.createElement('input');
    instructordobInput.type = 'text';
    instructordobInput.name = 'InstructorDOB';  // Corrected field name here
    form.appendChild(instructordobLabel);
    form.appendChild(instructordobInput);
    form.appendChild(document.createElement('br'));
}

async function validateAndSubmit(event, userType) {
    event.preventDefault();

    const id = document.forms['createForm'][`${userType.charAt(0).toUpperCase()}${userType.slice(1)}ID`]?.value;
    const name = document.forms['createForm'][`${userType.charAt(0).toUpperCase()}${userType.slice(1)}Name`]?.value;
    const tel = document.forms['createForm'][`${userType.charAt(0).toUpperCase()}${userType.slice(1)}Tel`]?.value;
    const email = document.forms['createForm'][`${userType.charAt(0).toUpperCase()}${userType.slice(1)}Email`]?.value;

    // Validate the provided data
    try {
        const response = await fetch('http://localhost:5500/admin/actions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validate',
                userType,
                profile: {
                    [`${userType}ID`]: id,
                    [`${userType}Name`]: name,
                    [`${userType}Tel`]: tel,
                    [`${userType}Email`]: email,
                },
            }),
        });

        const result = await response.json();

        if (response.ok) {
            if (result.valid) {
                alert('Validation successful! Proceeding to submit.');

                // Proceed to submit data
                submitData(userType);
            } else {
                alert('Validation failed! The data already exists. Please retype the data.');
            }
        } else {
            alert(result.error || 'Error performing action');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error performing action');
    }
}

async function submitData(userType) {
    const formData = new FormData(document.forms['createForm']);
    
    // Create an object from form data and add userType field
    const additionalData = {
        ...Object.fromEntries(formData.entries()),
        userType: userType.charAt(0).toUpperCase() + userType.slice(1), // Ensure userType is capitalized
    };

    // Add logic to set default values for student profile fields
    if (userType === 'student') {
        additionalData.TotalClasses = 0;
        additionalData.TotalClassAttended = 0;
        additionalData.AttendanceRate = 0.0;
    }

    try {
        const response = await fetch('http://localhost:5500/admin/actions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create',
                userType,
                profile: additionalData,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Profile created successfully');
            // Add logic to reset the form or navigate to another page if needed
        } else {
            alert(result.error || 'Error inserting data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error inserting data');
    }
}

// Initial setup - add an event listener for the 'Perform Action' button
document.getElementById('performActionButton').addEventListener('click', performAction);
