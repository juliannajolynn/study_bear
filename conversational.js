// ============================================
// TIMEY STUDY BEAR - Conversational Setup
// Saves data compatible with existing timer.js
// timer.js reads: localStorage.getItem('times') -> flat array of numbers
// timer.js reads: localStorage.getItem('total_time') -> number
// ============================================

let conversationState = {
  screen: 'greeting',
  studyTime: null,
  studyMinutes: null,
  breakMinutes: null,
  includePrepTime: null
};

const screens = {
  greeting: {
    text: "Hello! I'm Timey.",
    buttons: [
      { label: 'hello!', cls: 'button-primary', action: function() { goToScreen('welcomeBack'); } },
      { label: 'I know who you are. (quickstart)', cls: 'button-secondary', action: function() { goToScreen('quickstart'); } }
    ]
  },
  welcomeBack: {
    text: "Let\u2019s study together! Have we studied together before?",
    buttons: [
      { label: 'no, tell me more!', cls: 'button-primary', action: function() { goToScreen('explainStudy'); } },
      { label: 'yes!', cls: 'button-secondary', action: function() { goToScreen('askDuration'); } }
    ]
  },
  explainStudy: {
    text: "I sit and study with you! How long would you like to study for?",
    input: { placeholder: '60', type: 'number', min: 30, suffix: 'minutes' },
    buttons: [
      { label: 'next', cls: 'button-primary', action: handleStudyDuration }
    ]
  },
  explainPomodoro: {
    text: "I also make sure you take breaks using the <em>pomodoro</em> method!",
    buttons: [
      { label: 'next', cls: 'button-primary', action: function() { goToScreen('explainBreaks'); } }
    ]
  },
  explainBreaks: {
    text: "The breaks will count in your total study time with me.",
    buttons: [
      { label: 'ok', cls: 'button-primary', action: function() { goToScreen('askStudyLength'); } }
    ]
  },
  askStudyLength: {
    text: "How often do you want to take a break?",
    input: { placeholder: '25', type: 'number', min: 5, prefix: 'Every', suffix: 'minutes' },
    buttons: [
      { label: 'next', cls: 'button-primary', action: handleStudyLength }
    ]
  },
  askBreakLength: {
    text: "And how long would you like your breaks to be?",
    input: { placeholder: '5', type: 'number', min: 1, suffix: 'minutes' },
    buttons: [
      { label: 'next', cls: 'button-primary', action: handleBreakLength }
    ]
  },
  askPrepTime: {
    text: "Do you need 10 minutes to prep? It will cut into our total study time.",
    buttons: [
      { label: 'yes', cls: 'button-yes', action: function() { handlePrepTime(true); } },
      { label: 'no', cls: 'button-no', action: function() { handlePrepTime(false); } }
    ]
  },
  ready: {
    text: "Ready? The timer will start when you press yes, but you can always pause.",
    buttons: [
      { label: 'yes', cls: 'button-yes', action: startSession }
    ]
  },
  askDuration: {
    text: "I sit and study with you! How long would you like to study for?",
    input: { placeholder: '60', type: 'number', min: 30, suffix: 'minutes' },
    buttons: [
      { label: 'next', cls: 'button-primary', action: handleStudyDurationReturning }
    ]
  },
  quickstart: {
    text: "Let\u2019s study together! Let me know: how long are we studying? pomodoro split? prep time before we begin?",
    custom: 'quickstart',
    buttons: [
      { label: 'done', cls: 'button-primary', action: handleQuickstart }
    ]
  }
};

function handleStudyDuration() {
  var input = document.getElementById('userInput');
  var value = parseInt(input.value, 10);
  if (isNaN(value) || value < 30) { alert('Please enter at least 30 minutes!'); return; }
  conversationState.studyTime = value;
  goToScreen('explainPomodoro');
}

function handleStudyDurationReturning() {
  var input = document.getElementById('userInput');
  var value = parseInt(input.value, 10);
  if (isNaN(value) || value < 30) { alert('Please enter at least 30 minutes!'); return; }
  conversationState.studyTime = value;
  goToScreen('askStudyLength');
}

function handleStudyLength() {
  var input = document.getElementById('userInput');
  var value = parseInt(input.value, 10);
  if (isNaN(value) || value < 5) { alert('Please enter at least 5 minutes!'); return; }
  conversationState.studyMinutes = value;
  goToScreen('askBreakLength');
}

function handleBreakLength() {
  var input = document.getElementById('userInput');
  var value = parseInt(input.value, 10);
  if (isNaN(value) || value < 1) { alert('Please enter at least 1 minute!'); return; }
  conversationState.breakMinutes = value;
  goToScreen('askPrepTime');
}

