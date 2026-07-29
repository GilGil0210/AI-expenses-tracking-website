const API_BASE = "http://localhost:3000";
const token = localStorage.getItem("token");

let transactions = [];
let editingId = null; // tracks which transaction is being edited, if any

async function loadTransactions() {
  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Could not load transactions.");
    transactions = await response.json();
    displayTransactions();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

const table = document.getElementById("transactionTable");
const overlay = document.getElementById("overlay");
const addButton = document.querySelector(".add");
const saveButton = document.getElementById("saveBtn");
const cancelButton = document.getElementById("cancelBtn");
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");
const rowsPerPage = 10;
let currentPage = 1;
let currentFilter = "All";
let currentMonth = "All";
let currentYear = "All";

function displayTransactions() {
  table.innerHTML = "";

  let filteredTransactions = transactions.filter(function (transaction) {
    if (currentFilter !== "All" && transaction.category !== currentFilter) {
      return false;
    }
    const date = new Date(transaction.date);
    if (currentMonth !== "All" && date.getMonth() != currentMonth) {
      return false;
    }
    if (currentYear !== "All" && date.getFullYear() != currentYear) {
      return false;
    }
    return true;
  });

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageTransactions = filteredTransactions.slice(start, end);

  pageTransactions.forEach(function (transaction) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${transaction.merchant}</td>
            <td>${transaction.category}</td>
            <td>${transaction.date}</td>
            <td class="${transaction.amount < 0 ? "expense" : "income"}">
                $${transaction.amount.toFixed(2)}
            </td>
            <td>
                <button class="editBtn" data-id="${transaction._id}">✏️</button>
                <button class="deleteBtn" data-id="${transaction._id}">🗑️</button>
            </td>
        `;
    table.appendChild(row);
  });

  displayPagination();
  attachDeleteButtons();
  attachEditButtons();
}

function attachDeleteButtons() {
  document.querySelectorAll(".deleteBtn").forEach(function (button) {
    button.addEventListener("click", async function () {
      const id = this.dataset.id;
      try {
        const response = await fetch(`${API_BASE}/transactions/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Could not delete transaction.");

        transactions = transactions.filter((t) => t._id !== id);
        const totalPages = Math.ceil(transactions.length / rowsPerPage);
        if (currentPage > totalPages && currentPage > 1) {
          currentPage--;
        }
        displayTransactions();
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  });
}

function displayPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    if (i === currentPage) button.classList.add("active");
    button.addEventListener("click", function () {
      currentPage = i;
      displayTransactions();
    });
    pagination.appendChild(button);
  }
}

function attachEditButtons() {
  document.querySelectorAll(".editBtn").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = this.dataset.id;
      const transaction = transactions.find((t) => t._id === id);
      if (!transaction) return;

      editingId = id;
      document.getElementById("merchant").value = transaction.merchant;
      document.getElementById("category").value = transaction.category;
      document.getElementById("date").value = transaction.date;
      document.getElementById("amount").value = transaction.amount;

      overlay.style.display = "flex";
    });
  });
}

addButton.addEventListener("click", function () {
  editingId = null;
  document.getElementById("merchant").value = "";
  document.getElementById("date").value = "";
  document.getElementById("amount").value = "";
  overlay.style.display = "flex";
});

cancelButton.addEventListener("click", function () {
  overlay.style.display = "none";
});

saveButton.addEventListener("click", async function () {
  const merchant = document.getElementById("merchant").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const amount = Number(document.getElementById("amount").value);

  const payload = { merchant, category, date, amount };

  try {
    let response;
    if (editingId) {
      response = await fetch(`${API_BASE}/transactions/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) throw new Error("Could not save transaction.");

    editingId = null;
    overlay.style.display = "none";
    await loadTransactions();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

const filterButtons = document.querySelectorAll(".filters button");
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");

    const text = this.textContent.trim();
    currentFilter = text === "All" ? "All" : text.split(" ").pop();

    currentPage = 1;
    displayTransactions();
  });
});

monthFilter.addEventListener("change", function () {
  currentMonth = this.value;
  currentPage = 1;
  displayTransactions();
});

yearFilter.addEventListener("change", function () {
  currentYear = this.value;
  currentPage = 1;
  displayTransactions();
});

loadTransactions();