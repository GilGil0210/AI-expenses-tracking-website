const receiptInput = document.getElementById("receiptInput");
const uploadButton = document.getElementById("uploadButton");

const receiptImage = document.getElementById("receiptImage");

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
receiptInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        receiptImage.src = e.target.result;

        // Fake extracted data
        merchant.textContent = "McDonald's";
        date.textContent = "Jul 31, 2024";
        subtotal.textContent = "$10.27";
        tax.textContent = "$1.45";
        total.textContent = "$11.72";

    };

    reader.readAsDataURL(file);

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

dropArea.addEventListener("drop", function (e) {

    e.preventDefault();

    dropArea.style.borderColor = "#3c4765";

    const file = e.dataTransfer.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        receiptImage.src = event.target.result;

        merchant.textContent = "McDonald's";
        date.textContent = "Jul 31, 2024";
        subtotal.textContent = "$10.27";
        tax.textContent = "$1.45";
        total.textContent = "$11.72";

    };

    reader.readAsDataURL(file);

});
displayReceipts();