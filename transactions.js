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
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");
const rowsPerPage = 10;
let currentPage = 1;
let currentFilter = "All";
let currentMonth = "All";
let currentYear = "All";

function displayTransactions() {

    // Remove old rows
    table.innerHTML = "";
    let filteredTransactions = transactions.filter(function(transaction){

    // Category
    if(currentFilter !== "All"){

        if(transaction.category !== currentFilter){

            return false;

        }

    }

    const date = new Date(transaction.date);

    // Month
    if(currentMonth !== "All"){

        if(date.getMonth() != currentMonth){

            return false;

        }

    }

    // Year
    if(currentYear !== "All"){

        if(date.getFullYear() != currentYear){

            return false;

        }

    }

    return true;
});
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageTransactions = filteredTransactions.slice(start, end);
    pageTransactions.forEach(function(transaction, index){
        // Create a new table row
        const realIndex = start + index;
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

                <button class="editBtn" data-index="${realIndex}">✏️</button>
                <button class="deleteBtn" data-index="${realIndex}">🗑️</button>

            </td>

        `;

        table.appendChild(row);
        

    });
    displayPagination();
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
            const totalPage = Math.ceil(transactions.length/rowsPerPage);
            if(currentPage > totalPage && currentPage > 1){
                currentPage--;
            };
            displayTransactions();
        });

    });

}
function displayPagination(){

    const pagination = document.getElementById("pagination");

    pagination.innerHTML = "";
    let filteredTransactions;
    if(currentFilter === "All"){
        filteredTransactions = transactions;
    }else{
        filteredTransactions = transactions.filter(function(transaction){
            return transaction.category === currentFilter;
        });
    }
    const totalPages = Math.ceil(transactions.length / rowsPerPage);

    for(let i = 1; i <= totalPages; i++){

        const button = document.createElement("button");

        button.textContent = i;

        if(i === currentPage){

            button.classList.add("active");

        }

        button.addEventListener("click", function(){

            currentPage = i;

            displayTransactions();

        });

        pagination.appendChild(button);

    }

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
const filterButtons = document.querySelectorAll(".filters button");
filterButtons.forEach(function(button){

    button.addEventListener("click", function(){

        // Remove green highlight
        filterButtons.forEach(function(btn){

            btn.classList.remove("active");

        });

        // Highlight selected button
        this.classList.add("active");

        // Read the button text
        const text = this.textContent.trim();

        if(text === "All"){

            currentFilter = "All";

        }else{

            currentFilter = text.split(" ").pop();

        }

        currentPage = 1;

        displayTransactions();

    });

});
monthFilter.addEventListener("change", function(){
    currentMonth = this.value;
    currentPage=1;
    displayTransactions();
});
yearFilter.addEventListener("change", function(){
    currentYear = this.value;
    currentPage = 1;
    displayTransactions();
})
displayTransactions();