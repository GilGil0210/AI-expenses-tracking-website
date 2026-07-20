let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
if (transactions.length <= 0){
    transactions = [];
    localStorage.setItem(
        "transactions", JSON.stringify(transactions)
    )
}
function saveTransactions(){

    localStorage.setItem(

        "transactions",

        JSON.stringify(transactions)

    );

}
const table = document.getElementById("transactionTable");

const overlay = document.getElementById("overlay");

const addButton = document.querySelector(".add");

const saveButton = document.getElementById("saveBtn");

const cancelButton = document.getElementById("cancelBtn");
function displayTransactions() {

    // Remove old rows
    table.innerHTML = "";

    // Go through every transaction
    transactions.forEach(function(transaction, index) {

        // Create a new table row
        const row = document.createElement("tr");

        // Put HTML inside the row
        row.innerHTML = `

            <td>${transaction.merchant}</td>

            <td>${transaction.category}</td>

            <td>${transaction.date}</td>

            <td class="${transaction.amount < 0 ? "expense" : "income"}">

                $${transaction.amount.toFixed(2)}

            </td>

            <td>

                <button class="editBtn" data-index="${index}">✏️</button>
                <button class="deleteBtn" data-index="${index}">🗑️</button>

            </td>

        `;

        table.appendChild(row);
        

    });
    attachDeleteButtons();
    attachEditButtons();

}
function attachDeleteButtons(){

    const buttons=document.querySelectorAll(".deleteBtn");
    buttons.forEach(function(button){
        button.addEventListener("click",function(){
            const index=this.dataset.index;
            transactions.splice(index,1);
            saveTransactions();
            displayTransactions();
        });

    });

}
function attachEditButtons(){

    const buttons = document.querySelectorAll(".editBtn");

    buttons.forEach(function(button){

        button.addEventListener("click", function(){

            const index = this.dataset.index;

            const transaction = transactions[index];

            document.getElementById("merchant").value = transaction.merchant;
            document.getElementById("category").value = transaction.category;
            document.getElementById("date").value = transaction.date;
            document.getElementById("amount").value = transaction.amount;

            overlay.style.display = "flex";

        });

    });

}
addButton.addEventListener("click",function(){
    overlay.style.display="flex";
});

cancelButton.addEventListener("click",function(){
    overlay.style.display="none";
});

saveButton.addEventListener("click",function(){

    const merchant=document.getElementById("merchant").value;
    const category=document.getElementById("category").value;
    const date=document.getElementById("date").value;
    const amount=Number(document.getElementById("amount").value);
    transactions.push({

        merchant,

        category,

        date,

        amount

    });
    saveTransactions();
    displayTransactions();

    overlay.style.display="none";

});
displayTransactions();