console.log("AttReportIns.js loaded!");
// Fetch attendance data when the page loads
document.addEventListener('DOMContentLoaded', fetchAttendanceData);

async function fetchAttendanceData() {
    const attendanceDataDiv = document.getElementById('attendanceData');

    if (attendanceDataDiv) {
        try {
            const response = await fetch('http://localhost:5500/getAttendanceReport');
            const data = await response.json();

            if (data.length > 0) {
                // Save the original data
                originalData = data;
                populateFilters(data);
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

function populateFilters(data) {
    const dateFilter = document.getElementById('dateFilter');
    const timeslotFilter = document.getElementById('timeslotFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const instructorFilter = document.getElementById('instructorFilter');

    // Function to get unique values from an array
    const getUniqueValues = (arr) => [...new Set(arr)];

    const uniqueDates = getUniqueValues(data.map(entry => entry.date));
    const uniqueTimeslots = getUniqueValues(data.map(entry => entry.timeslot));
    const uniqueSemesters = getUniqueValues(data.map(entry => entry.semester));
    const uniqueSubjects = getUniqueValues(data.map(entry => entry.subject));
    const uniqueInstructors = getUniqueValues(data.map(entry => entry.instructorName));

    // Populate dropdown filters
    populateDropdown(dateFilter, uniqueDates);
    populateDropdown(timeslotFilter, uniqueTimeslots);
    populateDropdown(semesterFilter, uniqueSemesters);
    populateDropdown(subjectFilter, uniqueSubjects);
    populateDropdown(instructorFilter, uniqueInstructors);
}

function populateDropdown(selectElement, values) {
    const defaultOption = document.createElement('option');
    defaultOption.text = 'All';
    defaultOption.value = '';
    selectElement.add(defaultOption);

    values.forEach(value => {
        const option = document.createElement('option');
        option.text = value;
        option.value = value;
        selectElement.add(option);
    });
}

async function displayAttendanceData(data) {
    const attendanceDataDiv = document.getElementById('attendanceData');

    // Check if there is data to display
    if (data.length === 0) {
        attendanceDataDiv.innerHTML = '<p>No attendance data available.</p>';
        return;
    }

    // Group data by unique dates
    const groupedData = groupDataByDate(data);

    // Get selected filter values
    const dateFilterValue = document.getElementById('dateFilter').value;
    const timeslotFilterValue = document.getElementById('timeslotFilter').value;
    const semesterFilterValue = document.getElementById('semesterFilter').value;
    const subjectFilterValue = document.getElementById('subjectFilter').value;
    const instructorFilterValue = document.getElementById('instructorFilter').value;
    const studentNameFilterValue = document.getElementById('studentNameFilter').value.toLowerCase();
    const studentIdFilterValue = document.getElementById('studentIdFilter').value.toLowerCase();

    // Filter data based on selected values
    const filteredData = data.filter(entry =>
        (dateFilterValue === '' || entry.date === dateFilterValue) &&
        (timeslotFilterValue === '' || entry.timeslot === timeslotFilterValue) &&
        (semesterFilterValue === '' || entry.semester === semesterFilterValue) &&
        (subjectFilterValue === '' || entry.subject === subjectFilterValue) &&
        (instructorFilterValue === '' || entry.instructorName === instructorFilterValue) &&
        (studentNameFilterValue === '' || entry.studentsData.some(student => student.studentName.toLowerCase().includes(studentNameFilterValue))) &&
        (studentIdFilterValue === '' || entry.studentsData.some(student => student.studentId.toLowerCase().includes(studentIdFilterValue)))
    );

    // Create tables for each unique date
    groupedData.forEach((group, date) => {
        const table = createTable(group);
        attendanceDataDiv.appendChild(table);

        // Add a line break between tables
        attendanceDataDiv.appendChild(document.createElement('br'));
    });
}

// Function to group data by unique dates
function groupDataByDate(data) {
    const groupedData = new Map();

    data.forEach(entry => {
        const date = entry.date;
        if (!groupedData.has(date)) {
            groupedData.set(date, []);
        }

        groupedData.get(date).push(entry);
    });

    return groupedData;
}

// Function to create a table for a group of data with the same date
function createTable(group) {
    const table = document.createElement('table');
    table.border = '1';

    // Create table header
    const headerRow = table.insertRow();
    for (const key in group[0]) {
        if (key === 'studentsData') {
            const th = document.createElement('th');
            th.textContent = 'Student Names';
            headerRow.appendChild(th);

            const statusTh = document.createElement('th');
            statusTh.textContent = 'Status';
            headerRow.appendChild(statusTh);

            continue;
        }
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }

    // Create table rows
    group.forEach(async entry => {
        const row = table.insertRow();

        for (const key in entry) {
            if (key === 'studentsData') {
                const cell = row.insertCell();
                const statusCell = row.insertCell();

                // Display student names and statuses
                const studentsArray = entry[key];
                const studentData = await Promise.all(studentsArray.map(async student => {
                    const studentId = student.studentId;
                    const studentNameResponse = await fetch(`http://localhost:5500/fetchStudentName?studentId=${studentId}`);
                    const studentNameData = await studentNameResponse.json();
                    return {
                        name: studentNameData.success ? studentNameData.studentName : 'Student not found',
                        status: student.status
                    };
                }));

                // Separate student names and statuses
                const studentNames = studentData.map(student => student.name).join(', ');
                const statuses = studentData.map(student => student.status).join(', ');

                cell.textContent = studentNames;
                statusCell.textContent = statuses;
            } else {
                const cell = row.insertCell();
                cell.textContent = entry[key];
            }
        }
    });

    return table;
}

function applyFilters() {
    const attendanceDataDiv = document.getElementById('attendanceData');

    // Check if there is data to display
    if (originalData.length === 0) {
        attendanceDataDiv.innerHTML = '<p>No attendance data available.</p>';
        return;
    }

    // Group original data by unique dates
    const groupedData = groupDataByDate(originalData);

    // Get selected filter values
    const dateFilterValue = document.getElementById('dateFilter').value;
    const timeslotFilterValue = document.getElementById('timeslotFilter').value;
    const semesterFilterValue = document.getElementById('semesterFilter').value;
    const subjectFilterValue = document.getElementById('subjectFilter').value;
    const instructorFilterValue = document.getElementById('instructorFilter').value;
    const studentNameFilterValue = document.getElementById('studentNameFilter').value.toLowerCase();
    const studentIdFilterValue = document.getElementById('studentIdFilter').value.toLowerCase();

    // Filter original data based on selected values
    const filteredData = originalData.filter(entry =>
        (dateFilterValue === '' || entry.date === dateFilterValue) &&
        (timeslotFilterValue === '' || entry.timeslot === timeslotFilterValue) &&
        (semesterFilterValue === '' || entry.semester === semesterFilterValue) &&
        (subjectFilterValue === '' || entry.subject === subjectFilterValue) &&
        (instructorFilterValue === '' || entry.instructorName === instructorFilterValue) &&
        (studentNameFilterValue === '' || entry.studentsData.some(student => student.studentName.toLowerCase().includes(studentNameFilterValue))) &&
        (studentIdFilterValue === '' || entry.studentsData.some(student => student.studentId.toLowerCase().includes(studentIdFilterValue)))
    );

    // Clear existing data
    attendanceDataDiv.innerHTML = '';

    // Create tables for each unique date
    groupedData.forEach((group, date) => {
        if (filteredData.includes(group[0])) {
            // If the group matches the filtered data, move it to the top with added spacing
            const table = createTable(group);
            table.style.marginBottom = '20px'; // Add margin between tables
            attendanceDataDiv.insertBefore(table, attendanceDataDiv.firstChild);
        } else {
            const table = createTable(group);
            attendanceDataDiv.appendChild(table);
        }

        // Add a line break between tables
        attendanceDataDiv.appendChild(document.createElement('br'));
    });
}

function clearFilters() {
    // Reset all filter options to default
    document.getElementById('dateFilter').value = '';
    document.getElementById('timeslotFilter').value = '';
    document.getElementById('semesterFilter').value = '';
    document.getElementById('subjectFilter').value = '';
    document.getElementById('instructorFilter').value = '';
    document.getElementById('studentNameFilter').value = '';
    document.getElementById('studentIdFilter').value = '';

    // Apply filters to reset the view
    applyFilters();
}

// Add event listener for the filter button
const filterButton = document.getElementById('filterButton');
if (filterButton) {
    filterButton.addEventListener('click', applyFilters);
} else {
    console.error('Element with ID "filterButton" not found.');
}

// Add event listener for the clear button
const clearButton = document.getElementById('clearButton');
if (clearButton) {
    clearButton.addEventListener('click', clearFilters);
} else {
    console.error('Element with ID "clearButton" not found.');
}

// Prevent the default form submission behavior
document.getElementById('yourFormId').addEventListener('submit', function(event) {
    event.preventDefault();
});