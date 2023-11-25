async function fetchAttendanceData() {
    const attendanceDataDiv = document.getElementById('attendanceData');

    if (attendanceDataDiv) {
        try {
            const response = await fetch('http://localhost:5500/getAttendanceReport');
            const data = await response.json();

            if (data.length > 0) {
                displayAttendanceData(data);
            } else {
                attendanceDataDiv.innerHTML = '<p>No attendance data available.</p>';
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            attendanceDataDiv.innerHTML = '<p>Error fetching data. Please try again later.</p>';
        }
    } else {
        console.error('Element with ID "attendanceData" not found.');
    }
}

async function displayAttendanceData(data) {
    const attendanceDataDiv = document.getElementById('attendanceData');

    // Check if there is data to display
    if (data.length === 0) {
        attendanceDataDiv.innerHTML = '<p>No attendance data available.</p>';
        return;
    }

    // Create a table to display the attendance data
    const table = document.createElement('table');
    table.border = '1';

    // Create table header
    const headerRow = table.insertRow();
    for (const key in data[0]) {
        if (key === 'students') {
            // If the key is 'students', handle it separately
            const th = document.createElement('th');
            th.textContent = 'Student Names';
            headerRow.appendChild(th);

            const thStatus = document.createElement('th');
            thStatus.textContent = 'Status';
            headerRow.appendChild(thStatus);
            continue;
        }
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }

    // Create table rows
    data.forEach(async entry => {
        const row = table.insertRow();
        for (const key in entry) {
            if (key === 'students') {
                const cellNames = row.insertCell();
                const cellStatus = row.insertCell();

                const studentsArray = entry[key];

                // Fetch and display student names and status
                const studentDetails = await Promise.all(studentsArray.map(async student => {
                    const studentId = student.studentId;
                    const studentNameResponse = await fetch(`http://localhost:5500/fetchStudentName?studentId=${studentId}`);
                    const studentNameData = await studentNameResponse.json();
                    return {
                        name: studentNameData.success ? studentNameData.studentName : 'Student not found',
                        status: student.status
                    };
                }));

                cellNames.textContent = studentDetails.map(detail => detail.name).join(', ');
                cellStatus.textContent = studentDetails.map(detail => detail.status).join(', ');
            } else {
                const cell = row.insertCell();
                cell.textContent = entry[key];
            }
        }
    });

    // Append the table to the HTML div
    attendanceDataDiv.appendChild(table);
}

// Fetch attendance data when the page loads
document.addEventListener('DOMContentLoaded', fetchAttendanceData);
