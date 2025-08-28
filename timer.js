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
    let startingTime; // define it first

    if (timerInterval) clearInterval(timerInterval);
    if (timerIntervalTotal) clearInterval(timerIntervalTotal);
    
    // set initial values

    // nuke old stuff
    if (!localStorage.getItem("currentPhaseIndex")) {
        localStorage.removeItem("phaseEndTime");
        localStorage.removeItem("remainingBaseTime");
        localStorage.removeItem("remainingTotalTime");
        localStorage.removeItem("sessionEndTime");
    }

    // allowing website to stay awake 
    
    let wakeLock = null;
    document.body.addEventListener('click', () => {
        requestWakeLock();
    }, { once: true });

    if (toggle.checked) { timeBox.style.display = 'block'; } else { timeBox.style.display = 'none'; } // set time box invisible initially

    document.getElementById("top_text").innerHTML = 'press the <span style="color:#894343;"> play </span> to start!';   
    // set timer displays


    // timers
    const now = Date.now();
    const storedPhaseEnd = parseInt(localStorage.getItem("phaseEndTime"));
    const storedSessionEnd = parseInt(localStorage.getItem("sessionEndTime"));
    
    // restore timers only if they haven’t expired
    if (storedPhaseEnd && storedPhaseEnd > now) {
    remainingBaseTime = Math.ceil((storedPhaseEnd - now) / 1000);
        isPaused = true;
    }
    
    if (storedSessionEnd && storedSessionEnd > now) {
        remainingTotalTime = Math.ceil((storedSessionEnd - now) / 1000);
        isPaused = true;
    }


    playButton.addEventListener('click', () => {
        isPaused = false; 
        playButton.style.display = 'none'; 
        pauseButton.style.display = 'block';
    
        if (!timersStarted) {
            timersStarted = true; // start them
            if (!startingTime) startingTime = Date.now();
            if (!localStorage.getItem("sessionEndTime")) {
                const sessionEndTime = startingTime + total_time * 60 * 1000;
                localStorage.setItem("sessionEndTime", sessionEndTime);
            }
            startAllTimers();
        }
    });

    function startAllTimers() {
        runTimers(times);
        fullTimer(total_time*60);
    }
    
    async function runTimers(times) {
        // this function runs sequential timers based off of user input 

        let currentIndex = parseInt(localStorage.getItem("currentPhaseIndex")) || 0; // if an index is saved, use it

        for (let i = currentIndex; i < times.length; i++) {
            localStorage.setItem("currentPhaseIndex", i); // save index for reload purposes


            // text on top update
            if (i == 0) {
                document.getElementById("top_text").innerHTML = 'until your <span style="color:#894343;"> study session </span>';   
            } else if (i % 2 == 1) {
                document.getElementById("top_text").innerHTML = 'until your next <span style="color:#894343;"> break </span>';
            } else {
                document.getElementById("top_text").innerHTML = 'until your break is <span style="color:#894343;"> over </span>';
            }
            // text on top update
            
            TIME_LIMIT = times[i] * 60;
            startingTime = Date.now();

            await startTimer(TIME_LIMIT);

            ding.play().catch(e => console.log("Audio error:", e)); // sound once done
        }
        localStorage.removeItem("currentPhaseIndex"); // we are no longer on that phase
    }
    
    function startTimer(duration) {
        // duration parameter so its based off of which phase we are on
        
        return new Promise((resolve) => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            // for waiting purposes

            let endTime; // we are going to calculate the end time of the phase timer
            const storedPhaseEnd = localStorage.getItem("phaseEndTime"); // grab it if this is a reload
            
            if (storedPhaseEnd) {
                endTime = parseInt(storedPhaseEnd);
            } else if (remainingBaseTime) {
                endTime = Date.now() + remainingBaseTime * 1000;
                localStorage.setItem("phaseEndTime", endTime);
                remainingBaseTime = undefined;
            } else {
                endTime = Date.now() + duration * 1000; // safer than using startingTime
                localStorage.setItem("phaseEndTime", endTime);
            }
                        
            setCircleDasharray(); // start circle animation
            
            timerInterval = setInterval(() => {
                if (!isPaused) { // make sure we arent paused

                    timeLeft = Math.max(0, endTime - Date.now()) / 1000; //calculate time left for circle

                    setCircleDasharray();
                    
                    document.getElementById("base-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeft));

                    document.title = `Time left: ${formatTimeLeft(Math.ceil(timeLeft))}`     
                } else {
                    remainingBaseTime = timeLeft;
                    localStorage.setItem("remainingBaseTime", Math.ceil(remainingBaseTime));
                }

                if (timeLeft <= 0) { // if its 0 then its over
                    clearInterval(timerInterval); // new interval
                    localStorage.removeItem("phaseEndTime"); // moving onto next phase
                    localStorage.removeItem("remainingBaseTime");
                    resolve(); // awaiting over
                }
            
            }, 500); // update every half a second 
        });
    }
    
    function fullTimer(duration) {
        if (timerIntervalTotal) {
            clearInterval(timerIntervalTotal);
        }

        let endTime;

        if (remainingTotalTime) { // Resume from paused remaining time
            endTime = Date.now() + remainingTotalTime * 1000;
            localStorage.setItem("sessionEndTime", endTime);
            remainingTotalTime = undefined; // clear after using
        } else if (localStorage.getItem("sessionEndTime")) {
            // Use stored session end
            endTime = parseInt(localStorage.getItem("sessionEndTime"));
        } else {
            // First start
            endTime = Date.now() + duration * 1000;
            localStorage.setItem("sessionEndTime", endTime);
        }
        
        timerIntervalTotal = setInterval(() => {
            if (!isPaused) {

                timeLeftTotal = Math.max(0, endTime - Date.now()) / 1000; // calc

                document.getElementById("total-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeftTotal)); // display

                if (timeLeftTotal <= 0) {
                    clearInterval(timerIntervalTotal); // clear
                    localStorage.removeItem("remainingBaseTime");
                    localStorage.removeItem("remainingTotalTime");
                    localStorage.removeItem("sessionEndTime"); 
                    localStorage.removeItem("currentPhaseIndex");
                    window.location.href = "credits.html";
                }
            } else {
                remainingTotalTime = timeLeftTotal;
                localStorage.setItem("remainingTotalTime", Math.ceil(remainingTotalTime));
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
                localStorage.removeItem("remainingBaseTime");
                localStorage.removeItem("remainingTotalTime");
                localStorage.removeItem("sessionEndTime"); 
                localStorage.removeItem("currentPhaseIndex");
                localStorage.removeItem("phaseEndTime");
                window.location.href = "credits.html";
            } else if (event.key === "c") {
                isPaused = false;
                modal.style.display = "none";
            }
        });
    });
    
    pauseButton.addEventListener('click', () => {
        isPaused = true; 
        
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

