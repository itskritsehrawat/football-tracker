// Load Data or Initialize defaults
let totalMinutes = parseInt(localStorage.getItem('totalMinutes')) || 0;
let streak = parseInt(localStorage.getItem('streak')) || 0;
let totalMatches = parseInt(localStorage.getItem('totalMatches')) || 0;
let totalGoals = parseInt(localStorage.getItem('totalGoals')) || 0;
let totalAssists = parseInt(localStorage.getItem('totalAssists')) || 0;
let xp = parseInt(localStorage.getItem('xp')) || 0;

// Load Profile Data
let playerName = localStorage.getItem('playerName') || "PRO PLAYER";
let playerPosition = localStorage.getItem('playerPosition') || "ST";
let playerFoot = localStorage.getItem('playerFoot') || "Right Foot";

// Initialize Profile UI Inputs if they exist
document.getElementById('playerNameInput').value = playerName !== "PRO PLAYER" ? playerName : "";
document.getElementById('playerPositionInput').value = playerPosition;
document.getElementById('playerFootInput').value = playerFoot;
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

// Daily Tasks Logic
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks() {
    const taskList = document.getElementById('taskList');
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

document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskText = document.getElementById('taskInput').value.trim();
    if (taskText) {
        tasks.push({ text: taskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        document.getElementById('taskInput').value = '';
        renderTasks();
    }
});

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

// Tabs Switching Logic for Training & Match forms
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

// Initial UI Render
renderTasks();
