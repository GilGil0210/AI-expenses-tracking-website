const API_BASE = "http://localhost:3000";

const signupForm = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not create your account.");
    }

    // Store the token so future requests (transactions, receipts) know who you are
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);

    window.location.href = "Dashboard.html";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});