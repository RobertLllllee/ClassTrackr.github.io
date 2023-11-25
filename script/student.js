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

window.onload = function () {
    displayUserDetails();
    updateCurrentTime();
    updateTotalClassAttended();
};

function displayUserDetails() {
    const userType = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    if (userType && userId && userName) {
        document.getElementById('userType').textContent = userType;
        document.getElementById('userID').textContent = userId;
        document.getElementById('userName').textContent = userName;
    }
}

async function updateTotalClassAttended() {
    const userId = sessionStorage.getItem('userId');
  
    if (!userId) {
      console.error('User ID not found in sessionStorage.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5500/getTotalClassAttended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: userId }),
      });
  
      if (!response.ok) {
        console.error('Error fetching TotalClassAttended:', response.status);
        return;
      }
  
      const data = await response.json();
      const totalClassAttended = data.totalClassAttended;
  
      const attendedClassesElement = document.getElementById('attendedClasses');
  
      if (attendedClassesElement) {
        attendedClassesElement.textContent = totalClassAttended;
      } else {
        console.error('Element with ID "attendedClasses" not found.');
      }
    } catch (error) {
      console.error('Error fetching TotalClassAttended:', error);
    }
  }

function updateCurrentTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    document.getElementById('currentTime').textContent = formattedTime;
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime();
