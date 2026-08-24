// --- LOAD DATA OR INITIALIZE DEFAULTS ---
let totalMinutes = parseInt(localStorage.getItem('totalMinutes')) || 0;
let streak = parseInt(localStorage.getItem('streak')) || 0;
let totalMatches = parseInt(localStorage.getItem('totalMatches')) || 0;
let totalGoals = parseInt(localStorage.getItem('totalGoals')) || 0;
let totalAssists = parseInt(localStorage.getItem('totalAssists')) || 0;
let xp = parseInt(localStorage.getItem('xp')) || 0;
let weeklyGoal = parseInt(localStorage.getItem('weeklyGoal')) || 0;

// --- LOAD PLAYER PROFILE ---
let playerName = localStorage.getItem('playerName') || "PRO PLAYER";
let playerPosition = localStorage.getItem('playerPosition') || "ST";
let playerFoot = localStorage.getItem('playerFoot') || "Right Foot";

if (document.getElementById('playerNameInput')) {
    document.getElementById('playerNameInput').value = playerName !== "PRO PLAYER" ? playerName : "";
    document.getElementById('playerPositionInput').value = playerPosition;
    document.getElementById('playerFootInput').value = playerFoot;
}
document.getElementById('futName').innerText = playerName;
document.getElementById('futPos').innerText = playerPosition;

// Save Profile Event
document.getElementById('saveProfileBtn').addEventListener('click', function() {
    const nameInput = document.getElementById('playerNameInput').value.trim();
    const posInput = document.getElementById('playerPositionInput').value;
    const footInput = document.getElementById('playerFootInput').value;

    if (nameInput) {
        playerName = nameInput;
        playerPosition = posInput;
        playerFoot = footInput;

        localStorage.setItem('playerName', playerName);
        localStorage.setItem('playerPosition', playerPosition);
        localStorage.setItem('playerFoot', playerFoot);

        document.getElementById('futName').innerText = playerName;
        document.getElementById('futPos').innerText = playerPosition;
        alert('Profile Saved Successfully!');
    } else {
        alert('Please enter a player name.');
    }
});

// --- DAILY TASKS LOGIC ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; margin-top: 8px; border-radius: 5px;";
        li.innerHTML = `
            <span style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.text}</span>
            <div>
                <button onclick="toggleTask(${index})" style="background: ${task.completed ? '#f39c12' : '#2ecc71'}; border: none; padding: 5px 10px; border-radius: 4px; color: #fff; cursor: pointer; margin-right: 5px;">${task.completed ? 'Undo' : 'Done'}</button>
                <button onclick="deleteTask(${index})" style="background: #e74c3c; border: none; padding: 5px 10px; border-radius: 4px; color: #fff; cursor: pointer;">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

const addTaskBtn = document.getElementById('addTaskBtn');
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function() {
        const taskText = document.getElementById('taskInput').value.trim();
        if (taskText) {
            tasks.push({ text: taskText, completed: false });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            document.getElementById('taskInput').value = '';
            renderTasks();
        }
    });
}

window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
};

window.deleteTask = function(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
};

// --- TABS SWITCHING LOGIC ---
const tabTrainingBtn = document.getElementById('tabTrainingBtn');
const tabMatchBtn = document.getElementById('tabMatchBtn');
const trainingForm = document.getElementById('trainingForm');
const matchForm = document.getElementById('matchForm');

if (tabTrainingBtn && tabMatchBtn) {
    tabTrainingBtn.addEventListener('click', () => {
        tabTrainingBtn.classList.add('active');
        tabMatchBtn.classList.remove('active');
        trainingForm.classList.remove('hidden');
        matchForm.classList.add('hidden');
    });

    tabMatchBtn.addEventListener('click', () => {
        tabMatchBtn.classList.add('active');
        tabTrainingBtn.classList.remove('active');
        matchForm.classList.remove('hidden');
        trainingForm.classList.add('hidden');
    });
}

// --- CHARTS & RADAR INITIALIZATION ---
let skillRadarChart = null;

function initRadarChart() {
    const ctx = document.getElementById('skillRadar');
    if (!ctx) return;
    
    // Calculate skills based on total minutes and activities
    let baseVal = Math.min(95, 50 + Math.floor(totalMinutes / 30));
    
    if (skillRadarChart) {
        skillRadarChart.data.datasets[0].data = [baseVal, baseVal, baseVal, baseVal, baseVal, baseVal];
        skillRadarChart.update();
        return;
    }

    skillRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Shooting', 'Passing', 'Dribbling', 'Pace', 'Physical', 'Defending'],
            datasets: [{
                label: 'Player Attributes',
                data: [baseVal, baseVal, baseVal, baseVal, baseVal, baseVal],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498db',
                borderWidth: 2,
                pointBackgroundColor: '#3498db'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#fff', font: { size: 11 } },
                    ticks: { display: false, max: 99, min: 40 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- ACTIVITY HISTORY & STATS LOGIC ---
let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];

function updateUI() {
    document.getElementById('total').innerText = totalMinutes + " mins";
    document.getElementById('streak').innerText = streak + " days";
    document.getElementById('totalMatches').innerText = totalMatches + " played";
    document.getElementById('totalG_A').innerText = `${totalGoals} G / ${totalAssists} A`;

    // XP Progress Calculation
    let currentLevelXP = xp % 100;
    let currentLevel = Math.floor(xp / 100) + 1;
    document.getElementById('xpText').innerText = `${currentLevelXP} / 100 XP`;
    document.getElementById('xpFill').style.width = `${currentLevelXP}%`;
    document.getElementById('playerLevel').innerText = `⚡ LEVEL ${currentLevel}`;

    // FUT Card OVR Update
    let calculatedOvr = Math.min(99, 50 + Math.floor(totalMinutes / 40) + Math.floor(totalGoals * 2));
    document.getElementById('futOvr').innerText = calculatedOvr;
    document.getElementById('futPace').innerText = calculatedOvr;
    document.getElementById('futSho').innerText = calculatedOvr;
    document.getElementById('futPas').innerText = calculatedOvr;
    document.getElementById('futDri').innerText = calculatedOvr;
    document.getElementById('futPhy').innerText = calculatedOvr;
    document.getElementById('futDef').innerText = Math.max(40, calculatedOvr - 10);

    // Update History List
    const historyEl = document.getElementById('history');
    if (historyEl) {
        historyEl.innerHTML = '';
        historyLog.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.text}</span> <button onclick="deleteLog(${index})" class="delete-btn">×</button>`;
            historyEl.appendChild(li);
        });
    }

    // Weekly Breakdown Simple Chart Update
    const weeklyChartEl = document.getElementById('weeklyChart');
    if (weeklyChartEl) {
        weeklyChartEl.innerHTML = `
            <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 120px; padding-top: 10px;">
                <div style="text-align:center;"><div style="height: ${Math.min(100, totalMinutes)}px; background: #3498db; width: 25px; border-radius: 4px; margin: 0 auto;"></div><small style="color:#aaa;">Total</small></div>
            </div>
        `;
    }

    // Save state
    localStorage.setItem('totalMinutes', totalMinutes);
    localStorage.setItem('streak', streak);
    localStorage.setItem('totalMatches', totalMatches);
    localStorage.setItem('totalGoals', totalGoals);
    localStorage.setItem('totalAssists', totalAssists);
    localStorage.setItem('xp', xp);
    localStorage.setItem('historyLog', JSON.stringify(historyLog));

    initRadarChart();
}

