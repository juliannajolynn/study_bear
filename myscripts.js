// ============================================
// TIMEY STUDY BEAR - Main Form Handler
// ============================================

// Constants
const CONFIG = {
  MIN_STUDY_TIME: 30,
  PREP_TIME_DURATION: 10,
  STORAGE_KEYS: {
    TIMES: 'timeyTimes',
    TOTAL_TIME: 'timeyTotalTime',
    INCLUDE_PREP: 'timeyIncludePrep',
    POMODORO_SPLIT: 'timeyPomodoroSplit'
  }
};

const POMODORO_SPLITS = {
  '20/5': { study: 20, break: 5 },
  '25/5': { study: 25, break: 5 },
  '45/15': { study: 45, break: 15 },
  '50/10': { study: 50, break: 10 }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const checkButton = document.getElementById('check');
  const xmarkButton = document.getElementById('xmark');
  const studyTimeInput = document.getElementById('times_total');
  const pomodoroSelect = document.getElementById('pomo_split');
  const conversionDisplay = document.getElementById('conversion');
  const submitButton = document.getElementById('submit');

  // State
  let includePrepTime = null;

  // ============================================
  // Prep Time Selection Handler
  // ============================================
  const selectPrepTimeOption = (selected, other) => {
    selected.classList.add('outlined');
    other.classList.remove('outlined');
  };

  checkButton.addEventListener('click', () => {
    selectPrepTimeOption(checkButton, xmarkButton);
    includePrepTime = true;
  });

  xmarkButton.addEventListener('click', () => {
    selectPrepTimeOption(xmarkButton, checkButton);
    includePrepTime = false;
  });

  // ============================================
  // Time Conversion Display
  // ============================================
  const updateTimeConversion = () => {
    const minutes = parseInt(studyTimeInput.value, 10);
    
    if (!isNaN(minutes) && minutes > 0) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        conversionDisplay.textContent = `(${hours}h ${remainingMinutes}m)`;
      } else {
        conversionDisplay.textContent = `(${remainingMinutes}m)`;
      }
    } else {
      conversionDisplay.textContent = '';
    }
  };

  studyTimeInput.addEventListener('input', updateTimeConversion);

  // ============================================
  // Pomodoro Schedule Generator
  // ============================================
  const generateStudySchedule = (totalMinutes, pomodoroSplit, hasPrepTime) => {
    const schedule = [];
    let elapsedTime = 0;
    let isStudyPhase = true;

    // Add prep time if selected
    if (hasPrepTime) {
      schedule.push({
        type: 'prep',
        duration: CONFIG.PREP_TIME_DURATION
      });
      elapsedTime += CONFIG.PREP_TIME_DURATION;
    }

    // Generate pomodoro cycles
    while (elapsedTime < totalMinutes) {
      const phaseType = isStudyPhase ? 'study' : 'break';
      const phaseDuration = isStudyPhase 
        ? pomodoroSplit.study 
        : pomodoroSplit.break;

      const remainingTime = totalMinutes - elapsedTime;
      const actualDuration = Math.min(phaseDuration, remainingTime);

      schedule.push({
        type: phaseType,
        duration: actualDuration
      });

      elapsedTime += actualDuration;
      isStudyPhase = !isStudyPhase;

      // Stop if we've reached the total time
      if (elapsedTime >= totalMinutes) break;
    }

    return schedule;
  };

  // ============================================
  // Form Submission Handler
  // ============================================
  submitButton.addEventListener('click', () => {
    // Validate form
    if (includePrepTime === null) {
      alert('Please select whether you want prep time!');
      return;
    }

    const totalMinutes = parseInt(studyTimeInput.value, 10);
    if (isNaN(totalMinutes) || totalMinutes < CONFIG.MIN_STUDY_TIME) {
      alert(`Please enter at least ${CONFIG.MIN_STUDY_TIME} minutes!`);
      return;
    }

    const pomodoroSplitValue = pomodoroSelect.value;
    const pomodoroSplit = POMODORO_SPLITS[pomodoroSplitValue];

    if (!pomodoroSplit) {
      alert('Please select a valid pomodoro split!');
      return;
    }

    // Generate schedule
    const schedule = generateStudySchedule(totalMinutes, pomodoroSplit, includePrepTime);

    // Save to localStorage
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.TIMES, JSON.stringify(schedule));
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOTAL_TIME, JSON.stringify(totalMinutes));
      localStorage.setItem(CONFIG.STORAGE_KEYS.INCLUDE_PREP, JSON.stringify(includePrepTime));
      localStorage.setItem(CONFIG.STORAGE_KEYS.POMODORO_SPLIT, pomodoroSplitValue);

      // Redirect to timer page
      window.location.href = 'timer.html';
    } catch (error) {
      console.error('Error saving session data:', error);
      alert('Error starting session. Please try again.');
    }
  });
});
