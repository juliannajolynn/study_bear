document.addEventListener("DOMContentLoaded", () => {
  const check = document.getElementById('check');
  const xmark = document.getElementById('xmark');
  const main_title = document.getElementById('main_title');
  const back = document.getElementById('back');

  function selectImage(selected, other) {
    selected.classList.add('outlined');
    other.classList.remove('outlined');
  }

  check.addEventListener('click', () => {
    selectImage(check, xmark);
  });

  xmark.addEventListener('click', () => {
    selectImage(xmark, check);
  });

  main_title.addEventListener("click", function () {
    window.location.href = "credits.html";
  });

  back.addEventListener("click", function () {
    window.location.href = "main.html";
  });
});