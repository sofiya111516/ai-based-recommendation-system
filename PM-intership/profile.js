

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) return; // avoid crash

  toast.innerText = message;
  toast.style.background = type === "error" ? "#e63946" : "#2a9d8f";

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

async function loadUserData() {

  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (!savedUser) {
    showToast("Login required", "error");
    window.location.href = "login.html";
    return;
  }

  const userId = savedUser.id;

  try {
    const res = await fetch(`http://127.0.0.1:5000/profile/get/${userId}`);
    const data = await res.json();

    if (data.status !== "success") {
      showToast("Unable to fetch profile", "error");
      return;
    }

    const user = data.user;

    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("college").value = user.college || "";
    document.getElementById("location").value = user.location || "";
    document.getElementById("interest").value = user.interest || "";
    document.getElementById("skills").value = user.skills || "";

    
    updateNavbar(user);
    showPreview(user);

  } catch (error) {
    console.log(error);
    showToast("Server error", "error");
  }
}

document.addEventListener("DOMContentLoaded", loadUserData);

document.getElementById("profileForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const savedUser = JSON.parse(localStorage.getItem("user"));
  const userId = savedUser.id;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const college = document.getElementById("college").value.trim();
  const location = document.getElementById("location").value.trim();
  const interest = document.getElementById("interest").value.trim();
  const skills = document.getElementById("skills").value.trim();

  if (!name) return showToast("Name required!", "error");
  if (!email) return showToast("Email required!", "error");

  const payload = { name, email, phone, college, location, interest, skills };

  try {
    // Update text fields
    let res = await fetch(`http://127.0.0.1:5000/profile/update/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let result = await res.json();

    if (result.status !== "success") {
      showToast(result.message || "Failed to update", "error");
      return;
    }

    const photoFile = document.getElementById("profilePhoto").files[0];
    if (photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);
      await fetch(`http://127.0.0.1:5000/upload/photo/${userId}`, {
        method: "POST",
        body: formData
      });
    }

    const resumeFile = document.getElementById("resume").files[0];
    if (resumeFile) {
      const formData = new FormData();
      formData.append("file", resumeFile);
      await fetch(`http://127.0.0.1:5000/upload/resume/${userId}`, {
        method: "POST",
        body: formData
      });
    }

    showToast("✔️ Profile Updated Successfully");
    loadUserData();

  } catch (error) {
    console.log(error);
    showToast("Server error", "error");
  }
});


function updateNavbar(user) {
  const avatar = document.getElementById("userAvatar");

  if (!avatar) return;

  if (user.photo) {
    avatar.style.backgroundImage =
      `url(http://127.0.0.1:5000/uploads/photos/${user.photo}?t=${Date.now()})`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.textContent = "";
  } else {
    avatar.style.backgroundImage = "none";
    avatar.textContent = user.name ? user.name[0].toUpperCase() : "?";
  }

  document.getElementById("userNameDisplay").textContent =
    "Welcome, " + (user.name || "User");
}

function showPreview(user) {

  document.getElementById("previewName").innerText = user.name || "";
  document.getElementById("previewEmail").innerText = user.email || "";
  document.getElementById("previewPhone").innerText = user.phone || "";
  document.getElementById("previewCollege").innerText = user.college || "";
  document.getElementById("previewLocation").innerText = user.location || "";
  document.getElementById("previewInterest").innerText = user.interest || "";
  document.getElementById("previewSkills").innerText = user.skills || "";

  if (user.photo) {
    const photoElement = document.getElementById("previewPhoto");
    photoElement.src = `http://127.0.0.1:5000/uploads/photos/${user.photo}?t=${Date.now()}`;
    photoElement.style.display = "block";
  }

  if (user.resume) {
    const resumeLink = document.getElementById("previewResume");
    resumeLink.href = `http://127.0.0.1:5000/uploads/resumes/${user.resume}?t=${Date.now()}`;
    resumeLink.innerText = user.resume;
  }
}