// Log Training Session
const addButton = document.getElementById('addButton');
if (addButton) {
    addButton.addEventListener('click', function() {
        const type = document.getElementById('trainingType').value;
        const mins = parseInt(document.getElementById('minutes').value);

        if (!mins || mins <= 0) {
            alert('Please enter valid training minutes.');
            return;
        }

        totalMinutes += mins;
        xp += 20;
        streak += 1;

        let currentDate = new Date().toISOString().split('T')[0];
        historyLog.unshift({ text: `${type} — ${mins} mins (${currentDate})`, type: 'training' });

        document.getElementById('minutes').value = '';
        updateUI();
        alert('Training Session Logged Successfully! (+20 XP)');
    });
}

// Log Match with Rating & MOTM
const addMatchButton = document.getElementById('addMatchButton');
if (addMatchButton) {
    addMatchButton.addEventListener('click', function() {
        const goals = parseInt(document.getElementById('matchGoals').value) || 0;
        const assists = parseInt(document.getElementById('matchAssists').value) || 0;
        const rating = document.getElementById('matchRating').value;

        totalMatches += 1;
        totalGoals += goals;
        totalAssists += assists;
        xp += 50;

        let motmText = rating == "10" ? " ⭐ [MOTM]" : "";
        let currentDate = new Date().toISOString().split('T')[0];
        historyLog.unshift({ text: `Match — ${goals} Goals, ${assists} Assists, Rating: ${rating}/10${motmText} (${currentDate})`, type: 'match' });

        document.getElementById('matchGoals').value = 0;
        document.getElementById('matchAssists').value = 0;
        updateUI();
        alert(`Match Logged Successfully! Rating: ${rating}/10 (+50 XP)`);
    });
}

// Weekly Goal Logic
const saveGoalButton = document.getElementById('saveGoalButton');
if (saveGoalButton) {
    saveGoalButton.addEventListener('click', function() {
        const goalVal = parseInt(document.getElementById('goalInput').value);
        if (goalVal > 0) {
            weeklyGoal = goalVal;
            localStorage.setItem('weeklyGoal', weeklyGoal);
            updateWeeklyGoalUI();
            alert('Weekly Target Set Successfully!');
        }
    });
}

function updateWeeklyGoalUI() {
    if (weeklyGoal > 0) {
        document.getElementById('goalText').innerText = `Target: ${weeklyGoal} mins`;
        document.getElementById('goalProgress').innerText = `${totalMinutes} / ${weeklyGoal} minutes completed`;
        let percent = Math.min(100, (totalMinutes / weeklyGoal) * 100);
        document.getElementById('goalFill').style.width = `${percent}%`;
    }
}

// Reset Data Button
const resetButton = document.getElementById('resetButton');
if (resetButton) {
    resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all data?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

// Delete Single Log
window.deleteLog = function(index) {
    historyLog.splice(index, 1);
    updateUI();
};

// Initial setup call
renderTasks();
updateUI();
updateWeeklyGoalUI();
