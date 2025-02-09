document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", function(event) {
      event.preventDefault();
      const name = document.querySelector("input[name='name']").value;
      const email = document.querySelector("input[name='email']").value;
      const username = document.querySelector("input[name='username']").value;
      const password = document.querySelector("input[name='password']").value;

      const registerRequest = {
        name: name,
        email: email,
        username: username,
        password: password
      };

      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerRequest)
      })
      .then(response => response.text())
      .then(message => {
        console.log(message);
        alert(message);
      })
      .catch(error => {
        console.error(error);
        alert("Error registering user");
      });
    });
  });