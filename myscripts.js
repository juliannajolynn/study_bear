const check = document.getElementById('check');
const xmark = document.getElementById('xmark');

function selectImage(selected, other) {
  // Add outline class to selected image
  selected.classList.add('outlined');
  // Remove outline class from the other image
  other.classList.remove('outlined');
}

check.addEventListener('click', () => {
  selectImage(check, xmark);
});

xmark.addEventListener('click', () => {
  selectImage(xmark, check);
});