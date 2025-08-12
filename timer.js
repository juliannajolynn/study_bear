document.addEventListener("DOMContentLoaded", () => {
  const times = JSON.parse(localStorage.getItem('times'));

  console.log(times);

  const back = document.getElementById('back');
  
  back.addEventListener("click", function () {
    alert("All progress lost!");
    window.location.href = "main.html";
});

// code from a tutorial https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/ 

function formatTimeLeft(time) {
  // The largest round integer less than or equal to the result of time divided being by 60.
  const minutes = Math.floor(time / 60);
  
  // Seconds are the remainder of the time divided by 60 (modulus operator)
  let seconds = time % 60;
  
  // If the value of seconds is less than 10, then display seconds with a leading zero
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  // The output in MM:SS format
  return `${minutes}:${seconds}`;
}

// Start with an initial value 
let TIME_LIMIT = 0;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

//my code
for (let i = 0; i < times.length; i++) {
    TIME_LIMIT = times[i];
    timePassed = 0;
    timeLeft = TIME_LIMIT;
    timerInterval = null;

    document.getElementById("base-timer-label").textContent = formatTimeLeft(timeLeft);
    startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    
    // The amount of time passed increments by one
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    
    // The time left label is updated
    document.getElementById("base-timer-label").textContent = formatTimeLeft(timeLeft);

    setCircleDasharray();

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
    }
  }, 1000);
}

const COLOR_CODES = {
    info: {
        color: "green"
    }
};

let remainingPathColor = COLOR_CODES.info.color;

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const FULL_DASH_ARRAY = 283;
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
}





});