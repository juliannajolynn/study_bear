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

    document.getElementById("plan").innerHTML = studyPlan;

    console.log("Times from localStorage:", times);
    console.log("Total time from localStorage:", total_time);
    // get user info
    
    // set initial values
    let remainingBaseTime;  // for the base/phase timer
    let remainingTotalTime; // for the full/session timer

    let isPaused = true;
    let timersStarted = false;

    let TIME_LIMIT; // for circle animation

    let timeLeft; // for short timers
    let timerInterval = null; // for short timers

    let timeLeftTotal; // for long timer
    let timerIntervalTotal; // for long timer
    let startingTime; // define it first
    
    // set initial values

    // allowing website to stay awake 
    
    let wakeLock = null;
    document.body.addEventListener('click', () => {
        requestWakeLock();
    }, { once: true });

    if (toggle.checked) { timeBox.style.display = 'block'; } else { timeBox.style.display = 'none'; } // set time box invisible initially

    document.getElementById("top_text").innerHTML = 'press the <span style="color:#894343;"> play </span> to start!';   
    // set timer displays


    // timers
    if (localStorage.getItem("remainingBaseTime")) {
        remainingBaseTime = parseInt(localStorage.getItem("remainingBaseTime"));
        isPaused = true;
    }
    
    if (localStorage.getItem("remainingTotalTime")) {
        remainingTotalTime = parseInt(localStorage.getItem("remainingTotalTime"));
        isPaused = true;
    }

    playButton.addEventListener('click', () => {
        isPaused = false; 
        playButton.style.display = 'none'; 
        pauseButton.style.display = 'block';
    
        if (!timersStarted) {
            timersStarted = true; // start them
            startingTime = Date.now() // start both timers at the same saved time
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
            
            TIME_LIMIT = times[i] * 60; // the time limit for this timer is the first # * 60 to make it minutes

            // to set the label
            const storedPhaseEnd = localStorage.getItem("phaseEndTime"); // get a saved phase end
            if (storedPhaseEnd) { // if we have one
                timeLeft = Math.max(0, parseInt(storedPhaseEnd) - Date.now()) / 1000; // time left is stored end - what time it is now
            } else {
                timeLeft = TIME_LIMIT; // if its not saved we start from the beginning
            }

            document.getElementById("base-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeft)); // set the base timer to how much time is left
            // to set the label

            await startTimer(TIME_LIMIT); // start this phase's timer

            ding.play().catch(e => console.log("Audio error:", e)); // sound once done
        }
        localStorage.removeItem("currentPhaseIndex"); // we are no longer on that phase
    }
    
    function startTimer(duration) {
        // duration parameter so its based off of which phase we are on
        
        return new Promise((resolve) => {
            // for waiting purposes

            let endTime; // we are going to calculate the end time of the phase timer
            const storedPhaseEnd = localStorage.getItem("phaseEndTime"); // grab it if this is a reload
            
            if (storedPhaseEnd) { // if we have one already
                endTime = parseInt(storedPhaseEnd);  // convert from string to number
            } else {
                // Otherwise, calculate a new end time based on the starting time and duration
                endTime = startingTime + duration * 1000; // duration is in seconds, convert to milliseconds
            }

            localStorage.setItem("phaseEndTime", endTime); // keep this end time for the whole phase
            
            setCircleDasharray(); // start circle animation
            
            timerInterval = setInterval(() => {
                if (!isPaused) { // make sure we arent paused
                    if (remainingBaseTime !== undefined) {
                        // Adjust endTime based on frozen remaining time
                        endTime = Date.now() + remainingBaseTime * 1000;
                        remainingBaseTime = undefined; // reset after resume
                        localStorage.removeItem("remainingBaseTime"); 
                    }

                    timeLeft = Math.max(0, endTime - Date.now()) / 1000; //calculate time left for circle

                    setCircleDasharray();
                    
                    document.getElementById("base-timer-label").textContent = formatTimeLeft(Math.ceil(timeLeft));

                    document.title = `Time left: ${formatTimeLeft(Math.ceil(timeLeft))}`     
                } else {
                    remainingBaseTime = timeLeft;
                    localStorage.setItem("remainingBaseTime", Math.ceil(remainingBaseTime));
                }

                if (timeLeft <= 0) { // if its 0 then its over
                    localStorage.removeItem("phaseEndTime"); // moving onto next phase
                    localStorage.removeItem("remainingBaseTime");
                    clearInterval(timerInterval); // new interval
                    resolve(); // awaiting over
                }
            
            }, 500); // update every half a second 
        });
    }
    
    function fullTimer(duration) {
        if (!localStorage.getItem("sessionEndTime")) {
            const sessionEndTime = startingTime + total_time * 60 * 1000; // calculating end time with same beginning time
            localStorage.setItem("sessionEndTime", sessionEndTime);
        }

        let endTime = parseInt(localStorage.getItem("sessionEndTime")); // grab from storage
        
        timerIntervalTotal = setInterval(() => {
            if (!isPaused) {
                if (remainingTotalTime !== undefined) {
                    endTime = Date.now() + remainingTotalTime * 1000;
                    remainingTotalTime = undefined;
                    localStorage.removeItem("remainingTotalTime");
                }

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


/* Log of new features: <br> </span>
7 per 5,, new .1 for every 1.4 new features 

                -- timers are finally synced!! (ugh!) <br>
                -- timer page now doesnt let your computer go to sleep <br>
                -- error fixed where text wasn't consistent upon reload (coding stuff) <br>
                -- timer starts paused and pauses upon reload <br>
                -- now displays your study plan! next update will highlight which part of the plan ur on :)
                */ 
               

