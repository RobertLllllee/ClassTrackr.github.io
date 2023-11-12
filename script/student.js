window.onload = function() {
    // Fetch and display user information
    displayUserDetails();

    // Handle image upload form submission
    const imageUploadForm = document.getElementById('imageUploadForm');
    imageUploadForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get the selected image file from the input field
        const imageFile = document.getElementById('imageFile').files[0];

        // Check if an image file is selected
        if (!imageFile) {
            console.log('No image file selected');
            alert('Please select an image file');
            return;
        }

        console.log('Uploading image:', imageFile);

        // Use FormData to prepare the image for upload
        const formData = new FormData();
        formData.append('studentID', sessionStorage.getItem('userId'));
        formData.append('image', imageFile);

        // Perform an AJAX request to upload the image
        fetch('http://localhost:5500/uploadImage', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            if (data && data.success) {
                console.log('Image upload success:', data.message);
                alert(data.message);
            } else {
                console.log('Image upload failed:', data.message);
                alert('Image upload failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error during image upload:', error);
            alert('Image upload failed');
        });

    });

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
    
    // Handle button click to redirect to attendance.html
    const attendanceButton = document.getElementById('attendanceButton');
    attendanceButton.addEventListener('click', function () {
        // Redirect to the attendance.html page
        window.location.href = 'attendance.html';
    });
};
