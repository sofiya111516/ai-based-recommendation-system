
const container = document.getElementById("internshipContainer");
let internshipsCache = [];
async function loadInternships() {
  try {
    const res = await fetch("http://127.0.0.1:5000/internships/"); // FIXED URL
    const data = await res.json();

    if (data.status !== "success") {
      container.innerHTML = `<p>⚠️ Failed to load internships</p>`;
      return;
    }

    internshipsCache = data.internships; // SAVE TO CACHE
    renderInternships(data.internships);

  } catch (err) {
    console.log(err);
    container.innerHTML = `<p>⚠️ Server error</p>`;
  }
}
function renderInternships(list) {
  container.innerHTML = ""; // clear loading text

  list.forEach(intern => {
    const card = document.createElement("div");
    card.className = "internship-card";

    card.innerHTML = `
      <h3>${intern.title}</h3>
      <p><strong>Company:</strong> ${intern.company}</p>
      <p><strong>Location:</strong> ${intern.location}</p>
      <p><strong>Duration:</strong> ${intern.duration}</p>
      <p><strong>Stipend:</strong> ${intern.stipend}</p>

      <div class="btn-group">
        <button class="view-btn" data-id="${intern.id}">View Details</button>
        <button class="apply-btn" data-id="${intern.id}">Apply Now</button>
      </div>
    `;

    container.appendChild(card);
  });

  addListeners();
}

function addListeners() {

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;

      const selected = internshipsCache.find(i => i.id == id);

      localStorage.setItem("selectedInternship", JSON.stringify(selected));
      window.location.href = "internship-details.html";
    });
  });

  document.querySelectorAll(".apply-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      applyInternship(e.target.dataset.id);
    });
  });
}

async function applyInternship(internshipId) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showToast("⚠️ Please login first!");
    return;
  }

  const payload = {
    user_id: user.id,
    internship_id: internshipId
  };

  try {
    const res = await fetch("http://127.0.0.1:5000/internships/apply", { // FIXED URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.status === "success") {
      showToast("✔️ Application Submitted Successfully!","success");
    } else {
      showToast(result.message || "⚠️ Already applied or server error!");
    }

  } catch (err) {
    console.log(err);
   showToast("⚠️ Server error","error");
  }
}

loadInternships()
  .then(() => console.log("Internships loaded"));
