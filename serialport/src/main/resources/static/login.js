document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginForm').addEventListener('submit', function(event) {
      event.preventDefault();
      var username = document.getElementById('username').value;
      var password = document.getElementById('password').value;

      console.log('Username:', username);
      console.log('Password:', password);
  
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }), 
      })
      .then(response => response.text())
      .then(data => {
        console.log('Response from server:', data);
        if (data === "Login successful") {
            console.log('Redirecting to website page');
            window.location.href = 'website.html'; 
        } else {
            alert(data);
        }
    })
      .catch(error => console.error('Error:', error));
  });
});