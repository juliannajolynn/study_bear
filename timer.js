document.addEventListener("DOMContentLoaded", () => {
  const times = JSON.parse(localStorage.getItem('times'));

  console.log(times);

  const back = document.getElementById('back');
  
  back.addEventListener("click", function () {
    alert("All progress lost!");
    window.location.href = "main.html";
});

});