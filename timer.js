document.addEventListener("DOMContentLoaded", () => {

  var modal = document.getElementById("modalSure");

  const times = JSON.parse(localStorage.getItem('times'));
  const total_time = JSON.parse(localStorage.getItem('total_time'));
  const back = document.getElementById('back');

  let isPaused = false;
  const pauseButton = document.getElementById('pause_button');
  const playButton = document.getElementById('play_button');

  const ding = document.getElementById('ding');
  
  back.addEventListener("click", function () {

    isPaused = true;

    modal.style.display = "block";

    document.addEventListener("keydown", (event) => {
        if (event.key === "q") {
            localStorage.removeItem("baseTimerEnd");
            localStorage.removeItem("timerEnd");
            window.location.href = "credits.html";
        }
        else if (event.key === "c") {
            isPaused = false;
            modal.style.display = "none";
  }
});



});

pauseButton.addEventListener('click', () => {
    isPaused = true; // toggle pause state
    pauseButton.style.display = 'none'; // hide grey pause
    playButton.style.display = 'block';
});

playButton.addEventListener('click', () => {
    isPaused = false; // toggle pause state
    playButton.style.display = 'none';
    pauseButton.style.display = 'block';
});

// code from a tutorial https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
// reworked to fit my vision

function formatTimeLeft(time) {
  // The largest round integer less than or equal to the result of time divided being by 60.
  let minutes = Math.floor(time / 60);
  
  // Seconds are the remainder of the time divided by 60 (modulus operator)
  let seconds = time % 60;
  
  // If the value of seconds is less than 10, then display seconds with a leading zero
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  // The output in MM:SS format
  return `${minutes}:${seconds}`;
}

// Start with an initial value 
let TIME_LIMIT = 0;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

console.log("Times from localStorage:", times);
console.log("Total time from localStorage:", total_time);

runTimers(times);

let timePassedTotal = 0;
let timeLeftTotal = 0;
let timerIntervalTotal = null;


fullTimer(total_time*60);

async function runTimers(times) {
    for (let i = 0; i < times.length; i++) {
        if (i == 0) {
            document.getElementById("top_text").innerHTML = 'until your <span style="color:#894343;"> study session </span>';   
        } else if (i % 2 == 1) {
            document.getElementById("top_text").innerHTML = 'until your next <span style="color:#894343;"> break </span>';

            // <span style="color:#894343;"> break </span>
        } else {
            document.getElementById("top_text").innerHTML = 'until your break is <span style="color:#894343;"> over </span>';
        }

        TIME_LIMIT = times[i] * 60;
        timePassed = 0;
        timeLeft = TIME_LIMIT;
        timerInterval = null;
        document.getElementById("base-timer-label").textContent = formatTimeLeft(timeLeft);
        await startTimer(TIME_LIMIT);
    }
}


function startTimer(duration) {
    return new Promise((resolve) => {
        
        const storedEndTime = localStorage.getItem("baseTimerEnd");
        const endTime = storedEndTime ? parseInt(storedEndTime) : Date.now() + duration * 1000;

        // Store end time in localStorage 
        localStorage.setItem("baseTimerEnd", endTime);

        // The time left label is updated
        document.getElementById("base-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeft));
        setCircleDasharray();
        
        timerInterval = setInterval(() => {
            // The amount of time passed increments by one

            if (!isPaused) {
                const now = Date.now();
                timeLeft = Math.max(0, endTime - now) / 1000;

                document.getElementById("base-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeft));
                setCircleDasharray();

                document.title = `Time left: ${formatTimeLeft(Math.ceil(timeLeft))}`;
                
                if (timeLeft <= 0) {

                    ding.play().catch(e => console.log("Audio error:", e));
                    localStorage.removeItem("baseTimerEnd");
                    clearInterval(timerInterval);
                    resolve();
                }
            }
        }, 250);
    });
}

function fullTimer(duration) {
    const storedEndTime = localStorage.getItem("timerEnd");
    const endTime = storedEndTime ? parseInt(storedEndTime) : Date.now() + duration * 1000;

    //in case page reloads

    localStorage.setItem("timerEnd", endTime);
    
    // The time left label is updated
    document.getElementById("total-timer-label").textContent = formatTimeLeft(duration);
        
    timerIntervalTotal = setInterval(() => {
        if (!isPaused) {
            const now = Date.now();
            const msLeft = Math.max(0, endTime - now);
            timeLeftTotal = msLeft / 1000;
            
            document.getElementById("total-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeftTotal));

            if (msLeft <= 0) {
                ding.play().catch(e => console.log("Audio error:", e));
                clearInterval(timerIntervalTotal);
                localStorage.removeItem("timerEnd");
                window.location.href = "credits.html";
            }
        }
    }, 50);
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

const toggle = document.querySelector('.switch input');
  const timeBox = document.getElementById('time_box');

  // Set initial state
  timeBox.style.display = toggle.checked ? 'block' : 'none';

  toggle.addEventListener('change', () => {
    timeBox.style.display = toggle.checked ? 'block' : 'none';
  });

});