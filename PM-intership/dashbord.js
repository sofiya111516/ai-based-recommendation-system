// ==================== ON LOAD ====================

document.addEventListener("DOMContentLoaded", async () => {

  setupSidebarNav();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showToast("Please login first!", "error");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("userNameDisplay").textContent =
    "Welcome, " + (user.name || "User");

  await loadRecommendations(user.id);
});


// ==================== SIDEBAR NAVIGATION ====================

function setupSidebarNav() {
  document.getElementById("homeLink").onclick = () => window.location.href = "dashbord.html";
  document.getElementById("applicationsLink").onclick = () => window.location.href = "applications.html";
  document.getElementById("profileLink").onclick = () => window.location.href = "profile.html";
  document.getElementById("logoutLink").onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };
}


// ==================== API: LOAD RECOMMENDATIONS ====================

async function loadRecommendations(userId) {
  const container = document.getElementById("recommendedList");

  try {
    // fetch recommendations
    const res = await fetch(`http://127.0.0.1:5000/internships/recommend/${userId}`);
    const data = await res.json();

    if (data.status !== "success") {
      container.innerHTML = `<p>⚠️ Unable to load recommendations</p>`;
      return;
    }

    // Fetch already-applied internships
    const appsRes = await fetch(`http://127.0.0.1:5000/applications/${userId}`);
    const appsData = await appsRes.json();

    // extract ids
    const appliedIds = (appsData.applications || []).map(a => a.internship_id);

    renderRecommendations(data.recommendations, appliedIds);

  } catch (err) {
    console.log(err);
    container.innerHTML = `<p>⚠️ Server error loading recommendations</p>`;
  }
}


// ==================== RENDER CARDS ====================

function renderRecommendations(list, appliedIds = []) {
  const container = document.getElementById("recommendedList");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = `<p>No recommendations yet.</p>`;
    return;
  }

  // show only top 3
  list.slice(0, 3).forEach(intern => {

    const alreadyApplied = appliedIds.includes(intern.id);

    const div = document.createElement("div");
    div.className = "internship-card";

    div.innerHTML = `
      <h3>${intern.title}</h3>
      <p><strong>Company:</strong> ${intern.company}</p>
      <p><strong>Location:</strong> ${intern.location}</p>
      <p><strong>Duration:</strong> ${intern.duration}</p>
      <p><strong>Stipend:</strong> ${intern.stipend}</p>

      <div class="btn-group">

        ${alreadyApplied
          ? `<button class="applied-btn card-btn" disabled>Applied ✔️</button>`
          : `<button class="view-btn card-btn" data-id="${intern.id}">
                View Details
             </button>`
        }

      </div>
    `;

    container.appendChild(div);
  });

  attachViewHandlers();
}



// ==================== VIEW DETAILS HANDLER ====================

function attachViewHandlers() {

  document.querySelectorAll(".view-btn").forEach(btn => {

    btn.addEventListener("click", async (e) => {

      const internshipId = e.target.dataset.id;

      if (!internshipId) return;

      try {
        const res = await fetch(`http://127.0.0.1:5000/internships/details/${internshipId}`);
        const data = await res.json();

        if (data.status !== "success") {
          showToast("Failed to fetch details", "error");
          return;
        }

        // Save to localStorage
        localStorage.setItem(
          "selectedInternship",
          JSON.stringify(data.internship)
        );

        // Navigate
        window.location.href = "internship-details.html";

      } catch (err) {
        console.log(err);
        showToast("Server error", "error");
      }

    });

  });
}
