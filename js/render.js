/* ============================================================
   SmartGPA — js/render.js
   All UI rendering functions
   ============================================================ */

'use strict';

// ── MASTER RENDER ─────────────────────────────────────────────

function renderAll() {
    if (!appState.profileSetup) {
        $('welcomeBanner').style.display  = '';
        $('dashboardGrid').style.display  = 'none';
    } else {
        $('welcomeBanner').style.display  = 'none';
        $('dashboardGrid').style.display  = '';
        $('studentNameDisplay').textContent = appState.studentName;

        renderStatCards();
        renderGoalTracker();
        renderSemesterTable();
        renderSemesterCards();
        renderAnalyticsSummary();
        renderCgpaRing();
        renderSemesterRoadmap();
        updatePredictionStanding();
    }
}

// ── GOAL TRACKER WIDGET ───────────────────────────────────────

function renderGoalTracker() {
    const tracker = $('goalTrackerWidget');
    if (!tracker) return;

    const cgpa = calcCGPA();
    const sems = appState.semesters;

    if (sems.length === 0) {
        tracker.style.display = 'none';
        return;
    }
    tracker.style.display = '';

    const next = getNextClassification(cgpa);
    const cls  = classifyGpa(cgpa);

    const currentEl  = $('gtCurrentClass');
    const targetEl   = $('gtTargetClass');
    const barEl      = $('gtProgressBar');
    const msgEl      = $('gtMessage');
    const cgpaEl     = $('gtCgpaValue');

    if (cgpaEl) cgpaEl.textContent = cgpa.toFixed(2);

    if (!next) {
        // Already First Class
        if (currentEl) currentEl.textContent = '🏆 First Class';
        if (targetEl)  targetEl.textContent  = 'Top Achievement!';
        if (barEl)     barEl.style.width     = '100%';
        if (barEl)     barEl.style.background = 'linear-gradient(90deg, #059669, #34d399)';
        if (msgEl)     msgEl.textContent = '🎉 Congratulations! You have achieved First Class standing!';
        tracker.classList.add('gt-achieved');
        return;
    }

    tracker.classList.remove('gt-achieved');

    // Compute progress between last class boundary and next target
    // e.g. if targeting Second Lower (3.0), range is [2.0, 3.0]
    const boundaries = [0, 2.0, 3.0, 3.3, 3.7, 4.0];
    const targetIdx  = boundaries.indexOf(next.target);
    const lowerBound = targetIdx > 0 ? boundaries[targetIdx - 1] : 0;
    const range      = next.target - lowerBound;
    const progress   = Math.max(0, Math.min(1, (cgpa - lowerBound) / range));
    const gap        = Math.max(0, next.target - cgpa);

    if (currentEl) currentEl.textContent = `${cls.icon} ${cls.label}`;
    if (targetEl)  targetEl.textContent  = `🎯 ${next.label}`;
    if (barEl) {
        barEl.style.width      = (progress * 100).toFixed(1) + '%';
        barEl.style.background = `linear-gradient(90deg, ${cls.color}, ${next.color})`;
    }

    // Motivational message
    const msgs = {
        'General Pass': ['Keep pushing — every semester counts!', 'Stay consistent and you\'ll get there!'],
        'Second Lower': ['Great progress! Second Lower is within reach!', 'You\'re climbing steadily — keep it up!'],
        'Second Upper': ['Excellent work! Second Upper honours await!', 'Just a little more effort — you\'ve got this!'],
        'First Class':  ['You\'re almost at the peak! First Class is close!', 'Outstanding dedication — First Class is nearly yours!']
    };
    const msgArr = msgs[next.label] || ['Keep working hard!'];
    if (msgEl) msgEl.textContent = `Need ${gap.toFixed(2)} more CGPA → ${next.label}. ${msgArr[Math.floor(Math.random() * msgArr.length)]}`;
}

// ── STAT CARDS ────────────────────────────────────────────────

