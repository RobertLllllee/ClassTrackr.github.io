console.log("checkAttrate.js loaded");

document.addEventListener("DOMContentLoaded", async function () {
    try {
      // Fetch student attendance rate data
      const response = await fetch('http://localhost:5500/fetchStudentAttendanceRate');
      const data = await response.json();
  
      if (data.success) {
        // Display data in the table
        displayAttendanceData(data.studentDetails);
      } else {
        console.error('Error fetching student attendance rate:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  
  function displayAttendanceData(studentDetails) {
    const tableBody = document.querySelector("#attendanceTable tbody");
  
    // Clear existing table rows
    tableBody.innerHTML = '';
  
    // Iterate through student details and create table rows
    studentDetails.forEach(student => {
      const row = document.createElement("tr");
      
      // Add data to the table row
      row.innerHTML = `
        <td>${student.studentId}</td>
        <td>${student.studentName}</td>
        <td>${student.studentCurSem}</td>
        <td>${student.attendanceRate || 'N/A'}</td>
      `;
  
      // Append the row to the table body
      tableBody.appendChild(row);
    });
  }
  