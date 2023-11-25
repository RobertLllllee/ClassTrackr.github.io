window.onload = function() {
  // Fetch and display user information
  displayUserDetails();
};

function displayUserDetails() {
  const userType = sessionStorage.getItem('userType');
  const userId = sessionStorage.getItem('userId');
  const userName = sessionStorage.getItem('userName');

  if (userType && userId && userName) {
      // Display user information on the page
      document.getElementById('userType').textContent = userType;
      document.getElementById('userID').textContent = userId;
      document.getElementById('userName').textContent = userName;
  }
}

function AttendanceReport() {
  window.location.href = 'AttReport.html';
}

