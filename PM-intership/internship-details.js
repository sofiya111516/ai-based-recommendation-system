
const detailsCard = document.getElementById("detailsCard");
const selected = JSON.parse(localStorage.getItem("selectedInternship"));
const internshipId = selected?.id;

if (!internshipId) {
  detailsCard.innerHTML = `
    <p style="color:red;">⚠️ No internship selected!</p>
    <a href="internships.html" class="back-link">← Back</a>
  `;
} else {
  loadDetails(internshipId);
}

async function loadDetails(id) {
  try {
    detailsCard.innerHTML = `<p>Loading details...</p>`;

    const res = await fetch(`http://127.0.0.1:5000/internships/details/${id}`);
    const data = await res.json();

    if (data.status !== "success") {
      detailsCard.innerHTML = `
        <p style="color:red;">⚠️ Unable to fetch details!</p>
        <a href="internships.html" class="back-link">← Back</a>
      `;
      return;
    }

    const d = data.internship;

    detailsCard.innerHTML = `
      <h3>${d.title}</h3>
      <p><strong>Company:</strong> ${d.company}</p>
      <p><strong>Location:</strong> ${d.location}</p>
      <p><strong>Duration:</strong> ${d.duration}</p>
      <p><strong>Stipend:</strong> ${d.stipend}</p>

      <div class="description">
        <h4>About the Internship</h4>
        <p>${d.description || "No description provided."}</p>
      </div>

      <div class="apply-section">
        <button id="applyBtn">Apply Now</button>
        <a href="applications.html" class="back-link">← Back</a>
      </div>
    `;

  } catch (err) {
    console.log(err);
    detailsCard.innerHTML = `
      <p style="color:red;">⚠️ Server error</p>
      <a href="applications.html" class="back-link">← Back</a>
    `;
  }
}

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "applyBtn") {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      showToast("Please login first!");
      window.location.href = "login.html";
      return;
    }

    const payload = {
      user_id: user.id,
      internship_id: internshipId
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/internships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === "success") {
        showToast("✔️ Application submitted successfully!");
        window.location.href = "applications.html";
      } 
      else {
        showToast(result.message || "⚠️ Already applied!");
      }

    } catch (err) {
      console.log(err);
      showToast("⚠️ Server error");
    }
  }
});
