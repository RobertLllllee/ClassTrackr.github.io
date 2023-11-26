// function showProfileForm() {
//     const userType = document.getElementById('usertype').value;
//     const profileFormContainer = document.getElementById('profileFormContainer');

//     if (userType === 'Student') {
//         profileFormContainer.innerHTML = getStudentForm();
//     } else if (userType === 'Instructor') {
//         profileFormContainer.innerHTML = getInstructorForm();
//     }
// }

// function getStudentForm() {
//     return `
//         <label for="studentID">Student ID:</label>
//         <input type="text" name="studentID" required><br>

//         <label for="studentName">Student Name:</label>
//         <input type="text" name="studentName" required><br>

//         <label for="studentEmail">Student Email:</label>
//         <input type="email" name="studentEmail" required><br>

//         <label for="studentSession">Student Session:</label>
//         <input type="text" name="studentSession" required><br>

//         <label for="studentSection">Student Section:</label>
//         <input type="text" name="studentSection" required><br>

//         <label for="studentCourse">Student Course:</label>
//         <input type="text" name="studentCourse" required><br>

//         <label for="studentTel">Student Telephone:</label>
//         <input type="tel" name="studentTel" required><br>

//         <label for="studentGender">Student Gender:</label>
//         <select name="studentGender" required>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//         </select><br>

//         <label for="studentDOB">Student Date of Birth:</label>
//         <input type="date" name="studentDOB" required><br>

//         <label for="studentPass">Student Password:</label>
//         <input type="password" name="studentPass" required><br>

//         <label for="totalClasses">Total Classes:</label>
//         <input type="number" name="totalClasses" value="0" required><br>

//         <label for="totalClassAttended">Total Class Attended:</label>
//         <input type="number" name="totalClassAttended" value="0" required><br>

//         <label for="attendanceRate">Attendance Rate:</label>
//         <input type="number" name="attendanceRate" step="0.01" value="0.0" required><br>

//         <label for="studentCurSem">Student Current Semester:</label>
//         <input type="number" name="studentCurSem" required><br>
//     `;
// }

// function getInstructorForm() {
//     return `
//         <label for="instructorID">Instructor ID:</label>
//         <input type="text" name="instructorID" required><br>

//         <label for="instructorName">Instructor Name:</label>
//         <input type="text" name="instructorName" required><br>

//         <label for="instructorPass">Instructor Password:</label>
//         <input type="password" name="instructorPass" required><br>

//         <label for="instructorEmail">Instructor Email:</label>
//         <input type="email" name="instructorEmail" required><br>

//         <label for="instructorGender">Instructor Gender:</label>
//         <select name="instructorGender" required>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//         </select><br>

//         <label for="instructorDOBYear">Instructor DOB Year:</label>
//         <input type="text" name="instructorDOBYear" required><br>

//         <label for="instructorDOBMonth">Instructor DOB Month:</label>
//         <input type="text" name="instructorDOBMonth" required><br>

//         <label for="instructorDOBDay">Instructor DOB Day:</label>
//         <input type="text" name="instructorDOBDay" required><br>
//     `;
// }

// document.getElementById('createProfileForm').addEventListener('submit', function (event) {
//     event.preventDefault();

//     const form = event.target;
//     const formData = new FormData(form);

//     const userType = formData.get('usertype');
//     const url = userType === 'Student' ? 'http://localhost:5500/create-student' : 'http://localhost:5500/create-instructor';

//     // Validate before submitting
//     validateProfile(formData, userType, url);
// });

// function validateProfile(formData, userType, url) {
//     const name = formData.get(userType.toLowerCase() + 'Name');
//     const id = formData.get(userType.toLowerCase() + 'ID');

//     // Fetch request to check if profile with the same name or ID already exists
//     fetch(`http://localhost:5500/check-profile?name=${name}&id=${id}&type=${userType}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.exists) {
//                 alert(`A ${userType.toLowerCase()} with the same name or ID already exists.`);
//             } else {
//                 submitProfile(formData, url);
//             }
//         })
//         .catch(error => {
//             console.error('Error checking profile existence:', error.message);
//         });
// }

// function submitProfile(formData, url) {
//     // Send the data to the server using Fetch API
//     fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams(formData),
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.text();
//         })
//         .then(responseText => {
//             console.log('Profile created successfully:', responseText);
//         })
//         .catch(error => {
//             console.error('Error creating profile:', error.message);
//         });
// }
async function performAction() {
    const userType = document.getElementById('userType').value;
    const action = document.querySelector('input[name="action"]:checked').value;
  
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
        if (action === 'display') {
          clearTable(); // Clear existing table
          displayData(result.data);
        } else if (action === 'create') {  // Make sure to check if the action is 'create'
          if (userType === 'student' || userType === 'instructor') {
            const form = createForm(userType);
            document.body.appendChild(form);
          } else {
            alert('Invalid user type');
          }
        }
      } else {
        alert(result.error || 'Error performing action');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error performing action');
    }
}
  
