window.onload = function() {
  // Fetch user information when the page loads
  fetchUserInfo();

  // Function to fetch and display the user information
  function fetchUserInfo() {
    const userType = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId'); // Retrieve the appropriate user ID
    const userName = sessionStorage.getItem('userName'); // Retrieve the appropriate user name

    if (userType && userId) {
      // Update the dashboard with UserType, UserID, and UserName
      document.getElementById('userType').textContent = userType;
      document.getElementById('userID').textContent = userId;
      document.getElementById('userName').textContent = userName; // Display userName
    }
  }
};
