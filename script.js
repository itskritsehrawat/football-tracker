// Dynamic External Libraries Loader (Confetti & JSPDF)
(function loadExternalLibraries() {
    if (!document.getElementById('confetti-script')) {
        const cScript = document.createElement('script');
        cScript.id = 'confetti-script';
        cScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        document.head.appendChild(cScript);
    }
})();

// LocalStorage Setup
let trainingHistory = JSON.parse(localStorage.getItem("trainingHistory")) || [];
let weeklyGoal = Number(localStorage.getItem("weeklyGoal")) || 0;
let previousLevel = Number(localStorage.getItem("previousLevel")) || 1;

// Global Chart Instances
let radarChart;
let weeklyBarChart;

// Auto Calculate All Stats & Dynamic Streak
function calculateStatsFromHistory() {
    let totalMins = 0;
    let xp = 0;
    let matches = 0;
    let goals = 0;
    let assists = 0;
    let skills = { Shooting: 50, Passing: 50, Dribbling: 50, Speed: 50, Fitness: 50 };

    // Unique dates set for streak
    const uniqueDates = new Set();

    trainingHistory.forEach(item => {
        if (item.date) uniqueDates.add(item.date);

        if (item.isMatch) {
            xp += 50;
            matches += 1;
            goals += Number(item.goals || 0);
            assists += Number(item.assists || 0);
        } else {
            totalMins += Number(item.minutes || 0);
            xp += 20;
            if (item.type && skills[item.type] !== undefined) {
                skills[item.type] = Math.min(99, skills[item.type] + 2);
            }
        }
    });

    // Dynamic Streak Calculation
    let streak = 0;
    const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
    if (sortedDates.length > 0) {
        let current = new Date();
        current.setHours(0, 0, 0, 0);
        
        let latestLog = new Date(sortedDates[0]);
        latestLog.setHours(0, 0, 0, 0);

        const diffDays = Math.round((current - latestLog) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
            streak = 1;
            let checkDate = latestLog;
            for (let i = 1; i < sortedDates.length; i++) {
                let prevLog = new Date(sortedDates[i]);
                prevLog.setHours(0, 0, 0, 0);
                const dayGap = Math.round((checkDate - prevLog) / (1000 * 60 * 60 * 24));
                if (dayGap === 1) {
                    streak++;
                    checkDate = prevLog;
                } else if (dayGap > 1) {
                    break;
                }
            }
        }
    }

    return { totalMins, xp, matches, goals, assists, skills, streak };
}

