function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.className = `toast ${type}`;

  const icons = {
    success: "✔",
    error: "✖",
    warning: "⚠",
    info: "ℹ"
  };

  div.innerHTML = `
    <i>${icons[type]}</i>
    <span>${message}</span>
  `;

  container.appendChild(div);

  // auto remove
  setTimeout(() => {
    div.remove();
  }, 4500);
}
