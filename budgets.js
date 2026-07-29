const API_BASE = "http://localhost:3000";
const token = localStorage.getItem("token");

const monthlyBtn = document.getElementById("monthlyBtn");
const historyBtn = document.getElementById("historyBtn");
const monthlySection = document.getElementById("monthlySection");
const historySection = document.getElementById("historySection");

monthlyBtn.addEventListener("click", () => {
  monthlySection.style.display = "block";
  historySection.style.display = "none";
  monthlyBtn.classList.add("active-tab");
  historyBtn.classList.remove("active-tab");
});

historyBtn.addEventListener("click", () => {
  monthlySection.style.display = "none";
  historySection.style.display = "block";
  historyBtn.classList.add("active-tab");
  monthlyBtn.classList.remove("active-tab");
});

// Maps the <select> value to the matching card's <h1 id="...">
const categoryToCardId = {
  Food: "Food",
  Transport: "Transport",
  Shopping: "Shopping",
  Bills: "Bills",
  Other: "Others"
};

const overlay = document.getElementById("overlay");
const addBudgetBtn = document.querySelector(".add-budget");
const categorySelect = document.getElementById("category");
const amountInput = document.getElementById("amount");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

addBudgetBtn.addEventListener("click", () => {
  categorySelect.value = "Food";
  amountInput.value = "";
  overlay.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  overlay.style.display = "none";
});

saveBtn.addEventListener("click", async () => {
  const category = categorySelect.value;
  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Enter a valid budget amount.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ category, amount })
    });
    if (!response.ok) throw new Error("Could not save budget.");

    overlay.style.display = "none";
    await loadBudgets();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

async function loadBudgets() {
  try {
    const response = await fetch(`${API_BASE}/budgets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Could not load budgets.");
    const budgets = await response.json();

    // Reset every card to $0.00 first, so categories with no
    // budget this month show correctly instead of stale data.
    Object.values(categoryToCardId).forEach((cardId) => {
      const el = document.getElementById(cardId);
      if (el) el.textContent = "$0.00";
    });

    budgets.forEach((budget) => {
      const cardId = categoryToCardId[budget.category];
      const el = cardId && document.getElementById(cardId);
      if (el) el.textContent = "$" + budget.amount.toFixed(2);
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

loadBudgets();