document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();
  const errorBox = document.getElementById("errorBox");

  errorBox.innerHTML = ""; // Clear previous errors

  // ----- Get signup data from localStorage -----
  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    errorBox.innerHTML = "Please sign up first before contacting us.";
    return;
  }

  // ----- 1) NAME VALIDATION -----
  const nameRegex = /^[A-Za-z ]+$/;

  if (!nameRegex.test(name)) {
    errorBox.innerHTML = "Name must contain only letters (A-Z) and spaces.";
    return;
  }

  if (name.toLowerCase() !== savedUser.name.toLowerCase()) {
    errorBox.innerHTML = "Name must match the name used during signup.";
    return;
  }

  // ----- 2) EMAIL VALIDATION -----
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errorBox.innerHTML = "Please enter a valid email address.";
    return;
  }

  if (email.toLowerCase() !== savedUser.email.toLowerCase()) {
    errorBox.innerHTML = "Email must match the email used during signup.";
    return;
  }

  // ----- 3) SUBJECT VALIDATION -----
  if (subject.length < 10) {
    errorBox.innerHTML = "Subject must be at least 10 characters.";
    return;
  }

  // ----- 4) MESSAGE VALIDATION -----
  if (message.length < 150) {
    errorBox.innerHTML = "Message must be at least 150 characters long.";
    return;
  }

  // ----- SUCCESS -----
  alert("Thank you, " + name + "! Your message has been sent successfully.");
  document.getElementById("contactForm").reset();
});
