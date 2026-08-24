// Weekly Breakdown 7-Days Chart Update
    const weeklyChartEl = document.getElementById('weeklyChart');
    if (weeklyChartEl) {
        // Din ke naam
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        // Har din ke liye default minutes 0 set karte hain
        let dayMinutes = [0, 0, 0, 0, 0, 0, 0];

        // History log se check karke minutes korespective din me daalenge
        historyLog.forEach(item => {
            if (item.type === 'training' && item.date) {
                let d = new Date(item.date);
                let dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday...
                // Adjust index so Monday is 0 and Sunday is 6
                let adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                dayMinutes[adjustedIndex] += item.mins || 0;
            }
        });

        // HTML generate karna 7 bars ke liye
        let barsHTML = days.map((day, index) => {
            let mins = dayMinutes[index];
            let height = Math.min(100, mins); // max height limit
            return `
                <div style="text-align:center; flex: 1;">
                    <div style="height: ${height}px; background: #3b82f6; width: 20px; border-radius: 4px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: center;">
                        <span style="font-size: 9px; color: #fff; padding-bottom: 2px;">${mins > 0 ? mins : ''}</span>
                    </div>
                    <small style="color:#94a3b8; font-size: 11px; display: block; margin-top: 5px;">${day}</small>
                </div>
            `;
        }).join('');

        weeklyChartEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 130px; padding-top: 15px; padding-bottom: 5px;">
                ${barsHTML}
            </div>
        `;
    }
