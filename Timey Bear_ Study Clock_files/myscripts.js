document.addEventListener("DOMContentLoaded", () => {
  
  var modal = document.getElementById("myModal");

  modal.style.display = "block";


  const check = document.getElementById('check');
  const xmark = document.getElementById('xmark');
  const main_title = document.getElementById('main_title');

  function selectImage(selected, other) {
    selected.classList.add('outlined');
    other.classList.remove('outlined');
  }

   // extra 10 min 
  let berkTime = null;

  console.log("check element:", document.getElementById('check'));

  check.addEventListener('click', () => {
    selectImage(check, xmark);
    berkTime = true;
  });

  xmark.addEventListener('click', () => {
    selectImage(xmark, check);
    berkTime = false;
  });

  main_title.addEventListener("click", function () {
    window.location.href = "credits.html";
  });

  // timer stuff
  const submit = document.getElementById('submit');
  const times = [];
  
  // this list will take the total time and pomodoro split so that we can calculate how the timer will work
  submit.addEventListener("click", function () {

    if (berkTime == null) {
      alert("Please complete the form!");
      return; 
    }

    console.log("Submit was clicked!");
    let time = 0;
    let total_time = parseInt(document.getElementById("times_total").value);

    // pomodoro split like "25/5"
    let pomoSplit = document.getElementById("pomo_split").value.split("/").map(num => parseInt(num, 10));
    let study_time = pomoSplit[0];
    let break_time = pomoSplit[1];
    console.log("Times from localStorage:", study_time);
    console.log("Times from localStorage:", break_time);
    times.length = 0;

    let i = 0;

    if (berkTime) {
      times[i] = 10;
      time += 10;
    } else {
      times[i] = 0;
    }
    i++;


    while (time < total_time) {
      if (i % 2 == 1) {
        times[i] = study_time;
        time += study_time;
      } else {
        times[i] = break_time;
        time += break_time;
      }

      if (time > total_time) {
        let overflow = time - total_time;
        // ex 50 - 30 = 20

        if (i % 2 == 1) {
          // study
          times[i] = study_time - overflow; 
        } else {
          times[i] = break_time - overflow; 
        }

        break;
      }

      i++;
    } 

    localStorage.setItem('times', JSON.stringify(times));
    localStorage.setItem('total_time', JSON.stringify(total_time));

    window.location.href = "timer.html";
  });

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

});