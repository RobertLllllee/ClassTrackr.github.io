document.getElementById('sidebar-toggle-btn').addEventListener('click', function () {
  var sidebar = document.querySelector('.sidebar');
  var mainHeader = document.querySelector('.main-header');
  var mainContent = document.querySelector('.main-content');

  if (sidebar.classList.contains('sidebar-closed')) {
    sidebar.classList.remove('sidebar-closed');
    mainHeader.style.left = '255px';
    mainContent.style.marginLeft = '250px';
  } else {
    sidebar.classList.add('sidebar-closed');
    mainHeader.style.left = '0';
    mainContent.style.marginLeft = '0';
  }
});

document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Make a GET request to fetch the current student's ID
    const response = await fetch('http://localhost:5500/fetchStudentId', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      const studentId = data.studentId;

      // Make a GET request to fetch the current semester and subjects for the student
      const response = await fetch(`http://localhost:5500/fetchStudentCurSemSubjects?studentId=${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        const currentSemester = result.currentSemester;
        const subjectsData = result.subjects;

        // Display the fetched data on the page
        document.getElementById('userID').textContent = studentId;
        document.getElementById('semester').textContent = `Current Semester: ${currentSemester}`;

        const subjectsContainer = document.getElementById('subjects-container');
        subjectsContainer.innerHTML = '<h2>Subjects</h2>';

        if (subjectsData.length > 0) {
          const ul = document.createElement('ul');

          subjectsData.forEach(subjectGroup => {
            subjectGroup.subjects.forEach(subject => {
              const li = document.createElement('li');
              li.textContent = subject.name;
              ul.appendChild(li);
            });
          });

          subjectsContainer.appendChild(ul);
        } else {
          subjectsContainer.innerHTML = '<p>No subjects available for the current semester</p>';
        }
      } else {
        console.error('Error fetching current semester and subjects:', result.message);
      }
    } else {
      console.error('Error fetching student ID:', data.message);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
