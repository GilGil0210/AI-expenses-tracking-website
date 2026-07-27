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