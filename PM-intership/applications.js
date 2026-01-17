const container = document.getElementById("applicationList");

// ===================== LOAD APPLICATIONS =====================
async function loadApplications() {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showToast("Please login first!");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5000/applications/${user.id}`);
    const data = await res.json();

    if (data.status !== "success") {
      container.innerHTML = `<p>⚠️ Failed to load applications</p>`;
      return;
    }

    renderApplications(data.applications);

  } catch (err) {
    console.log(err);
    container.innerHTML = `<p>⚠️ Server error</p>`;
  }
}

// ===================== RENDER CARDS =====================
function renderApplications(list) {

  if (list.length === 0) {
    container.innerHTML = `<p>No applications yet.</p>`;
    return;
  }

  container.innerHTML = ""; // clear loading text

  list.forEach(app => {

    const div = document.createElement("div");
    div.classList.add("app-card");

    div.innerHTML = `
      <h3>${app.title}</h3>
      <p><strong>Company:</strong> ${app.company}</p>
      <p><strong>Applied on:</strong> ${app.applied_on}</p>

      <span class="status ${app.status.toLowerCase()}">${app.status}</span>

      <div class="btns">
        <button onclick="viewDetails(${app.internship_id})">View Details</button>
        <button onclick="withdraw(${app.application_id})">Withdraw</button>
      </div>
    `;

    container.appendChild(div);
  });

}

// ===================== VIEW DETAILS =====================
async function viewDetails(internship_id) {

  try {

    // Fetch full internship details
    const res = await fetch(`http://127.0.0.1:5000/internships/details/${internship_id}`);
    const data = await res.json();

    if (data.status === "success") {

      localStorage.setItem("selectedInternship", JSON.stringify(data.internship));

      // Redirect
      window.location.href = "internship-details.html";

    } else {
      showToast("Internship not found!");
    }

  } catch (err) {
    console.log(err);
    showToast("Server error");
  }
}

// ===================== WITHDRAW =====================
async function withdraw(appId) {

  if (!confirm("Are you sure you want to withdraw this application?")) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/applications/cancel/${appId}`, {
      method: "DELETE"
    });

    const result = await res.json();

    if (result.status === "success") {
      showToast("❌ Application withdrawn");
      loadApplications(); // Refresh
    } else {
      showToast("⚠️ Failed to withdraw");
    }

  } catch (err) {
    console.log(err);
    showToast("Server error");
  }
}

// ===================== LOGOUT =====================
function logout() {
  localStorage.clear();
  showToast("You have been logged out!");
  window.location.href = "login.html";
}

// ===================== INIT =====================
loadApplications();
