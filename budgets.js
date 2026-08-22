const API_BASE = "https://ai-expenses-tracking-website.onrender.com";
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
  loadHistory(); // refresh each time it's opened
});

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

    // Reset every card first, so categories with no budget set
    // this month show $0 / 0% instead of stale numbers.
    Object.values(categoryToCardId).forEach((cardId) => {
      const amountEl = document.getElementById(cardId);
      const spentEl = document.getElementById(`${cardId}-spent`);
      const percentEl = document.getElementById(`${cardId}-percent`);
      const fillEl = document.getElementById(`${cardId}-fill`);
      if (amountEl) amountEl.textContent = "$0.00";
      if (spentEl) spentEl.textContent = "$0.00 spent";
      if (percentEl) percentEl.textContent = "0%";
      if (fillEl) fillEl.style.width = "0%";
    });

    budgets.forEach((budget) => {
        const cardId = categoryToCardId[budget.category];
        if (!cardId) return;
      
        const amount = Number(budget.amount) || 0;
        const spent = Number(budget.spent) || 0;
        const percent = amount > 0 ? Math.round((spent / amount) * 100) : 0;
      
        const amountEl = document.getElementById(cardId);
        const spentEl = document.getElementById(`${cardId}-spent`);
        const percentEl = document.getElementById(`${cardId}-percent`);
        const fillEl = document.getElementById(`${cardId}-fill`);
      
        if (amountEl) amountEl.textContent = "$" + amount.toFixed(2);
        if (spentEl) spentEl.textContent = "$" + spent.toFixed(2) + " spent";
        if (percentEl) percentEl.textContent = percent + "%";
        if (fillEl) {
          fillEl.style.width = Math.min(percent, 100) + "%";
          fillEl.style.background = percent > 100 ? "#ff5c74" : "";
        }
      });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE}/budgets/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Status ${response.status}: ${body}`);
    }
    const history = await response.json();
    const grid = document.getElementById("historyGrid");
    grid.querySelectorAll("div:not(.history-header)").forEach((el) => el.remove());

    if (history.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No past budgets yet.";
      empty.style.gridColumn = "1 / -1";
      grid.appendChild(empty);
      return;
    }

    history.forEach((entry) => {
      const amount = Number(entry.amount) || 0;
      const spent = Number(entry.spent) || 0;

      [entry.monthLabel, entry.category, "$" + amount.toFixed(2), "$" + spent.toFixed(2)]
        .forEach((text) => {
          const cell = document.createElement("div");
          cell.textContent = text;
          grid.appendChild(cell);
        });
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

loadBudgets();