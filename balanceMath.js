// ===============================
// Load transactions from localStorage
// ===============================

const transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

// ===============================
// Dashboard Cards
// ===============================

let totalBalance = 0;
let thisMonth = 0;

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

transactions.forEach(function(transaction){

    totalBalance += transaction.amount;

    const date = new Date(transaction.date);

    if(
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
    ){
        thisMonth += transaction.amount;
    }

});

// Update cards
document.getElementById("balance").textContent =
"$" + totalBalance.toFixed(2);

document.getElementById("monthTotal").textContent =
"$" + thisMonth.toFixed(2);

// ===============================
// Recent Transactions Table
// ===============================

const table = document.getElementById("transactionBody");

table.innerHTML = "";

transactions.forEach(function(transaction){

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${transaction.merchant}</td>
        <td>${transaction.category}</td>
        <td>${transaction.date}</td>
        <td class="${transaction.amount < 0 ? "expense" : "income"}">
            $${transaction.amount.toFixed(2)}
        </td>
    `;

    table.appendChild(row);

});

// ===============================
// Pie Chart
// ===============================

const categoryTotals = {
    Food: 0,
    Transport: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0
};

transactions.forEach(function(transaction){

    if(transaction.amount < 0){

        if(categoryTotals.hasOwnProperty(transaction.category)){

            categoryTotals[transaction.category] += Math.abs(transaction.amount);

        }else{

            categoryTotals.Other += Math.abs(transaction.amount);

        }

    }

});

const pie = document.getElementById("pieChart");

new Chart(pie, {

    type: "doughnut",

    data: {

        labels: [
            "Food",
            "Transport",
            "Shopping",
            "Bills",
            "Other"
        ],

        datasets: [{

            data: [

                categoryTotals.Food,
                categoryTotals.Transport,
                categoryTotals.Shopping,
                categoryTotals.Bills,
                categoryTotals.Other

            ],

            backgroundColor: [

                "#FF7D73",
                "#4F83FF",
                "#FFD166",
                "#45D483",
                "#7667FF"

            ]

        }]

    },

    options: {

        responsive: true,

        cutout: "70%"

    }

});

// ===============================
// Line Chart
// ===============================

const spending = {};

transactions.forEach(function(transaction){

    if(transaction.amount < 0){

        if(!spending[transaction.date]){

            spending[transaction.date] = 0;

        }

        spending[transaction.date] += Math.abs(transaction.amount);

    }

});

const labels = Object.keys(spending);

const values = Object.values(spending);

const line = document.getElementById("lineChart");

new Chart(line, {

    type: "line",

    data: {

        labels: labels,

        datasets: [{

            data: values,

            borderColor: "#6C63FF",

            borderWidth: 3,

            tension: 0.4,

            fill: false

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {

                display: false

            }

        }

    }

});
// const line = document.getElementById("lineChart");

// new Chart(line, {
//     type: "line",
//     data: {
//         labels: ["Jul 1", "Jul 8", "Jul 15", "Jul 22", "Jul 29", "Jul 31"],
//         datasets: [{
//             data: [80, 160, 120, 250, 200, 310],
//             borderColor: "#6C63FF",
//             borderWidth: 3,
//             tension: 0.4,
//             fill: false
//         }]
//     },
//     options: {
//         responsive: true,
//         plugins: {
//             legend: {
//                 display: false
//             }
//         }
//     }
// });

// const pie = document.getElementById("pieChart");

// new Chart(pie, {
//     type: "doughnut",
//     data: {
//         labels: [
//             "Food",
//             "Transport",
//             "Shopping",
//             "Bills",
//             "Other"
//         ],
//         datasets: [{
//             data: [346, 173, 131, 98, 74],
//             backgroundColor: [
//                 "#FF7D73",
//                 "#4F83FF",
//                 "#FFD166",
//                 "#45D483",
//                 "#7667FF"
//             ]
//         }]
//     },
//     options: {
//         responsive: true,
//         cutout: "70%"
//     }
// });
// /*recent table*/
// const transactions = [

// {
//     merchant:"Starbucks",
//     category:"Food",
//     date:"Jul 31",
//     amount:-6.45
// },

// {
//     merchant:"Uber",
//     category:"Transport",
//     date:"Jul 30",
//     amount:-21.30
// },

// {
//     merchant:"Amazon",
//     category:"Shopping",
//     date:"Jul 29",
//     amount:-42.90
// },

// {
//     merchant:"Salary",
//     category:"Income",
//     date:"Jul 28",
//     amount:1200
// }

// ];

// const table=document.getElementById("transactionBody");
// transactions.forEach(function(transaction){

//     const row=document.createElement("tr");

//     row.innerHTML=`

//         <td>${transaction.merchant}</td>

//         <td>${transaction.category}</td>

//         <td>${transaction.date}</td>

//         <td class="${transaction.amount<0 ? "expense":"income"}">

//         $${transaction.amount}

//         </td>

//     `;

//     table.appendChild(row);

// });