console.log("student.js loaded");

window.onload = function () {
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
  };

  const userType = sessionStorage.getItem("userType");
  let userId = sessionStorage.getItem("userId");

  if (userType === "Student") {
    // Check if the user has already uploaded images
    checkIfImagesUploaded(userId).then((result) => {
      if (result.uploaded) {
        // Images already uploaded, hide the image upload form
        document.getElementById("image-upload-form").style.display = "none";
      } else {
        // Images not uploaded, show the image upload form
        document.getElementById("image-upload-form").style.display = "block";

        // Handle image upload form submission
        document
          .getElementById("image-upload-form")
          .addEventListener("submit", function (event) {
            event.preventDefault();

            // Ensure userId is set and not undefined
            if (!userId) {
              alert("User ID is missing. Please log in.");
              return;
            }

            const formData = new FormData();
            const imageInput = document.getElementById("studentImages");

            for (let i = 0; i < imageInput.files.length; i++) {
              formData.append("images", imageInput.files[i]);
            }

            formData.append("userId", userId); // Add user ID to form data

            fetch(`http://localhost:5500/upload/${userId}`, {
              method: "POST",
              body: formData,
            })
              .then((response) => response.text())
              .then((data) => {
                console.log(data);
                alert("Images uploaded successfully");
                // Hide the image upload form after successful upload
                document.getElementById("image-upload-form").style.display = "none";
              });
          });
      }
    });
  }
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

function checkIfImagesUploaded(userId) {
  return fetch(`http://localhost:5500/checkupload/${userId}`)
    .then((response) => response.json())
    .then((data) => data);
}

document.getElementById("take-attendance-button").addEventListener("click", function () {
  window.location.href = "attendance.html";
});

