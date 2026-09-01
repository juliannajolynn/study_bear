// Results page - reads from the same localStorage keys as timer.js
var messages = [
  "You're doing amazing! Keep up the good work!",
  "Consistency is the key to success! Great session!",
  "You crushed that session! Never stop learning!",
  "Another step towards your goals! Keep going!",
  "Your dedication is inspiring! Well done!",
  "Study hard, stay focused, achieve big!",
  "Rest is part of the process. You earned it!",
  "Every minute counts! Great effort!"
];

document.addEventListener('DOMContentLoaded', function() {
  try {
    var totalTime = JSON.parse(localStorage.getItem('total_time'));
    if (totalTime) {
      document.getElementById('total-study-time').textContent = totalTime;
    }

    // Count today's sessions
    var sessions = JSON.parse(localStorage.getItem('timeyCompletedSessions') || '[]');
    var today = new Date().toDateString();
    // Record this session
    sessions.push({ completedAt: new Date().toISOString(), totalTime: totalTime });
    localStorage.setItem('timeyCompletedSessions', JSON.stringify(sessions));

    var todayCount = sessions.filter(function(s) {
      return new Date(s.completedAt).toDateString() === today;
    }).length;
    document.getElementById('daily-sessions').textContent = todayCount;
  } catch (e) {
    console.error('Error loading results:', e);
  }

  // Random motivational message
  var msg = messages[Math.floor(Math.random() * messages.length)];
  document.getElementById('motivational-message').textContent = msg;
});
