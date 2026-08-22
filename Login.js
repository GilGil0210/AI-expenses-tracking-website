const API_BASE = "https://ai-expenses-tracking-website.onrender.com";

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const goToSignup = document.getElementById("goToSignup");

goToSignup.addEventListener("click", function () {
  window.location.href = "signup.html";
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not log you in.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);

    window.location.href = "Dashboard.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});