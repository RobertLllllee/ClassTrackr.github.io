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
  
  window.onload = async function () {
    displayUserDetails();
    updateCurrentTime();
    await updateTotalClassAttended();
    await updateTotalClasses();
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
    const attendedClassesElement = document.getElementById('attendedClasses');
    if (attendedClassesElement) {
      // Fetch the TotalClassAttended from your server
      try {
        const response = await fetch('http://localhost:5500/getTotalClassAttended', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId: sessionStorage.getItem('userId') }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          attendedClassesElement.textContent = data.totalClassAttended;
        } else {
          console.error('Error updating TotalClassAttended:', data.message);
        }
      } catch (error) {
        console.error('Error updating TotalClassAttended:', error);
      }
    } else {
      console.error('Element with ID "attendedClasses" not found.');
    }
  }
  
  async function updateTotalClasses() {
    const totalClassesElement = document.getElementById('totalClasses');
    if (totalClassesElement) {
      // Fetch the TotalClasses from your server
      try {
        const response = await fetch('http://localhost:5500/getTotalClasses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId: sessionStorage.getItem('userId') }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          totalClassesElement.textContent = data.totalClasses;
        } else {
          console.error('Error fetching TotalClasses:', data.message);
        }
      } catch (error) {
        console.error('Error fetching TotalClasses:', error);
      }
    } else {
      console.error('Element with ID "totalClasses" not found.');
    }
  }
  
  function updateCurrentTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    document.getElementById('currentTime').textContent = formattedTime;
  }
  
  setInterval(updateCurrentTime, 1000);
  updateCurrentTime();