window.onload = function () {
  document.getElementById('UserType').addEventListener('change', changeFields);

  document.getElementById('login-form').addEventListener('submit', async function (event) {
      event.preventDefault();

      const userType = document.getElementById('UserType').value;
      const fieldNames = {
          'Administrator': ['AdminID', 'AdminPass'],
          'Student': ['StudentID', 'StudentPass'],
          'Instructor': ['InstructorID', 'InstructorPass']
      };

      const [userIdField, userPassField] = fieldNames[userType];

      try {
          const response = await fetch('http://localhost:5500/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  UserType: userType,
                  [userIdField]: document.getElementById(userIdField).value,
                  [userPassField]: document.getElementById(userPassField).value,
              }),
            //   credentials: 'include',
          });

          const data = await response.json();

          if (data.success) {
              // Display a success message
              alert('Login successful');

              // After successful login, set session storage items
              sessionStorage.setItem('userType', userType);
              sessionStorage.setItem('userId', data.userId);
              sessionStorage.setItem('userName', data.userName);
              // Add other fields as needed

              // Adjust the redirect URL based on user type
              let redirectUrl;
              switch (userType) {
                  case 'Administrator':
                      redirectUrl = 'admin.html';
                      break;
                  case 'Student':
                      redirectUrl = 'student.html';
                      break;
                  case 'Instructor':
                      redirectUrl = 'instructor.html';
                      break;
              }

              // Redirect to the appropriate page
              window.location.href = redirectUrl;
          } else {
              alert(data.message);
          }
      } catch (error) {
          console.error('Error during login:', error);
          alert('Login failed. Please try again.');
      }
  });
};

function changeFields() {
  const userType = document.getElementById('UserType').value;
  document.getElementById('adminFields').style.display = 'none';
  document.getElementById('studentFields').style.display = 'none';
  document.getElementById('instructorFields').style.display = 'none';

  switch (userType) {
      case 'Administrator':
          document.getElementById('adminFields').style.display = 'block';
          break;
      case 'Student':
          document.getElementById('studentFields').style.display = 'block';
          break;
      case 'Instructor':
          document.getElementById('instructorFields').style.display = 'block';
          break;
  }
}
