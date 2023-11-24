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

  document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('http://localhost:5500/subjects');
        if (response.ok) {
            const subjectsData = await response.json();
            displaySubjects(subjectsData);
        } else {
            console.error('Error fetching subjects:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
});

function displaySubjects(data) {
    const container = document.getElementById('subjectsList');
    data.forEach(course => {
        const courseElem = document.createElement('div');
        courseElem.className = 'course';

        let subjectsHtml = '';
        if (course.subjects && Array.isArray(course.subjects)) {
            subjectsHtml = course.subjects.map(subject => {
                return `<div class="subject-item">${subject.name} - Days per Week: ${subject.daysPerWeek}, Weeks: ${subject.weeks}</div>`;
            }).join('');
        }

        courseElem.innerHTML = `
            <h3>${course.course_code} - Semester: ${course.semester}</h3>
            <div>${subjectsHtml}</div>
        `;
        container.appendChild(courseElem);
    });
}

function editSubject(subjectId) {
  // Code to handle editing a subject
  // This could involve showing a form to the user to edit the subject details
  // After the user submits the form, send a request to the server with the updated data
}

function deleteSubject(subjectId) {
  if (confirm('Are you sure you want to delete this subject?')) {
      fetch('/deleteSubject', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subjectId: subjectId }),
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Remove the subject from the DOM or refresh the subject list
              console.log('Subject deleted successfully');
          } else {
              console.error('Failed to delete the subject');
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
}
