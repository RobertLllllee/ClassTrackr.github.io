document.getElementById('sidebar-toggle-btn').addEventListener('click', function() {
  var sidebar = document.querySelector('.sidebar');
  var mainHeader = document.querySelector('.main-header');
  var mainContent = document.querySelector('.main-content');
  
  // Toggle sidebar logic
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