function clearTable() {
    const existingTable = document.querySelector('table');
    if (existingTable) {
      existingTable.remove();
    }
}
  
function displayData(data) {
    const table = document.createElement('table');
    table.id = 'dataTable';
  
    // Assuming the data is an array of objects
    if (data.length > 0) {
      // Create header row
      const headerRow = table.insertRow();
      for (const key in data[0]) {
        const cell = headerRow.insertCell();
        cell.appendChild(document.createTextNode(key));
      }
  
      // Create data rows
      for (const item of data) {
        const row = table.insertRow();
        for (const key in item) {
          const cell = row.insertCell();
  
          // Check if the current key corresponds to a date field (ending with "DOB")
          if (key.endsWith('DOB')) {
            // Format the date and set the cell content
            cell.appendChild(document.createTextNode(formatDOB(item[key])));
          } else {
            // For other fields, directly set the cell content
            cell.appendChild(document.createTextNode(item[key]));
          }
        }
      }
    }
  
    document.body.appendChild(table);
}
  
// Function to format date of birth
function formatDOB(dobArray) {
    if (!Array.isArray(dobArray) || dobArray.length === 0) {
      return ''; // Handle empty or invalid data
    }
  
    const dobObject = dobArray[0];
    const year = dobObject?.Year || '';
    const month = dobObject?.Month || '';
    const day = dobObject?.Day || '';
  
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function createForm(userType) {
    // Remove existing form, if any
    const existingForm = document.getElementById('createForm');
    if (existingForm) {
      existingForm.remove();
    }
  
    const form = document.createElement('form');
    form.id = 'createForm';
    form.addEventListener('submit', (e) => validateAndSubmit(e, userType));
  
    const idLabel = document.createElement('label');
    idLabel.textContent = `${userType === 'student' ? 'Student' : 'Instructor'} ID:`;
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.name = 'id';
    form.appendChild(idLabel);
    form.appendChild(idInput);
    form.appendChild(document.createElement('br'));
  
    const nameLabel = document.createElement('label');
    nameLabel.textContent = `${userType === 'student' ? 'Student' : 'Instructor'} Name:`;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'name';
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(document.createElement('br'));
  
    const telLabel = document.createElement('label');
    telLabel.textContent = `${userType === 'student' ? 'Student' : 'Instructor'} Telephone:`;
    const telInput = document.createElement('input');
    telInput.type = 'text';
    telInput.name = 'tel';
    form.appendChild(telLabel);
    form.appendChild(telInput);
    form.appendChild(document.createElement('br'));
  
    const emailLabel = document.createElement('label');
    emailLabel.textContent = `${userType === 'student' ? 'Student' : 'Instructor'} Email:`;
    const emailInput = document.createElement('input');
    emailInput.type = 'text';
    emailInput.name = 'email';
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(document.createElement('br'));
  
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Create/Check';
    form.appendChild(submitButton);
  
    return form;
}
  
async function validateAndSubmit(event, userType) {
    event.preventDefault();
  
    const id = document.forms['createForm']['id'].value;
    const name = document.forms['createForm']['name'].value;
    const tel = document.forms['createForm']['tel'].value;
    const email = document.forms['createForm']['email'].value;
  
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
          alert('Validation successful! Proceed to the next form.');
          // Now you can proceed with displaying additional forms
          // Add logic to display the next form based on user type
          if (userType === 'student') {
            // Display the form for additional student data
            const additionalStudentForm = createAdditionalStudentForm();
            document.body.appendChild(additionalStudentForm);
          } else if (userType === 'instructor') {
            // Display the form for additional instructor data
            const additionalInstructorForm = createAdditionalInstructorForm();
            document.body.appendChild(additionalInstructorForm);
          }
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

  function createAdditionalStudentForm() {
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => validateAndSubmit(e, 'student'));
  
      // New fields for Student
  const sessionLabel = document.createElement('label');
  sessionLabel.textContent = 'Student Session:';
  const sessionInput = document.createElement('input');
  sessionInput.type = 'text';
  sessionInput.name = 'session';
  form.appendChild(sessionLabel);
  form.appendChild(sessionInput);
  form.appendChild(document.createElement('br'));

  const sectionLabel = document.createElement('label');
  sectionLabel.textContent = 'Student Section:';
  const sectionInput = document.createElement('input');
  sectionInput.type = 'text';
  sectionInput.name = 'section';
  form.appendChild(sectionLabel);
  form.appendChild(sectionInput);
  form.appendChild(document.createElement('br'));

  const courseLabel = document.createElement('label');
  courseLabel.textContent = 'Student Course:';
  const courseInput = document.createElement('input');
  courseInput.type = 'text';
  courseInput.name = 'course';
  form.appendChild(courseLabel);
  form.appendChild(courseInput);
  form.appendChild(document.createElement('br'));

  const genderLabel = document.createElement('label');
  genderLabel.textContent = 'Student Gender:';
  const genderInput = document.createElement('input');
  genderInput.type = 'text';
  genderInput.name = 'gender';
  form.appendChild(genderLabel);
  form.appendChild(genderInput);
  form.appendChild(document.createElement('br'));

  // Automatically set values for Student
  const totalClassesInput = document.createElement('input');
  totalClassesInput.type = 'hidden';
  totalClassesInput.name = 'totalClasses';
  totalClassesInput.value = '0';
  form.appendChild(totalClassesInput);

  const totalClassAttendedInput = document.createElement('input');
  totalClassAttendedInput.type = 'hidden';
  totalClassAttendedInput.name = 'totalClassAttended';
  totalClassAttendedInput.value = '0';
  form.appendChild(totalClassAttendedInput);

  const attendanceRateInput = document.createElement('input');
  attendanceRateInput.type = 'hidden';
  attendanceRateInput.name = 'attendanceRate';
  attendanceRateInput.value = '0';
  form.appendChild(attendanceRateInput);

  const yearLabel = document.createElement('label');
  yearLabel.textContent = 'Year:';
  const yearInput = document.createElement('input');
  yearInput.type = 'text';
  yearInput.name = 'year';
  form.appendChild(yearLabel);
  form.appendChild(yearInput);
  form.appendChild(document.createElement('br'));

  const monthLabel = document.createElement('label');
  monthLabel.textContent = 'Month:';
  const monthInput = document.createElement('input');
  monthInput.type = 'text';
  monthInput.name = 'month';
  form.appendChild(monthLabel);
  form.appendChild(monthInput);
  form.appendChild(document.createElement('br'));

  const dayLabel = document.createElement('label');
  dayLabel.textContent = 'Day:';
  const dayInput = document.createElement('input');
  dayInput.type = 'text';
  dayInput.name = 'day';
  form.appendChild(dayLabel);
  form.appendChild(dayInput);
  form.appendChild(document.createElement('br'));

  const curSemLabel = document.createElement('label');
  curSemLabel.textContent = 'Student Current Semester:';
  const curSemInput = document.createElement('input');
  curSemInput.type = 'text';
  curSemInput.name = 'curSem';
  form.appendChild(curSemLabel);
  form.appendChild(curSemInput);
  form.appendChild(document.createElement('br'));

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Student Data';
  form.appendChild(submitButton);

  return form;
}
  
function createAdditionalInstructorForm() {
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => validateAndSubmit(e, 'instructor'));
  
    // New fields for Instructor
  const passLabel = document.createElement('label');
  passLabel.textContent = 'Instructor Password:';
  const passInput = document.createElement('input');
  passInput.type = 'text';
  passInput.name = 'pass';
  form.appendChild(passLabel);
  form.appendChild(passInput);
  form.appendChild(document.createElement('br'));

  const genderLabel = document.createElement('label');
  genderLabel.textContent = 'Instructor Gender:';
  const genderInput = document.createElement('input');
  genderInput.type = 'text';
  genderInput.name = 'gender';
  form.appendChild(genderLabel);
  form.appendChild(genderInput);
  form.appendChild(document.createElement('br'));

  // Automatically set values for Instructor
  const yearLabel = document.createElement('label');
  yearLabel.textContent = 'Year:';
  const yearInput = document.createElement('input');
  yearInput.type = 'text';
  yearInput.name = 'year';
  form.appendChild(yearLabel);
  form.appendChild(yearInput);
  form.appendChild(document.createElement('br'));

  const monthLabel = document.createElement('label');
  monthLabel.textContent = 'Month:';
  const monthInput = document.createElement('input');
  monthInput.type = 'text';
  monthInput.name = 'month';
  form.appendChild(monthLabel);
  form.appendChild(monthInput);
  form.appendChild(document.createElement('br'));

  const dayLabel = document.createElement('label');
  dayLabel.textContent = 'Day:';
  const dayInput = document.createElement('input');
  dayInput.type = 'text';
  dayInput.name = 'day';
  form.appendChild(dayLabel);
  form.appendChild(dayInput);
  form.appendChild(document.createElement('br'));

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Instructor Data';
  form.appendChild(submitButton);

  return form;
}
