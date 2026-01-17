document.getElementById("forgotForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  if(!email) return showToast("Email is required", "error");

  try {
    const res = await fetch("http://127.0.0.1:5000/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if(data.status === "success") {
      showToast("✔️ Reset link sent to your email");
    } else {
      showToast(data.message || "User not found", "error");
    }

  } catch(err){
    console.log(err);
    showToast("Server error", "error");
  }
});

function showToast(msg, type="success"){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = type === "error" ? "#e63946" : "#2a9d8f";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