// Trigger Confetti Animation
function triggerCelebration() {
    if (window.confetti) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// 1. Skill Radar Chart
function initRadarChart(skills) {
    const ctx = document.getElementById("skillRadar")?.getContext("2d");
    if (!ctx) return;
    
    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Shooting', 'Passing', 'Dribbling', 'Pace', 'Physical'],
            datasets: [{
                label: 'Skills',
                data: [skills.Shooting, skills.Passing, skills.Dribbling, skills.Speed, skills.Fitness],
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                borderColor: '#3b82f6',
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: '#1f2937' },
                    grid: { color: '#1f2937' },
                    pointLabels: { color: '#9ca3af', font: { size: 10, weight: 'bold' } },
                    ticks: { display: false },
                    suggestedMin: 30,
                    suggestedMax: 99
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// 2. Weekly Activity Bar Chart
function initWeeklyChart() {
    const container = document.getElementById("weeklyChart");
    if (!container) return;

    container.innerHTML = '<canvas id="barCanvas" style="max-height: 220px; width: 100%;"></canvas>';
    const ctx = document.getElementById("barCanvas").getContext("2d");

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const minsPerDay = [0, 0, 0, 0, 0, 0, 0];

    trainingHistory.forEach(item => {
        if (item.date && !item.isMatch) {
            const dayIndex = new Date(item.date).getDay();
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            if (adjustedIndex >= 0 && adjustedIndex < 7) {
                minsPerDay[adjustedIndex] += Number(item.minutes || 0);
            }
        }
    });

    if (weeklyBarChart) weeklyBarChart.destroy();

    weeklyBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Training (Mins)',
                data: minsPerDay,
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' }, beginAtZero: true }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderUI() {
    const { totalMins, xp, matches, goals, assists, skills, streak } = calculateStatsFromHistory();

    // XP & Level Logic
    const level = Math.floor(xp / 100) + 1;
    const currentXP = xp % 100;
    
    if (level > previousLevel) {
        triggerCelebration();
        localStorage.setItem("previousLevel", level);
        previousLevel = level;
    }

    let rank = "Rookie";
    if (level >= 3) rank = "Amateur";
    if (level >= 5) rank = "Semi-Pro";
    if (level >= 10) rank = "Pro Athlete";

    // Text Updates
    if (document.querySelector("#playerLevel")) document.querySelector("#playerLevel").textContent = "⚡ LEVEL " + level;
    if (document.querySelector("#rankTitle")) document.querySelector("#rankTitle").textContent = rank;
    if (document.querySelector("#xpText")) document.querySelector("#xpText").textContent = currentXP + " / 100 XP";
    if (document.querySelector("#xpFill")) document.querySelector("#xpFill").style.width = currentXP + "%";
    if (document.querySelector("#total")) document.querySelector("#total").textContent = totalMins + " mins";
    if (document.querySelector("#totalMatches")) document.querySelector("#totalMatches").textContent = matches + " played";
    if (document.querySelector("#totalG_A")) document.querySelector("#totalG_A").textContent = goals + " G / " + assists + " A";
    
    // Active Streak Card Update
    const streakElement = document.querySelector("#streakText") || document.querySelectorAll(".card h3, .card div")[1];
    if (streakElement) streakElement.textContent = streak + " days";

    // Weekly Goal Update
    if (weeklyGoal > 0) {
        if (document.querySelector("#goalText")) document.querySelector("#goalText").textContent = "Target: " + weeklyGoal + " mins";
        if (document.querySelector("#goalProgress")) document.querySelector("#goalProgress").textContent = totalMins + " / " + weeklyGoal + " minutes completed";
        const pct = Math.min(100, Math.round((totalMins / weeklyGoal) * 100));
        if (document.querySelector("#goalFill")) document.querySelector("#goalFill").style.width = pct + "%";
    }

    // FUT Card Stats Sync
    const ovr = Math.floor((skills.Shooting + skills.Passing + skills.Dribbling + skills.Speed + skills.Fitness) / 5);
    if (document.querySelector("#futOvr")) document.querySelector("#futOvr").textContent = ovr;
    if (document.querySelector("#futPace")) document.querySelector("#futPace").textContent = skills.Speed;
    if (document.querySelector("#futSho")) document.querySelector("#futSho").textContent = skills.Shooting;
    if (document.querySelector("#futPas")) document.querySelector("#futPas").textContent = skills.Passing;
    if (document.querySelector("#futDri")) document.querySelector("#futDri").textContent = skills.Dribbling;
    if (document.querySelector("#futPhy")) document.querySelector("#futPhy").textContent = skills.Fitness;

    // Render Recent Activity History
    const historyUI = document.querySelector("#history");
    if (historyUI) {
        historyUI.innerHTML = "";
        trainingHistory.forEach((item, index) => {
            const li = document.createElement("li");
            li.style.cssText = "display: flex; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); margin-bottom: 8px; border-radius: 6px; align-items: center; color: #fff; list-style: none;";
            
            const title = item.isMatch 
                ? `⚽ Match — ${item.goals} Goals, ${item.assists} Assists (${item.date})`
                : `📌 ${item.type} — ${item.minutes} mins (${item.date})`;

            li.innerHTML = `
                <span>${title}</span>
                <button onclick="deleteLog(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size: 16px;">✖</button>
            `;
            historyUI.appendChild(li);
        });
    }

    // Trophies / Badges Update
    const achievements = document.querySelectorAll("#achievements .achievement");
    if (achievements.length > 0) {
        achievements.forEach(a => a.classList.add("locked"));
        if (trainingHistory.length >= 1 && achievements[0]) achievements[0].classList.remove("locked");
        if (totalMins >= 100 && achievements[1]) achievements[1].classList.remove("locked");
        if (totalMins >= 500 && achievements[2]) achievements[2].classList.remove("locked");
        if (streak >= 7 && achievements[3]) achievements[3].classList.remove("locked");
        if (matches >= 1 && achievements[4]) achievements[4].classList.remove("locked");
        if (totalMins >= 1000 && achievements[5]) achievements[5].classList.remove("locked");
    }

    initRadarChart(skills);
    initWeeklyChart();
}

// Delete Log Entry
window.deleteLog = function(index) {
    trainingHistory.splice(index, 1);
    localStorage.setItem("trainingHistory", JSON.stringify(trainingHistory));
    renderUI();
};

// TAB TOGGLE
document.querySelector("#tabTrainingBtn")?.addEventListener("click", () => {
    document.querySelector("#tabTrainingBtn").classList.add("active");
    document.querySelector("#tabMatchBtn").classList.remove("active");
    document.querySelector("#trainingForm").classList.remove("hidden");
    document.querySelector("#matchForm").classList.add("hidden");
});

document.querySelector("#tabMatchBtn")?.addEventListener("click", () => {
    document.querySelector("#tabMatchBtn").classList.add("active");
    document.querySelector("#tabTrainingBtn").classList.remove("active");
    document.querySelector("#matchForm").classList.remove("hidden");
    document.querySelector("#trainingForm").classList.add("hidden");
});

// LOG TRAINING
document.querySelector("#addButton")?.addEventListener("click", () => {
    const mins = Number(document.querySelector("#minutes").value);
    const type = document.querySelector("#trainingType").value;
    if (mins <= 0) return alert("Please enter valid minutes!");

    const d = new Date();
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

    trainingHistory.unshift({ type, minutes: mins, date: dateStr, isMatch: false });
    localStorage.setItem("trainingHistory", JSON.stringify(trainingHistory));
    
    document.querySelector("#minutes").value = "";
    renderUI();
});

// LOG MATCH
document.querySelector("#addMatchButton")?.addEventListener("click", () => {
    const goals = Number(document.querySelector("#matchGoals").value) || 0;
    const assists = Number(document.querySelector("#matchAssists").value) || 0;

    const d = new Date();
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

    trainingHistory.unshift({ isMatch: true, goals, assists, date: dateStr });
    localStorage.setItem("trainingHistory", JSON.stringify(trainingHistory));

    document.querySelector("#matchGoals").value = "0";
    document.querySelector("#matchAssists").value = "0";
    renderUI();
});

// SET WEEKLY TARGET
document.querySelector("#saveGoalButton")?.addEventListener("click", () => {
    const goalVal = Number(document.querySelector("#goalInput").value);
    if (goalVal > 0) {
        weeklyGoal = goalVal;
        localStorage.setItem("weeklyGoal", weeklyGoal);
        document.querySelector("#goalInput").value = "";
        renderUI();
    }
});

// EXPORT SUMMARY FUNCTIONALITY
document.querySelectorAll("button").forEach(btn => {
    if (btn.textContent.includes("Export PDF")) {
        btn.addEventListener("click", () => {
            const { totalMins, matches, goals, assists } = calculateStatsFromHistory();
            const text = `=== FOOTBALL TRACKER SUMMARY ===\nTotal Training: ${totalMins} Mins\nMatches Played: ${matches}\nGoals: ${goals}\nAssists: ${assists}\n\nGenerated on: ${new Date().toLocaleDateString()}`;
            
            const blob = new Blob([text], { type: 'text/plain' });
            const anchor = document.createElement('a');
            anchor.href = URL.createObjectURL(blob);
            anchor.download = 'Football_Tracker_Summary.txt';
            anchor.click();
        });
    }
});

// RESET ALL
document.querySelector("#resetButton")?.addEventListener("click", () => {
    if (confirm("Reset all training & match data?")) {
        localStorage.clear();
        trainingHistory = [];
        weeklyGoal = 0;
        previousLevel = 1;
        renderUI();
    }
});

// Initial Load
renderUI();