function handlePrepTime(include) {
  conversationState.includePrepTime = include;
  goToScreen('ready');
}

function handleQuickstart() {
  var durationInput = document.getElementById('qs-duration');
  var splitSelect = document.getElementById('qs-split');
  var prepYes = document.getElementById('qs-prep-yes');

  var duration = parseInt(durationInput.value, 10);
  if (isNaN(duration) || duration < 30) { alert('Please enter at least 30 minutes!'); return; }

  var parts = splitSelect.value.split('/');
  conversationState.studyTime = duration;
  conversationState.studyMinutes = parseInt(parts[0], 10);
  conversationState.breakMinutes = parseInt(parts[1], 10);
  conversationState.includePrepTime = prepYes.classList.contains('active');
  goToScreen('ready');
}

// Build flat array of minute durations (what timer.js expects)
function startSession() {
  var s = conversationState;
  var timesArray = [];
  var elapsed = 0;
  var isStudy = true;

  if (s.includePrepTime) { timesArray.push(10); elapsed += 10; }

  while (elapsed < s.studyTime) {
    if (isStudy) {
      var dur = Math.min(s.studyMinutes, s.studyTime - elapsed);
      timesArray.push(dur);
      elapsed += dur;
    } else {
      var dur2 = Math.min(s.breakMinutes, s.studyTime - elapsed);
      timesArray.push(dur2);
      elapsed += dur2;
    }
    isStudy = !isStudy;
    if (elapsed >= s.studyTime) break;
  }

  try {
    localStorage.setItem('times', JSON.stringify(timesArray));
    localStorage.setItem('total_time', JSON.stringify(s.studyTime));
    window.location.href = 'timer.html';
  } catch (err) {
    console.error('Error saving session:', err);
    alert('Error starting session. Please try again.');
  }
}

// ============================================
// Rendering
// ============================================

function goToScreen(screenName) {
  conversationState.screen = screenName;
  renderScreen();
}

function renderScreen() {
  var screen = screens[conversationState.screen];
  if (!screen) return;

  var bubbleText = document.getElementById('bubbleText');
  bubbleText.style.opacity = '0';
  setTimeout(function() {
    bubbleText.innerHTML = screen.text;
    bubbleText.style.opacity = '1';
  }, 200);

  var inputArea = document.getElementById('inputArea');

  if (screen.input) {
    inputArea.style.display = 'flex';
    var html = '';
    if (screen.input.prefix) html += '<span class="input-label">' + screen.input.prefix + '</span>';
    html += '<input type="' + screen.input.type + '" id="userInput" class="input-field" placeholder="' + screen.input.placeholder + '" min="' + screen.input.min + '">';
    if (screen.input.suffix) html += '<span class="input-label">' + screen.input.suffix + '</span>';
    inputArea.innerHTML = html;
    setTimeout(function() { var el = document.getElementById('userInput'); if (el) el.focus(); }, 250);
  } else if (screen.custom === 'quickstart') {
    inputArea.style.display = 'block';
    inputArea.innerHTML = '<div class="summary-box">' +
      '<div class="summary-row"><span>we are studying for</span> <input type="number" id="qs-duration" class="summary-input" placeholder="60" min="30" value="60"> <span>minutes</span></div>' +
      '<div class="summary-row"><span>and my pomodoro split is</span> <select id="qs-split" class="summary-input"><option value="20/5">20/5</option><option value="25/5" selected>25/5</option><option value="45/15">45/15</option><option value="50/10">50/10</option></select></div>' +
      '<div class="summary-row"><span>I</span> <button id="qs-prep-yes" class="prep-toggle active" onclick="togglePrep(this)">do</button> <span>/</span> <button id="qs-prep-no" class="prep-toggle" onclick="togglePrep(this)">do not</button> <span>want 10 minute prep time</span></div>' +
      '</div>';
  } else {
    inputArea.style.display = 'none';
    inputArea.innerHTML = '';
  }

  renderButtons(screen.buttons);
}

function togglePrep(el) {
  document.getElementById('qs-prep-yes').classList.remove('active');
  document.getElementById('qs-prep-no').classList.remove('active');
  el.classList.add('active');
}

function renderButtons(buttons) {
  var controlsArea = document.getElementById('controlsArea');
  controlsArea.innerHTML = '';
  buttons.forEach(function(btn) {
    var button = document.createElement('button');
    button.className = 'button ' + (btn.cls || 'button-primary');
    button.textContent = btn.label;
    button.addEventListener('click', btn.action);
    controlsArea.appendChild(button);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderScreen();
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      var btn = document.querySelector('#controlsArea .button-primary');
      if (btn) btn.click();
    }
  });
});
