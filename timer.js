document.addEventListener("DOMContentLoaded", () => {
    // assures that it is once all html is loaded

    // get html elements
    var modal = document.getElementById("modalSure");
    const back = document.getElementById('back');
    const pauseButton = document.getElementById('pause_button');
    const playButton = document.getElementById('play_button');
    const ding = document.getElementById('ding');
    const toggle = document.querySelector('.switch input');
    const timeBox = document.getElementById('time_box');
    // get html elements
    
    // get user info
    const times = JSON.parse(localStorage.getItem('times'));
    const total_time = JSON.parse(localStorage.getItem('total_time'));
    console.log("Times from localStorage:", times);
    console.log("Total time from localStorage:", total_time);
    // get user info


    // create study plan 
    let studyPlan = "Your calculated study plan: <br>";

    for (let i = 0; i < times.length; i++) {
        if (i == 0) {
            studyPlan += String(times[i]) + " minutes planning <br>"
        } else if (i % 2 == 1) {
            studyPlan += String(times[i]) + " minutes focus <br>"
        } else {
            studyPlan += String(times[i]) + " minutes break <br>"
        }
    }
    // create study plan 

    document.getElementById("plan").innerHTML = studyPlan; // display study plan

    
    // set initial values
    // reloads 
    let remainingBaseTime;  // this is to keep track of base timer on reload
    let remainingTotalTime; // this is to keep track of full timer on reload

    let isPaused = true;
    let timersStarted = false;

    let TIME_LIMIT; // for circle animation

    let timeLeft; // for short timers
    let timerInterval = null; // for short timers

    let timeLeftTotal; // for long timer
    let timerIntervalTotal; // for long timer
    let resume;
    let endTimeTotal;

    if (timerInterval) clearInterval(timerInterval);
    if (timerIntervalTotal) clearInterval(timerIntervalTotal);
    
    // set initial values


    // allowing website to stay awake 
    
    let wakeLock = null;
    document.body.addEventListener('click', () => {
        requestWakeLock();
    }, { once: true });

    if (toggle.checked) { timeBox.style.display = 'block'; } else { timeBox.style.display = 'none'; } // set time box invisible initially

    document.getElementById("top_text").innerHTML = 'press the <span style="color:#894343;"> play </span> to start!';   
    // set timer displays


    playButton.addEventListener('click', () => {
        
        isPaused = false; 
        playButton.style.display = 'none'; 
        pauseButton.style.display = 'block';
    
        if (!timersStarted) {
            timersStarted = true; // start them
            startAllTimers();
        } else {
            resume = Date.now();
            endTimeTotal = resume + remainingTotalTime * 1000;

    }
    });

    function startAllTimers() {
        runTimers(times);
        fullTimer(total_time*60);
    }
    
    async function runTimers(times) {
        // this function runs sequential timers based off of user input 

        for (let i = 0; i < times.length; i++) {

            // text on top update
            if (i == 0) {
                document.getElementById("top_text").innerHTML = 'until your <span style="color:#894343;"> study session </span>';   
            } else if (i % 2 == 1) {
                document.getElementById("top_text").innerHTML = 'until your next <span style="color:#894343;"> break </span>';
            } else {
                document.getElementById("top_text").innerHTML = 'until your break is <span style="color:#894343;"> over </span>';
            }
            // text on top update

            if (times[i] > 0) {
                TIME_LIMIT = times[i] * 60;
                await startTimer(TIME_LIMIT);
            }
            
            
        }
    }
    
    function startTimer(duration) {
        // duration parameter so its based off of which phase we are on
        
        return new Promise((resolve) => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            // for waiting purposes

            let endTime;
            // we are going to calculate the end time of the phase timer
        
            if (remainingBaseTime != null) { // if there is a remaining timer
                endTime = Date.now() + remainingBaseTime * 1000;
                remainingBaseTime = undefined;
            } else {
                // staring a new timer
                endTime = Date.now() + duration * 1000;
            }
                        
            setCircleDasharray(); // start circle animation
            
            timerInterval = setInterval(() => {

                if (!isPaused) { // make sure we arent paused
                    timeLeft = Math.max(0, endTime - Date.now()) / 1000; //calculate time left for circle

                    setCircleDasharray();
                    
                    document.getElementById("base-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeft));

                    document.title = `Time left: ${formatTimeLeft(Math.ceil(timeLeft))}`     
                } else {
                    if (resume) {
                        endTime = resume + timeLeft * 1000;
                        resume = undefined;
                    } else {
                        endTime = Date.now() + timeLeft * 1000;
                    }
                }

                if (timeLeft <= 0) { // if its 0 then its over
                    clearInterval(timerInterval); // new interval
                    resolve(); // awaiting over
                }
            
            }, 500); // update every half a second 
        });
    }

    
    function fullTimer(duration) {
        if (timerIntervalTotal) {
            clearInterval(timerIntervalTotal);
        }

        if (remainingTotalTime) {
            // resuming after pause
            endTimeTotal = Date.now() + duration * 1000;
            remainingTotalTime = undefined;
        } else {
            // fresh start
            endTimeTotal = Date.now() + duration * 1000;
        }
        
        timerIntervalTotal = setInterval(() => {
            if (!isPaused) {

                timeLeftTotal = Math.max(0, endTimeTotal - Date.now()) / 1000; // calc

                document.getElementById("total-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeftTotal)); // display

                if (timeLeftTotal <= 0) {
                    clearInterval(timerIntervalTotal); // clear
                    window.location.href = "credits.html";
                }
            } else {
                //
            }
        }, 500); // updates every half a second
    }

    //buttons

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            timeBox.style.display = 'block';
        } else {
            timeBox.style.display = 'none';
        }
    });

    back.addEventListener("click", function () {
        isPaused = true;
        modal.style.display = "block";
        
        document.addEventListener("keydown", (event) => {
            if (event.key === "q") {
                window.location.href = "credits.html";
            } else if (event.key === "c") {
                isPaused = false;
                modal.style.display = "none";
            }
        });
    });
    
    pauseButton.addEventListener('click', () => {
        isPaused = true; 

        remainingTotalTime = timeLeftTotal;
        remainingBaseTime = timeLeft;
        
        pauseButton.style.display = 'none';
        playButton.style.display = 'block';
    });
    
    // circle

    function formatTimeLeft(time) {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
        
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        
        return `${minutes}:${seconds}`;
    }

      function calculateTimeFraction() {
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }
    
    function setCircleDasharray() {
        const FULL_DASH_ARRAY = 283;
        const circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
            document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
        }
    
    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock was released');
            });
        
            document.addEventListener('visibilitychange', async () => {
                if (wakeLock !== null && document.visibilityState === 'visible') {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            }); } catch (err) {
                console.error(`${err.name}, ${err.message}`);
        }
    }
});

