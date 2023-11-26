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

function checkAttendanceRate() {
  window.location.href = 'checkAttrate.html';
}
