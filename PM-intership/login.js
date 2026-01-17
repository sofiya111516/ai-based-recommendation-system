document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
    if (!emailPattern.test(email)) {
    showToast("Enter a valid email like example@gmail.com");
      return;
    }

    const passPattern =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passPattern.test(password)) {
      showToast("Invalid Password Format!");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
     showToast("Login Successful!");

      localStorage.setItem("user", JSON.stringify(result.user));

      window.location.href = "profile.html";
    } else {
      showToast(result.error || "Login failed!");
    }
  });
});
