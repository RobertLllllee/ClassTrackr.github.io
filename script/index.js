window.onload = function() {
  document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const UserType = document.getElementById('UserType').value;
    let AdminID, AdminPass, StudentID, StudentPass, InstructorID, InstructorPass;

    switch(UserType) {
      case 'Administrator':
        AdminID = document.getElementById('AdminID').value;
        AdminPass = document.getElementById('AdminPass').value;
        break;
      case 'Student':
        StudentID = document.getElementById('StudentID').value;
        StudentPass = document.getElementById('StudentPass').value;
        break;
      case 'Instructor':
        InstructorID = document.getElementById('InstructorID').value;
        InstructorPass = document.getElementById('InstructorPass').value;
        break;
      // Add more cases as needed
    }

    fetch('http://localhost:5500/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ AdminID, AdminPass, StudentID, StudentPass, InstructorID, InstructorPass, UserType }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          // Display a success message
          alert('Login successful');
        // After successful login, set session storage items
        sessionStorage.setItem('userType', UserType); // Set the user type
        sessionStorage.setItem('userId', data.userId); // Set the user ID returned from the server
        sessionStorage.setItem('userName', data.userName); // Set the user name returned from the server
    
        // Redirect to the appropriate page
        window.location.href = data.redirect;
      } else {
        alert(data.message);
      }
    });
  });
}

