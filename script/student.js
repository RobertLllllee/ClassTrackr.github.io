document.getElementById('sidebar-toggle-btn').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar');
    var mainHeader = document.querySelector('.main-header');
    var mainContent = document.querySelector('.main-content');
    
    // Check if the sidebar is opened or closed
    if (sidebar.classList.contains('sidebar-closed')) {
      sidebar.classList.remove('sidebar-closed');
      mainHeader.style.left = '255px'; // Adjust this value to match your sidebar width
      mainContent.style.marginLeft = '250px'; // Adjust this value to match your sidebar's width
    } else {
      sidebar.classList.add('sidebar-closed');
      mainHeader.style.left = '0';
      mainContent.style.marginLeft = '0';
    }
    
  });

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
    
};
    // JavaScript function to redirect to QR.html
    function redirecttocodeinsert() {
    // Change window.location to the path of your QR.html file
    window.location.href = 'attendancecode.html';
}
