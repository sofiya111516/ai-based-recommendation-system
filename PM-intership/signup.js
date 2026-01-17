document.querySelector("#signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.querySelector("#fullname").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();
  const confirmPassword = document.querySelector("#confirmPassword").value.trim();

  const nameRegex = /^[A-Za-z ]+$/;
  if (!nameRegex.test(fullname)) {
    showToast("Full Name should contain only letters!");
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    showToast("Enter a valid email address!");
    return;
  }

  const emailParts = email.split("@");
  if (emailParts[0] === emailParts[1].split(".")[0]) {
    showToast("Invalid email format!");
    return;
  }

  const passRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

  if (!passRegex.test(password)) {
    showToast("Password must be 8+ chars with 1 uppercase, 1 number & 1 special char!");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fullname,
      email,
      password,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    showToast("Signup successful! Now login.");
    window.location.href = "login.html";
  } else {
    showToast(result.error || "Signup failed!");
  }
});
