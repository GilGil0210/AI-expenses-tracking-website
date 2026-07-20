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

let receipts = JSON.parse(localStorage.getItem("receipts")) || [];
uploadButton.addEventListener("click", function () {

    receiptInput.click();

});
receiptInput.addEventListener("change", async function () {

    const file = this.files[0];

    if (!file) return;

    // Show image preview
    const reader = new FileReader();

    reader.onload = function(e){
        receiptImage.src = e.target.result;
    };

    reader.readAsDataURL(file);

    // Send image to your backend
    const formData = new FormData();

    formData.append("receipt", file);

    const response = await fetch("http://localhost:3000/scan", {

        method: "POST",

        body: formData

    });

    const data = await response.json();

    merchant.textContent = data.merchant;
    date.textContent = data.date;
    subtotal.textContent = data.subtotal;
    tax.textContent = data.tax;
    total.textContent = data.total;

    category.value = data.category;

});
const saveExpense = document.getElementById("saveExpense");

saveExpense.addEventListener("click", function () {

    if (receiptImage.src == "") {

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

    localStorage.setItem(
        "receipts",
        JSON.stringify(receipts)
    );

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

            <button class="deleteBtn" data-index="${index}">
                Delete
            </button>

        `;

        recentScans.appendChild(div);

    });

    attachDeleteButtons();

}
function attachDeleteButtons() {

    const buttons = document.querySelectorAll(".deleteBtn");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const index = this.dataset.index;

            receipts.splice(index, 1);

            localStorage.setItem(
                "receipts",
                JSON.stringify(receipts)
            );

            displayReceipts();

        });

    });

}
const dropArea = document.getElementById("dropArea");

dropArea.addEventListener("dragover", function (e) {

    e.preventDefault();

    dropArea.style.borderColor = "#29b058";

});

dropArea.addEventListener("dragleave", function () {

    dropArea.style.borderColor = "#3c4765";

});

dropArea.addEventListener("drop", async function (e) {

    e.preventDefault();

    dropArea.style.borderColor = "#3c4765";

    const file = e.dataTransfer.files[0];

    if (!file) return;

    // Show image preview
    const reader = new FileReader();

    reader.onload = function (event) {

        receiptImage.src = event.target.result;

    };

    reader.readAsDataURL(file);

    // Send the image to your backend
    const formData = new FormData();

    formData.append("receipt", file);

    const response = await fetch("http://localhost:3000/scan", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    // Fill in the receipt details returned by ChatGPT
    merchant.textContent = data.merchant;
    date.textContent = data.date;
    subtotal.textContent = data.subtotal;
    tax.textContent = data.tax;
    total.textContent = data.total;
    category.value = data.category;

});
displayReceipts();