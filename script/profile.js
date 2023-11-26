window.onload = async function() {
    try {
      // Fetch user information when the page loads
      const userInfo = await getUserInfo();
  
      // Display user information on the profile page
      document.getElementById('userType').textContent = userInfo.userType;
      document.getElementById('userID').textContent = userInfo.userId;
      document.getElementById('userName').textContent = userInfo.userName;
  
      // Additional actions if needed
      // ...
  
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
    }
  };
  
  async function getUserInfo() {
    try {
      const response = await fetch("http://localhost:5500/get-user-info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
  
      const result = await response.json();
  
      if (result.success) {
        return {
          userType: result.userType,
          userId: result.userId,
          userName: result.userName,
        };
      } else {
        console.error('Error details:', result.message);
        throw new Error("Failed to get user information.");
      }
    } catch (error) {
      console.error('Error getting user information:', error);
      throw error;
    }
  }