function renderStatCards() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    const total     = appState.totalCredits;
    const remaining = Math.max(0, total - completed);
    const pct       = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
    const sems      = appState.semesters;
    const cls       = classifyGpa(cgpa);

    // CGPA Card
    $('cgpaValue').textContent = sems.length > 0 ? cgpa.toFixed(2) : '0.00';
    const badge = $('classificationBadge');
    badge.textContent = sems.length > 0 ? cls.label : 'Not Calculated';
    badge.className   = `classification-badge ${sems.length > 0 ? cls.badge : 'badge-nodata'}`;

    // Credits Card
    $('completedCreditsDisplay').textContent = completed;
    $('totalCreditsDisplay').textContent     = total;
    $('remainingCreditsDisplay').textContent = remaining;
    $('creditProgressBar').style.width       = pct.toFixed(1) + '%';
    $('creditProgressPct').textContent       = pct.toFixed(0) + '%';

    // Semesters Count Card
    $('semesterCountDisplay').textContent = sems.length;
    if (sems.length > 0) {
        const best   = sems.reduce((p, c) => c.gpa > p.gpa ? c : p);
        const lowest = sems.reduce((p, c) => c.gpa < p.gpa ? c : p);
        $('bestGpaDisplay').textContent   = best.gpa.toFixed(2);
        $('lowestGpaDisplay').textContent = lowest.gpa.toFixed(2);
    } else {
        $('bestGpaDisplay').textContent   = '--';
        $('lowestGpaDisplay').textContent = '--';
    }

    // Status Card
    if (sems.length > 0) {
        $('statusIconBig').textContent = cls.icon;
        $('statusText').textContent    = cls.label;
        if (sems.length >= 2) {
            const last = sems[sems.length - 1].gpa;
            const prev = sems[sems.length - 2].gpa;
            const diff = (last - prev).toFixed(2);
            if (last > prev) {
                $('trendArrow').textContent = '↑';
                $('trendArrow').style.color = '#10b981';
                $('trendText').textContent  = `Up ${diff} from last semester`;
            } else if (last < prev) {
                $('trendArrow').textContent = '↓';
                $('trendArrow').style.color = '#ef4444';
                $('trendText').textContent  = `Down ${Math.abs(diff)} from last semester`;
            } else {
                $('trendArrow').textContent = '→';
                $('trendArrow').style.color = '#94a3b8';
                $('trendText').textContent  = 'Same as last semester';
            }
        } else {
            $('trendArrow').textContent = '→';
            $('trendArrow').style.color = '#94a3b8';
            $('trendText').textContent  = 'Add more semesters to see trend';
        }
    } else {
        $('statusIconBig').textContent = '📋';
        $('statusText').textContent    = 'No data yet';
        $('trendArrow').textContent    = '→';
        $('trendArrow').style.color    = '#94a3b8';
        $('trendText').textContent     = 'Add semesters to see trend';
    }
}

// ── CGPA RING (Canvas) ────────────────────────────────────────

function renderCgpaRing() {
    const canvas = $('cgpaRing');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const cgpa = calcCGPA();
    const pct  = cgpa / 4.0;
    const cx   = canvas.width / 2;
    const cy   = canvas.height / 2;
    const r    = 38;
    const lw   = 8;
    const start = -Math.PI / 2;
    const end   = start + pct * 2 * Math.PI;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = getComputedStyle(document.documentElement)
                        .getPropertyValue('--border').trim() || '#e2e8f0';
    ctx.lineWidth = lw;
    ctx.stroke();

    // Fill arc
    if (pct > 0) {
        const cls = classifyGpa(cgpa);
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, end);
        ctx.strokeStyle = cls.color;
        ctx.lineWidth   = lw;
        ctx.lineCap     = 'round';
        ctx.stroke();
    }
}

// ── SEMESTER TABLE (Dashboard) ────────────────────────────────

