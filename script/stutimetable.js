document.getElementById('sidebar-toggle-btn').addEventListener('click', function() {
  var sidebar = document.querySelector('.sidebar');
  var mainHeader = document.querySelector('.main-header');
  var mainContent = document.querySelector('.main-content');
  
  // Toggle sidebar logic
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
document.getElementById('checkTimetableButton').addEventListener('click', function() {
  const courseCode = document.getElementById('courseCodeInput').value;

  fetch('http://localhost:5500/getTimetable', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseCode }),
  })
  .then(response => response.json())
  .then(data => {
      const container = document.getElementById('timetableContainer');
      container.innerHTML = ''; // Clear previous content

      data.forEach(entry => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${entry.course_code}</td>
              <td>${entry.subject_name}</td>
              <td>${entry.day}</td>
              <td>${entry.time}</td>
              <td>${entry.location}</td>
              <td>${entry.section}</td>
          `;
          container.appendChild(row);
      });
  })
  .catch(error => console.error('Error:', error));
});
