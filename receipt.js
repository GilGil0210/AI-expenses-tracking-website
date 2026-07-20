const receiptInput = document.getElementById("receiptInput");
const uploadButton = document.getElementById("uploadButton");

const receiptImage = document.getElementById("receiptImage");
const category = document.getElementById("category");
const merchant = document.getElementById("merchant");
const date = document.getElementById("date");
const subtotal = document.getElementById("subtotal");
const tax = document.getElementById("tax");
const total = document.getElementById("total");

const recentScans = document.getElementById("recentScans");
const dropArea = document.getElementById("dropArea");

let receipts = JSON.parse(localStorage.getItem("receipts")) || [];

uploadButton.addEventListener("click", function () {
  receiptInput.click();
});

receiptInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) handleReceiptFile(file);
  // allow selecting the same file twice in a row
  this.value = "";
});

dropArea.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropArea.style.borderColor = "#29b058";
});

dropArea.addEventListener("dragleave", function () {
  dropArea.style.borderColor = "#3c4765";
});

dropArea.addEventListener("drop", function (e) {
  e.preventDefault();
  dropArea.style.borderColor = "#3c4765";
  const file = e.dataTransfer.files[0];
  if (file) handleReceiptFile(file);
});

// Single shared handler for both the button-upload and drag/drop paths,
// so there's only one place this logic can break.
async function handleReceiptFile(file) {
  // Show the preview immediately and keep it up no matter what happens next.
  const reader = new FileReader();
  reader.onload = (e) => {
    receiptImage.src = e.target.result;
  };
  reader.onerror = () => {
    alert("Couldn't read that file as an image.");
  };
  reader.readAsDataURL(file);

  // Feedback while we wait on the backend, instead of stale/blank fields.
  merchant.textContent = "Scanning…";
  date.textContent = "-";
  subtotal.textContent = "-";
  tax.textContent = "-";
  total.textContent = "-";

  const formData = new FormData();
  formData.append("receipt", file);

  try {
    const response = await fetch("http://localhost:3000/scan", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      // Server responded, but with an error payload (e.g. bad OCR parse)
      throw new Error(data.error || `Server error (${response.status})`);
    }

    merchant.textContent = data.merchant || "-";
    date.textContent = data.date || "-";
    subtotal.textContent = data.subtotal || "-";
    tax.textContent = data.tax || "-";
    total.textContent = data.total || "-";
    if (data.category) category.value = data.category;
  } catch (err) {
    console.error(err);
    merchant.textContent = "-";
    alert(`Could not scan receipt: ${err.message}`);
    // Deliberately NOT touching receiptImage.src here — the preview
    // the user just uploaded should stay visible even if scanning fails.
  }
}

const saveExpense = document.getElementById("saveExpense");

saveExpense.addEventListener("click", function () {
  if (!receiptImage.src) {
    alert("Upload a receipt first.");
    return;
  }

  const receipt = {
    image: receiptImage.src,
    merchant: merchant.textContent,
    date: date.textContent,
    total: total.textContent
  };

  receipts.push(receipt);
  localStorage.setItem("receipts", JSON.stringify(receipts));
  displayReceipts();
});

function displayReceipts() {
  recentScans.innerHTML = "";

  receipts.forEach(function (receipt, index) {
    const div = document.createElement("div");
    div.className = "scan";
    div.innerHTML = `
      <img src="${receipt.image}">
      <div>
        <h3>${receipt.merchant}</h3>
        <p>${receipt.date}</p>
        <p>${receipt.total}</p>
      </div>
      <button class="deleteBtn" data-index="${index}">Delete</button>
    `;
    recentScans.appendChild(div);
  });

  attachDeleteButtons();
}

function attachDeleteButtons() {
  document.querySelectorAll(".deleteBtn").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = this.dataset.index;
      receipts.splice(index, 1);
      localStorage.setItem("receipts", JSON.stringify(receipts));
      displayReceipts();
    });
  });
}

displayReceipts();