function renderSemesterTable() {
    const tbody    = $('semTableBody');
    const emptyRow = $('emptyTableRow');
    const sems     = appState.semesters;

    $('semCountBadge').textContent = `${sems.length} entr${sems.length === 1 ? 'y' : 'ies'}`;
    tbody.querySelectorAll('tr:not(#emptyTableRow)').forEach(r => r.remove());

    if (sems.length === 0) { emptyRow.style.display = ''; return; }
    emptyRow.style.display = 'none';

    sems.forEach((sem, idx) => {
        const cls = classifyGpa(sem.gpa);
        const tr  = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:var(--text-muted);font-weight:600;">${idx + 1}</td>
            <td style="font-weight:600;">${escHtml(sem.name)}</td>
            <td class="gpa-cell ${getGpaTableClass(sem.gpa)}">${sem.gpa.toFixed(2)}</td>
            <td>${sem.credits} cr.</td>
            <td><span class="classification-badge ${cls.badge}">${cls.label}</span></td>
            <td class="action-btns">
                <button class="btn-icon edit" title="Edit" onclick="openEditModal(${sem.id})">✏️</button>
                <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})">🗑️</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ── SEMESTER CARDS (Management Section) ──────────────────────

function renderSemesterCards() {
    const grid = $('semestersGrid');
    const sems = appState.semesters;
    grid.innerHTML = '';

    if (sems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-full">
                <div class="empty-icon">📚</div>
                <h3>No Semesters Yet</h3>
                <p>Add your first semester from the Dashboard to begin tracking.</p>
            </div>`;
        return;
    }

    sems.forEach((sem, idx) => {
        const cls  = classifyGpa(sem.gpa);
        const card = document.createElement('div');
        card.className = `semester-card ${cls.cardClass}`;
        card.innerHTML = `
            <div class="sem-card-header">
                <div class="sem-card-name">${escHtml(sem.name)}</div>
                <div class="sem-card-actions">
                    <button class="btn-icon edit" title="Edit" onclick="openEditModal(${sem.id})">✏️</button>
                    <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})">🗑️</button>
                </div>
            </div>
            <div class="sem-card-gpa">${sem.gpa.toFixed(2)}</div>
            <div class="sem-card-label">GPA — ${cls.icon} ${cls.label}</div>
            <div class="sem-card-credits">
                <div class="credit-pill">
                    <span class="val">${sem.credits}</span>
                    <span class="lbl">Credits</span>
                </div>
                <div class="credit-pill">
                    <span class="val">${idx + 1}</span>
                    <span class="lbl">Semester #</span>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

// ── ANALYTICS SUMMARY ─────────────────────────────────────────

function renderAnalyticsSummary() {
    const sems = appState.semesters;

    if (sems.length === 0) {
        ['bestSemName','bestSemGpa','weakSemName','weakSemGpa',
         'perfTrendText','perfTrendSub','perfCgpa','perfClass'].forEach(id => {
            const el = $(id); if (el) el.textContent = '--';
        });
        $('perfTrendIcon').textContent = '📊';
        return;
    }

    const best = sems.reduce((p, c) => c.gpa > p.gpa ? c : p);
    const weak = sems.reduce((p, c) => c.gpa < p.gpa ? c : p);
    const cgpa = calcCGPA();
    const cls  = classifyGpa(cgpa);

    $('bestSemName').textContent = best.name;
    $('bestSemGpa').textContent  = `GPA: ${best.gpa.toFixed(2)}`;
    $('weakSemName').textContent = weak.name;
    $('weakSemGpa').textContent  = `GPA: ${weak.gpa.toFixed(2)}`;
    $('perfCgpa').textContent    = cgpa.toFixed(2);
    $('perfClass').textContent   = `Classification: ${cls.label}`;

    if (sems.length >= 2) {
        const first = sems[0].gpa;
        const last  = sems[sems.length - 1].gpa;
        if (last > first) {
            $('perfTrendIcon').textContent = '📈';
            $('perfTrendText').textContent = 'Improving';
            $('perfTrendSub').textContent  = `+${(last - first).toFixed(2)} since Sem 1`;
        } else if (last < first) {
            $('perfTrendIcon').textContent = '📉';
            $('perfTrendText').textContent = 'Declining';
            $('perfTrendSub').textContent  = `${(last - first).toFixed(2)} since Sem 1`;
        } else {
            $('perfTrendIcon').textContent = '➡️';
            $('perfTrendText').textContent = 'Stable';
            $('perfTrendSub').textContent  = 'No change since Sem 1';
        }
    } else {
        $('perfTrendIcon').textContent = '📊';
        $('perfTrendText').textContent = 'Only 1 semester';
        $('perfTrendSub').textContent  = 'Add more to see trend';
    }
}

// ── CHARTS ────────────────────────────────────────────────────

function renderCharts() {
    renderGpaLineChart();
    renderCreditDoughnut();
}

function renderGpaLineChart() {
    const sems     = appState.semesters;
    const canvas   = $('gpaLineChart');
    const emptyMsg = $('chartEmpty');

    if (sems.length < 2) {
        canvas.style.display   = 'none';
        emptyMsg.style.display = '';
        return;
    }
    canvas.style.display   = '';
    emptyMsg.style.display = 'none';

    const labels   = sems.map(s => s.name);
    const data     = sems.map(s => s.gpa);
    const isDark   = document.documentElement.dataset.theme === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const tickColor = isDark ? '#64748b' : '#94a3b8';

    // Running CGPA line
    let runSum = 0, runCredits = 0;
    const cgpaLine = sems.map(s => {
        runSum     += s.gpa * s.credits;
        runCredits += s.credits;
        return parseFloat((runSum / runCredits).toFixed(2));
    });

    // Threshold lines at 3.7 (First Class) and 3.3 (Upper Second)
    const annotations = {};

    if (gpaLineChart) gpaLineChart.destroy();

    gpaLineChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Semester GPA',
                    data,
                    borderColor: '#2563eb',
                    backgroundColor: (ctx) => {
                        const chart = ctx.chart;
                        const { ctx: c, chartArea } = chart;
                        if (!chartArea) return 'rgba(37,99,235,0.1)';
                        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0,   'rgba(37,99,235,0.25)');
                        gradient.addColorStop(1,   'rgba(37,99,235,0.01)');
                        return gradient;
                    },
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Cumulative CGPA',
                    data: cgpaLine,
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [6, 3],
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: false
                },
                // First Class threshold line
                {
                    label: 'First Class (3.70)',
                    data: new Array(sems.length).fill(3.70),
                    borderColor: 'rgba(5,150,105,0.4)',
                    borderWidth: 1.5,
                    borderDash: [3, 5],
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                // Second Upper threshold line
                {
                    label: 'Second Upper (3.30)',
                    data: new Array(sems.length).fill(3.30),
                    borderColor: 'rgba(37,99,235,0.3)',
                    borderWidth: 1.5,
                    borderDash: [3, 5],
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeInOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: tickColor,
                        font: { size: 11, family: 'Inter' },
                        usePointStyle: true,
                        filter: item => item.text !== 'First Class (3.70)' && item.text !== 'Second Upper (3.30)' ? true : false
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor:      isDark ? '#f1f5f9' : '#0f172a',
                    bodyColor:       isDark ? '#94a3b8' : '#64748b',
                    borderColor:     isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: ctx => {
                            if (ctx.dataset.label.includes('3.')) return null; // hide threshold tooltips
                            return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0, max: 4.0,
                    ticks: { color: tickColor, font: { size: 11 }, stepSize: 0.5, callback: v => v.toFixed(1) },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: tickColor, font: { size: 11 } },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function renderCreditDoughnut() {
    const completed = calcCompletedCredits();
    const total     = appState.totalCredits;
    const remaining = Math.max(0, total - completed);
    const pct       = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
    const canvas    = $('creditDoughnut');
    const isDark    = document.documentElement.dataset.theme === 'dark';

    $('doughnutPct').textContent = `${pct.toFixed(0)}%`;
    if (creditDoughnut) creditDoughnut.destroy();

    creditDoughnut = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [completed, remaining],
                backgroundColor: ['#10b981', isDark ? '#1e293b' : '#e2e8f0'],
                borderColor:     ['#10b981', isDark ? '#334155' : '#cbd5e1'],
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700 },
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        font: { size: 12, family: 'Inter' },
                        usePointStyle: true,
                        padding: 16
                    }
                },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} credits` }
                }
            }
        }
    });
}

// ── SEMESTER ROADMAP ──────────────────────────────────────────

function renderSemesterRoadmap() {
    const totalSems  = appState.totalSemesters || 8;
    const compSems   = appState.completedSemesters || 0;
    const recordedSems = appState.semesters;
    const lastCompleted = Math.max(compSems, recordedSems.length);

    const badge = $('roadmapProgressBadge');
    if (badge) {
        const pct = totalSems > 0 ? Math.min(100, Math.round((lastCompleted / totalSems) * 100)) : 0;
        badge.textContent = `${lastCompleted} of ${totalSems} Semesters (${pct}% Complete)`;
    }

    const completedChipsDiv = $('completedChips');
    const completedSection  = $('completedSemsSection');
    const roadmapDivider    = $('roadmapDivider');
    const upcomingTimeline  = $('upcomingTimeline');
    const upcomingSection   = $('upcomingSemsSection');

    // Completed chips
    if (completedChipsDiv) {
        completedChipsDiv.innerHTML = '';
        if (lastCompleted > 0) {
            completedSection.style.display = '';
            roadmapDivider.style.display   = '';
            for (let i = 1; i <= lastCompleted; i++) {
                const semData  = recordedSems[i - 1];
                const dispName = semData ? semData.name : `Semester ${i}`;
                const detail   = semData ? `${semData.gpa.toFixed(2)} GPA` : 'No record';
                const hasGpa   = !!semData;
                const chip     = document.createElement('div');
                chip.className = 'completed-chip';
                chip.innerHTML = `
                    <span class="icon">✅</span>
                    <span class="chip-name">${escHtml(dispName)}</span>
                    <span class="chip-gpa" style="${hasGpa ? '' : 'color:var(--text-muted);font-style:italic;border-color:var(--border);'}">${detail}</span>`;
                completedChipsDiv.appendChild(chip);
            }
        } else {
            completedSection.style.display = 'none';
            roadmapDivider.style.display   = 'none';
        }
    }

    // Upcoming timeline
    if (upcomingTimeline) {
        upcomingTimeline.innerHTML = '';
        const upcomingCount = totalSems - lastCompleted;
        if (upcomingCount > 0) {
            upcomingSection.style.display = '';
            for (let i = lastCompleted + 1; i <= totalSems; i++) {
                const step   = document.createElement('div');
                const isNext = (i === lastCompleted + 1);
                step.className = `roadmap-timeline-step ${isNext ? 'active-step' : ''}`;
                step.innerHTML = `
                    <div class="rts-name">Semester ${i}</div>
                    <div class="rts-status">${isNext ? '🎯 Next Up' : '⏳ Pending'}</div>`;
                upcomingTimeline.appendChild(step);
            }
        } else {
            upcomingSection.style.display  = 'none';
            if (roadmapDivider) roadmapDivider.style.display = 'none';
            const congMsg = document.createElement('div');
            congMsg.className = 'pred-empty';
            congMsg.style.cssText = 'padding:20px;width:100%;text-align:center;';
            congMsg.innerHTML = `
                <div style="font-size:2.5rem;margin-bottom:8px;">🎓</div>
                <h4 style="color:#059669;font-weight:700;">Congratulations!</h4>
                <p style="font-size:0.85rem;color:var(--text-secondary);">You have completed all semesters of your program.</p>`;
            upcomingTimeline.appendChild(congMsg);
            upcomingSection.style.display = '';
        }
    }
}

// ── PREDICTION STANDING ───────────────────────────────────────

function updatePredictionStanding() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    const remaining = Math.max(0, appState.totalCredits - completed);
    const cls       = classifyGpa(cgpa);

    $('predCurrentCgpa').textContent      = appState.semesters.length > 0 ? cgpa.toFixed(2) : '--';
    const classEl = $('predCurrentClass');
    classEl.textContent = appState.semesters.length > 0 ? cls.label : '--';
    classEl.style.color = appState.semesters.length > 0 ? cls.color : 'inherit';
    $('predCompletedCredits').textContent = completed + ' cr.';
    $('predRemainingCredits').textContent = remaining > 0 ? remaining + ' cr.' : '0 cr.';
}
