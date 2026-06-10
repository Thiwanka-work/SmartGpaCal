/* ============================================================
   SmartGPA - University Academic Management System
   script.js - Complete Application Logic
   ============================================================ */

'use strict';

// ── 1. APPLICATION STATE ──────────────────────────────────────
/**
 * Single source of truth for all app data.
 * Saved to / loaded from localStorage automatically.
 */
let appState = {
    studentName:   '',      // Student's name
    totalCredits:  0,       // Total program credits (e.g. 120)
    totalSemesters: 8,      // Total semesters in program
    completedSemesters: 0,  // Completed semesters
    semesters:     [],      // Array of semester objects
    profileSetup:  false    // Whether initial setup is done
};

// Each semester object looks like:
// { id, name, gpa, credits }

// ── 2. CHART INSTANCES ─────────────────────────────────────────
let gpaLineChart    = null;
let creditDoughnut  = null;

// ── 3. DOM REFERENCES ──────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── 4. INITIALIZATION ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();   // Restore data from localStorage
    bindEvents();        // Attach all event listeners
    renderAll();         // Paint the full UI
});

// ── 5. LOCALSTORAGE PERSISTENCE ────────────────────────────────

/** Save current appState to localStorage */
function saveToStorage() {
    localStorage.setItem('smartGpa_v2', JSON.stringify(appState));
}

/** Load appState from localStorage (if it exists) */
function loadFromStorage() {
    const raw = localStorage.getItem('smartGpa_v2');
    if (raw) {
        try {
            appState = JSON.parse(raw);
            if (appState.totalSemesters === undefined) appState.totalSemesters = 8;
            if (appState.completedSemesters === undefined) appState.completedSemesters = 0;
        } catch (e) {
            console.warn('Could not parse saved data, starting fresh.');
        }
    }
}

// ── 6. EVENT BINDING ───────────────────────────────────────────

function bindEvents() {
    // ---- Sidebar Navigation ----
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });

    // ---- Mobile menu toggle ----
    $('menuToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        $('sidebar').classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    $('mainContent').addEventListener('click', () => {
        $('sidebar').classList.remove('open');
    });

    // ---- Profile Setup ----
    $('setupProfileBtn').addEventListener('click', handleProfileSetup);

    // Allow Enter key on profile setup
    [$('studentNameInput'), $('totalCreditsInput'), $('totalSemestersInput'), $('completedSemestersInput')].forEach(el => {
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleProfileSetup(); });
    });

    // ---- Add Semester (Dashboard quick-add form) ----
    $('addSemesterBtn').addEventListener('click', handleAddSemester);
    [$('semName'), $('semGpa'), $('semCredits')].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddSemester(); });
        el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });

    // ---- Add Semester button in Semesters tab ----
    $('addSemBtn2').addEventListener('click', () => {
        navigateTo('dashboard');
        // Slight delay so navigation completes, then focus
        setTimeout(() => $('semName').focus(), 200);
    });

    // ---- Edit Modal ----
    $('closeModal').addEventListener('click',  closeModal);
    $('cancelModal').addEventListener('click', closeModal);
    $('saveEditBtn').addEventListener('click', handleSaveEdit);
    $('editModal').addEventListener('click', e => {
        if (e.target === $('editModal')) closeModal();
    });

    // ---- Dark Mode Toggle ----
    $('themeToggle').addEventListener('click', toggleTheme);

    // ---- Reset All ----
    $('resetBtn').addEventListener('click', handleReset);

    // ---- Run Prediction ----
    $('runPredictionBtn').addEventListener('click', renderPrediction);

    // ---- Export PDF ----
    $('exportPdfBtn').addEventListener('click', exportReport);
}

// ── 7. NAVIGATION ──────────────────────────────────────────────

/** Switch visible section and update nav highlight */
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    // Show target
    const target = $(`section-${sectionId}`);
    if (target) target.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = $(`nav-${sectionId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update page title in topbar
    const titles = {
        dashboard:  'Dashboard',
        semesters:  'Semester Management',
        analytics:  'Performance Analytics',
        prediction: 'GPA Prediction Engine'
    };
    $('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    // Refresh chart if navigating to analytics
    if (sectionId === 'analytics') {
        renderCharts();
    }

    // Refresh prediction standing if navigating there
    if (sectionId === 'prediction') {
        updatePredictionStanding();
    }
}

// ── 8. PROFILE SETUP ───────────────────────────────────────────

function handleProfileSetup() {
    const name     = $('studentNameInput').value.trim();
    const credits  = parseInt($('totalCreditsInput').value, 10);
    const totalSem = parseInt($('totalSemestersInput').value, 10);
    const compSem  = parseInt($('completedSemestersInput').value, 10);

    // Reset styles
    $('studentNameInput').style.borderColor = '';
    $('totalCreditsInput').style.borderColor = '';
    $('totalSemestersInput').style.borderColor = '';
    $('completedSemestersInput').style.borderColor = '';

    if (!name) {
        $('studentNameInput').style.borderColor = 'var(--danger)';
        return;
    }
    if (!credits || credits < 30 || credits > 300) {
        $('totalCreditsInput').style.borderColor = 'var(--danger)';
        return;
    }
    if (!totalSem || totalSem < 1 || totalSem > 20) {
        $('totalSemestersInput').style.borderColor = 'var(--danger)';
        return;
    }
    if (isNaN(compSem) || compSem < 0 || compSem > totalSem) {
        $('completedSemestersInput').style.borderColor = 'var(--danger)';
        return;
    }

    appState.studentName        = name;
    appState.totalCredits       = credits;
    appState.totalSemesters     = totalSem;
    appState.completedSemesters = compSem;
    appState.profileSetup       = true;

    saveToStorage();
    renderAll();
}

// ── 9. SEMESTER CRUD ───────────────────────────────────────────

/** Validate and add a new semester from the quick-add form */
function handleAddSemester() {
    const nameEl    = $('semName');
    const gpaEl     = $('semGpa');
    const creditsEl = $('semCredits');

    const name    = nameEl.value.trim();
    const gpa     = parseFloat(gpaEl.value);
    const credits = parseInt(creditsEl.value, 10);

    // Clear previous errors
    $('formError').textContent = '';
    [nameEl, gpaEl, creditsEl].forEach(el => el.classList.remove('is-invalid'));

    // Validate
    let hasError = false;

    if (!name) {
        nameEl.classList.add('is-invalid');
        hasError = true;
    }
    if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        gpaEl.classList.add('is-invalid');
        hasError = true;
    }
    if (isNaN(credits) || credits < 1 || credits > 60) {
        creditsEl.classList.add('is-invalid');
        hasError = true;
    }

    if (hasError) {
        $('formError').textContent = 'Please fill all fields correctly. GPA: 0–4, Credits: 1–60.';
        return;
    }

    // Build semester object
    const semester = {
        id:      Date.now(),       // Unique ID
        name:    name,
        gpa:     gpa,
        credits: credits
    };

    appState.semesters.push(semester);
    saveToStorage();

    // Clear form
    nameEl.value    = '';
    gpaEl.value     = '';
    creditsEl.value = '';
    nameEl.focus();

    // Auto-increment semester name for next entry
    const nextNum = appState.semesters.length + 1;
    nameEl.placeholder = `e.g. Semester ${nextNum}`;

    renderAll();
}

/** Open edit modal for a given semester by ID */
function openEditModal(id) {
    const sem = appState.semesters.find(s => s.id === id);
    if (!sem) return;

    $('editSemId').value     = sem.id;
    $('editSemName').value   = sem.name;
    $('editSemGpa').value    = sem.gpa;
    $('editSemCredits').value = sem.credits;
    $('editFormError').textContent = '';

    $('editModal').classList.add('open');
}

/** Close edit modal */
function closeModal() {
    $('editModal').classList.remove('open');
}

/** Save edits from modal */
function handleSaveEdit() {
    const id      = parseInt($('editSemId').value, 10);
    const name    = $('editSemName').value.trim();
    const gpa     = parseFloat($('editSemGpa').value);
    const credits = parseInt($('editSemCredits').value, 10);

    $('editFormError').textContent = '';

    if (!name || isNaN(gpa) || gpa < 0 || gpa > 4 || isNaN(credits) || credits < 1) {
        $('editFormError').textContent = 'Please fill all fields correctly. GPA: 0–4.';
        return;
    }

    const idx = appState.semesters.findIndex(s => s.id === id);
    if (idx !== -1) {
        appState.semesters[idx] = { id, name, gpa, credits };
        saveToStorage();
        closeModal();
        renderAll();
    }
}

/** Delete a semester by ID (with confirmation) */
function deleteSemester(id) {
    const sem = appState.semesters.find(s => s.id === id);
    if (!sem) return;
    if (!confirm(`Delete "${sem.name}"? This cannot be undone.`)) return;

    appState.semesters = appState.semesters.filter(s => s.id !== id);
    saveToStorage();
    renderAll();
}

// ── 10. CALCULATIONS ───────────────────────────────────────────

/**
 * Calculates credit-weighted CGPA.
 * Formula: CGPA = Σ(GPA × Credits) / Σ(Credits)
 */
function calcCGPA() {
    const sems = appState.semesters;
    if (sems.length === 0) return 0;
    const totalWeighted = sems.reduce((acc, s) => acc + (s.gpa * s.credits), 0);
    const totalCredits  = sems.reduce((acc, s) => acc + s.credits, 0);
    return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}

/** Returns total credits completed across all semesters */
function calcCompletedCredits() {
    return appState.semesters.reduce((acc, s) => acc + s.credits, 0);
}

/**
 * Classify a GPA value into its academic class label and badge class.
 */
function classifyGpa(gpa) {
    if (gpa >= 3.7) return { label: 'First Class',    badge: 'badge-first', icon: '🏆', cardClass: 'class-first',  color: '#059669' };
    if (gpa >= 3.3) return { label: 'Second Upper',   badge: 'badge-upper', icon: '🥇', cardClass: 'class-upper',  color: '#2563eb' };
    if (gpa >= 3.0) return { label: 'Second Lower',   badge: 'badge-lower', icon: '🥈', cardClass: 'class-lower',  color: '#d97706' };
    if (gpa >= 2.0) return { label: 'General Pass',   badge: 'badge-pass',  icon: '✅', cardClass: 'class-pass',   color: '#64748b' };
    return             { label: 'Fail',               badge: 'badge-fail',  icon: '❌', cardClass: 'class-fail',   color: '#ef4444' };
}

/**
 * Get color for GPA cell in table
 */
function getGpaTableClass(gpa) {
    if (gpa >= 3.7) return 'gpa-first';
    if (gpa >= 3.3) return 'gpa-upper';
    if (gpa >= 3.0) return 'gpa-lower';
    if (gpa >= 2.0) return 'gpa-pass';
    return 'gpa-fail';
}

// ── 11. MASTER RENDER FUNCTION ─────────────────────────────────

/** Call after any state change — refreshes all UI panels */
function renderAll() {
    if (!appState.profileSetup) {
        // Show welcome, hide dashboard
        $('welcomeBanner').style.display = '';
        $('dashboardGrid').style.display = 'none';
    } else {
        $('welcomeBanner').style.display = 'none';
        $('dashboardGrid').style.display = '';
        $('studentNameDisplay').textContent = appState.studentName;

        renderStatCards();
        renderSemesterTable();
        renderSemesterCards();
        renderAnalyticsSummary();
        renderCgpaRing();
        renderSemesterRoadmap();
        updatePredictionStanding();
    }
}

/** Render visual semester roadmap, dividing completed from upcoming semesters */
function renderSemesterRoadmap() {
    const totalSems = appState.totalSemesters || 8;
    const compSems = appState.completedSemesters || 0;
    const recordedSems = appState.semesters;
    
    const lastCompletedIndex = Math.max(compSems, recordedSems.length);
    
    // Update progress badge
    const badge = $('roadmapProgressBadge');
    if (badge) {
        badge.textContent = `${lastCompletedIndex} of ${totalSems} Semesters (${totalSems > 0 ? Math.min(100, Math.round((lastCompletedIndex / totalSems) * 100)) : 0}% Complete)`;
    }
    
    const completedChipsDiv = $('completedChips');
    const completedSection = $('completedSemsSection');
    const roadmapDivider = $('roadmapDivider');
    const upcomingTimeline = $('upcomingTimeline');
    const upcomingSection = $('upcomingSemsSection');
    
    // 1. Render Completed Semesters Section
    if (completedChipsDiv) {
        completedChipsDiv.innerHTML = '';
        if (lastCompletedIndex > 0) {
            completedSection.style.display = '';
            roadmapDivider.style.display = '';
            
            for (let i = 1; i <= lastCompletedIndex; i++) {
                // Check if we have recorded data for this semester
                const semData = recordedSems[i - 1];
                let displayName = `Semester ${i}`;
                let detailText = 'No record';
                let hasGpa = false;
                
                if (semData) {
                    displayName = semData.name;
                    detailText = `${semData.gpa.toFixed(2)} GPA`;
                    hasGpa = true;
                }
                
                const chip = document.createElement('div');
                chip.className = 'completed-chip';
                chip.innerHTML = `
                    <span class="icon">✅</span>
                    <span class="chip-name">${escHtml(displayName)}</span>
                    <span class="chip-gpa" style="${hasGpa ? '' : 'color:var(--text-muted); font-style:italic; border-color:var(--border);'}">${detailText}</span>
                `;
                completedChipsDiv.appendChild(chip);
            }
        } else {
            completedSection.style.display = 'none';
            roadmapDivider.style.display = 'none';
        }
    }
    
    // 2. Render Upcoming Semesters Section
    if (upcomingTimeline) {
        upcomingTimeline.innerHTML = '';
        const upcomingCount = totalSems - lastCompletedIndex;
        
        if (upcomingCount > 0) {
            upcomingSection.style.display = '';
            
            for (let i = lastCompletedIndex + 1; i <= totalSems; i++) {
                const step = document.createElement('div');
                const isNext = (i === lastCompletedIndex + 1);
                step.className = `roadmap-timeline-step ${isNext ? 'active-step' : ''}`;
                
                step.innerHTML = `
                    <div class="rts-name">Semester ${i}</div>
                    <div class="rts-status">${isNext ? '🎯 Next Up' : '⏳ Pending'}</div>
                `;
                upcomingTimeline.appendChild(step);
            }
        } else {
            // All semesters completed!
            upcomingSection.style.display = 'none';
            roadmapDivider.style.display = 'none'; // hide divider if no upcoming
            
            // If everything is completed, show a congratulatory state
            const congMessage = document.createElement('div');
            congMessage.className = 'pred-empty';
            congMessage.style.padding = '20px';
            congMessage.style.width = '100%';
            congMessage.innerHTML = `
                <div style="font-size: 2.5rem; margin-bottom: 8px;">🎓</div>
                <h4 style="color:#059669; font-weight:700;">Congratulations!</h4>
                <p style="font-size:0.85rem; color:var(--text-secondary);">You have completed all semesters of your program.</p>
            `;
            upcomingTimeline.appendChild(congMessage);
            upcomingSection.style.display = '';
        }
    }
}

// ── 12. STAT CARDS RENDERING ───────────────────────────────────

function renderStatCards() {
    const cgpa        = calcCGPA();
    const completed   = calcCompletedCredits();
    const total       = appState.totalCredits;
    const remaining   = Math.max(0, total - completed);
    const pct         = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
    const sems        = appState.semesters;
    const cls         = classifyGpa(cgpa);

    // -- CGPA Card --
    $('cgpaValue').textContent = sems.length > 0 ? cgpa.toFixed(2) : '0.00';
    const badge = $('classificationBadge');
    badge.textContent = sems.length > 0 ? cls.label : 'Not Calculated';
    badge.className   = `classification-badge ${sems.length > 0 ? cls.badge : 'badge-nodata'}`;

    // -- Credits Card --
    $('completedCreditsDisplay').textContent = completed;
    $('totalCreditsDisplay').textContent     = total;
    $('remainingCreditsDisplay').textContent = remaining;
    $('creditProgressBar').style.width       = pct.toFixed(1) + '%';
    $('creditProgressPct').textContent       = pct.toFixed(0) + '%';

    // -- Semesters Count Card --
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

    // -- Status Card --
    if (sems.length > 0) {
        $('statusIconBig').textContent = cls.icon;
        $('statusText').textContent    = cls.label;

        // Trend: compare last 2 semesters
        if (sems.length >= 2) {
            const last  = sems[sems.length - 1].gpa;
            const prev  = sems[sems.length - 2].gpa;
            const diff  = (last - prev).toFixed(2);
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

// ── 13. CGPA RING CHART (Canvas) ───────────────────────────────

/**
 * Draws a small arc/ring chart on the CGPA card
 * showing progress from 0 to 4.0
 */
function renderCgpaRing() {
    const canvas = $('cgpaRing');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cgpa = calcCGPA();
    const pct  = cgpa / 4.0;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r  = 38;
    const lw = 8;
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

// ── 14. SEMESTER TABLE (Dashboard) ─────────────────────────────

function renderSemesterTable() {
    const tbody     = $('semTableBody');
    const emptyRow  = $('emptyTableRow');
    const sems      = appState.semesters;

    // Update badge
    $('semCountBadge').textContent = `${sems.length} entr${sems.length === 1 ? 'y' : 'ies'}`;

    // Remove existing data rows (keep empty-row template)
    tbody.querySelectorAll('tr:not(#emptyTableRow)').forEach(r => r.remove());

    if (sems.length === 0) {
        emptyRow.style.display = '';
        return;
    }

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

// ── 15. SEMESTER CARDS (Management Section) ─────────────────────

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

// ── 16. ANALYTICS SUMMARY ──────────────────────────────────────

function renderAnalyticsSummary() {
    const sems = appState.semesters;

    if (sems.length === 0) {
        ['bestSemName','bestSemGpa','weakSemName','weakSemGpa',
         'perfTrendText','perfTrendSub','perfCgpa','perfClass'].forEach(id => {
            const el = $(id);
            if (el) el.textContent = '--';
        });
        $('perfTrendIcon').textContent = '📊';
        return;
    }

    const best   = sems.reduce((p, c) => c.gpa > p.gpa ? c : p);
    const weak   = sems.reduce((p, c) => c.gpa < p.gpa ? c : p);
    const cgpa   = calcCGPA();
    const cls    = classifyGpa(cgpa);

    $('bestSemName').textContent  = best.name;
    $('bestSemGpa').textContent   = `GPA: ${best.gpa.toFixed(2)}`;
    $('weakSemName').textContent  = weak.name;
    $('weakSemGpa').textContent   = `GPA: ${weak.gpa.toFixed(2)}`;
    $('perfCgpa').textContent     = cgpa.toFixed(2);
    $('perfClass').textContent    = `Classification: ${cls.label}`;

    // Trend: compare last semester to first
    if (sems.length >= 2) {
        const first = sems[0].gpa;
        const last  = sems[sems.length - 1].gpa;
        if (last > first) {
            $('perfTrendIcon').textContent  = '📈';
            $('perfTrendText').textContent  = 'Improving';
            $('perfTrendSub').textContent   = `+${(last - first).toFixed(2)} since Sem 1`;
        } else if (last < first) {
            $('perfTrendIcon').textContent  = '📉';
            $('perfTrendText').textContent  = 'Declining';
            $('perfTrendSub').textContent   = `${(last - first).toFixed(2)} since Sem 1`;
        } else {
            $('perfTrendIcon').textContent  = '➡️';
            $('perfTrendText').textContent  = 'Stable';
            $('perfTrendSub').textContent   = 'No change since Sem 1';
        }
    } else {
        $('perfTrendIcon').textContent = '📊';
        $('perfTrendText').textContent = 'Only 1 semester';
        $('perfTrendSub').textContent  = 'Add more to see trend';
    }
}

// ── 17. CHARTS ─────────────────────────────────────────────────

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

    const labels = sems.map(s => s.name);
    const data   = sems.map(s => s.gpa);

    // Compute CGPA running line
    let runningSum     = 0;
    let runningCredits = 0;
    const cgpaLine = sems.map(s => {
        runningSum     += s.gpa * s.credits;
        runningCredits += s.credits;
        return parseFloat((runningSum / runningCredits).toFixed(2));
    });

    const isDark = document.documentElement.dataset.theme === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = isDark ? '#64748b' : '#94a3b8';

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
                    backgroundColor: 'rgba(37,99,235,0.1)',
                    borderWidth: 2.5,
                    pointRadius: 5,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
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
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: tickColor, font: { size: 12, family: 'Inter' }, usePointStyle: true }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#0f172a',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    min: 0, max: 4.0,
                    ticks: {
                        color: tickColor,
                        font: { size: 11 },
                        stepSize: 0.5,
                        callback: v => v.toFixed(1)
                    },
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
    const completed  = calcCompletedCredits();
    const total      = appState.totalCredits;
    const remaining  = Math.max(0, total - completed);
    const pct        = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
    const canvas     = $('creditDoughnut');

    $('doughnutPct').textContent = `${pct.toFixed(0)}%`;

    const isDark = document.documentElement.dataset.theme === 'dark';

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
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.parsed} credits`
                    }
                }
            }
        }
    });
}

// ── 18. PREDICTION ENGINE ──────────────────────────────────────

let predictionTarget = 3.70; // Default First Class

(function bindPredictionEvents() {
    document.addEventListener('DOMContentLoaded', () => {
        const btns = document.querySelectorAll('.target-cls-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                btns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');
                // Set target
                predictionTarget = parseFloat(btn.dataset.target);
                // Clear results visually when target changes
                resetPredictionUI();
            });
        });
        
        // Input change also resets UI
        const nextCreditsEl = $('predNextCredits');
        if (nextCreditsEl) {
            nextCreditsEl.addEventListener('input', resetPredictionUI);
        }
    });
})();

function resetPredictionUI() {
    $('predVerdictBanner').classList.add('hidden');
    $('pred1SemBlock').classList.add('hidden');
    $('predMultiBlock').classList.add('hidden');
    $('predEmptyState').style.display = 'block';
}

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

function renderPrediction() {
    const nextCredits = parseInt($('predNextCredits').value, 10);

    if (isNaN(nextCredits) || nextCredits < 1 || nextCredits > 60) {
        $('predNextCredits').classList.add('is-invalid');
        return;
    }
    $('predNextCredits').classList.remove('is-invalid');

    const cgpa        = calcCGPA();
    const completed   = calcCompletedCredits();
    
    $('predEmptyState').style.display = 'none';

    if (appState.semesters.length === 0) {
        alert("Please add at least one semester before running a prediction.");
        resetPredictionUI();
        return;
    }

    // Hide all blocks initially
    const banner = $('predVerdictBanner');
    const b1sem  = $('pred1SemBlock');
    const bMulti = $('predMultiBlock');
    
    banner.classList.add('hidden');
    b1sem.classList.add('hidden');
    bMulti.classList.add('hidden');

    const targetCGPA = predictionTarget;
    const activeBtn  = document.querySelector('.target-cls-btn.active');
    const targetName = activeBtn ? activeBtn.dataset.label : "Target Class";

    // Dynamic semester offset logic
    const startSemOffset = Math.max(appState.completedSemesters || 0, appState.semesters.length);
    const remainingSemestersInProgram = Math.max(0, (appState.totalSemesters || 8) - startSemOffset);

    if (remainingSemestersInProgram === 0) {
        banner.className = 'pred-verdict-banner verdict-done';
        $('verdictIcon').textContent = '🎓';
        $('verdictTitle').textContent = 'Program Completed';
        $('verdictSub').textContent = `No upcoming semesters remaining in your program.`;
        $('verdictGpaPill').textContent = `Finished`;
        banner.classList.remove('hidden');
        return;
    }

    // Calculate needed for 1 semester
    // needed = (target * (completed + nextCredits) - cgpa * completed) / nextCredits
    const needed1Sem = (targetCGPA * (completed + nextCredits) - cgpa * completed) / nextCredits;

    // Even if cgpa >= targetCGPA, we just show the 1-semester block to maintain standing!
    if (needed1Sem <= 4.00 && remainingSemestersInProgram >= 1) {
        let requiredGpa = Math.max(0, needed1Sem); // Can't be negative
        
        // Show 1 semester block
        banner.className = 'pred-verdict-banner verdict-can';
        $('verdictIcon').textContent = (cgpa >= targetCGPA) ? '🛡️' : '🚀';
        $('verdictTitle').textContent = (cgpa >= targetCGPA) ? 'Maintain Your Standing' : 'Highly Achievable';
        $('verdictSub').textContent = (cgpa >= targetCGPA) 
            ? `You are currently above ${targetName}.` 
            : `You can reach ${targetName} next semester!`;
            
        $('verdictGpaPill').textContent = `Need ${requiredGpa.toFixed(2)}`;
        
        b1sem.classList.remove('hidden');
        $('pred1SemTitle').textContent = `Semester ${startSemOffset + 1} Goal`;
        $('pred1SemSub').textContent = `Based on taking ${nextCredits} credits`;
        
        const gpaBox = $('pred1SemBox');
        gpaBox.className = 'pred-gpa-required-box box-achievable';
        $('pred1SemGpa').textContent = requiredGpa.toFixed(2);
        $('pred1SemNote').textContent = (cgpa >= targetCGPA)
            ? `Score at least this GPA in Semester ${startSemOffset + 1} to stay in ${targetName}.`
            : `Score this GPA in Semester ${startSemOffset + 1} to hit ${targetCGPA.toFixed(2)} CGPA.`;
            
        banner.classList.remove('hidden');
    } else {
        // Multi-semester projection
        banner.className = 'pred-verdict-banner verdict-cannot';
        $('verdictIcon').textContent = '📈';
        $('verdictTitle').textContent = 'Long-term Goal';
        $('verdictSub').textContent = `Cannot be reached in just one semester.`;
        $('verdictGpaPill').textContent = `Multi-Sem Plan`;
        
        bMulti.classList.remove('hidden');
        
        let roadmapHTML = '';
        let targetSems = 0;
        let balancedGPA = 0;
        
        // Find the fastest path (minimum semesters needed) within remaining program semesters
        for (let sems = 2; sems <= remainingSemestersInProgram; sems++) {
            let totalFutureCredits = sems * nextCredits;
            let neededAverage = (targetCGPA * (completed + totalFutureCredits) - cgpa * completed) / totalFutureCredits;
            
            if (neededAverage <= 4.00) {
                targetSems = sems;
                balancedGPA = Math.max(0, neededAverage);
                break;
            }
        }
        
        const rmapDiv = $('predRoadmap');
        
        if (targetSems > 0) {
            $('predMultiSub').textContent = `Balanced Plan: Average ${balancedGPA.toFixed(2)} GPA over the next ${targetSems} semesters to reach ${targetName}.`;
            
            // Generate step-by-step balanced roadmap
            roadmapHTML += `
                <div class="roadmap-step step-past">
                    <div class="rs-number">!</div>
                    <div class="rs-info">
                        <div class="rs-sem-name">Current Standing</div>
                        <div class="rs-sem-note">${completed} credits completed</div>
                    </div>
                    <div class="rs-gpa-tag">${cgpa.toFixed(2)} CGPA</div>
                </div>
            `;
            
            let simCGPA = cgpa;
            let simCompleted = completed;
            
            for (let i = 1; i <= targetSems; i++) {
                simCompleted += nextCredits;
                simCGPA = (simCGPA * (simCompleted - nextCredits) + balancedGPA * nextCredits) / simCompleted;
                
                const isLast = (i === targetSems);
                // Ensure the final step visually shows exactly the target to avoid tiny float rounding issues
                const displayCGPA = isLast ? Math.max(targetCGPA, simCGPA) : simCGPA;
                
                const semNumber = startSemOffset + i;
                
                roadmapHTML += `
                    <div class="roadmap-step ${isLast ? 'step-achieved' : 'step-next'}">
                        <div class="rs-number">${semNumber}</div>
                        <div class="rs-info">
                            <div class="rs-sem-name">Semester ${semNumber}</div>
                            <div class="rs-sem-note">Score ${balancedGPA.toFixed(2)} (${nextCredits} cr.)</div>
                        </div>
                        <div class="rs-gpa-tag">CGPA ${displayCGPA.toFixed(2)}</div>
                    </div>
                `;
            }
            
            $('predRoadmapNote').innerHTML = `💡 <strong>Analysis:</strong> By balancing your effort to hit exactly <strong>${balancedGPA.toFixed(2)}</strong> each semester, your CGPA will steadily climb to your goal.`;
        } else {
            $('predMultiSub').textContent = `Mathematical Limit Reached`;
            if (remainingSemestersInProgram < 2) {
                roadmapHTML = `
                    <div class="pred-empty" style="text-align:center; padding: 20px; border-radius:8px; border:1px solid var(--border);">
                        <div style="font-size: 2.5rem; margin-bottom:10px;">📉</div>
                        <p style="color:var(--danger); font-weight:600;">Not enough semesters remaining.</p>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:5px;">
                            You only have ${remainingSemestersInProgram} semester remaining, but you need multiple semesters at a higher GPA to reach ${targetCGPA.toFixed(2)}.
                        </p>
                    </div>
                `;
            } else {
                roadmapHTML = `
                    <div class="pred-empty" style="text-align:center; padding: 20px; border-radius:8px; border:1px solid var(--border);">
                        <div style="font-size: 2.5rem; margin-bottom:10px;">📉</div>
                        <p style="color:var(--danger); font-weight:600;">Mathematically impossible.</p>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:5px;">
                            Even with perfect 4.00 GPAs for the next ${remainingSemestersInProgram} remaining semesters (${remainingSemestersInProgram * nextCredits} credits), 
                            you cannot pull your CGPA up to ${targetCGPA.toFixed(2)}.
                        </p>
                    </div>
                `;
            }
            $('predRoadmapNote').textContent = "💡 Tip: Focus on the next immediate classification level instead of this one.";
        }
        rmapDiv.innerHTML = roadmapHTML;
        banner.classList.remove('hidden');
    }
}

// ── 19. THEME TOGGLE ───────────────────────────────────────────

function toggleTheme() {
    const html    = document.documentElement;
    const current = html.dataset.theme;
    html.dataset.theme = current === 'dark' ? 'light' : 'dark';

    // Persist theme choice
    localStorage.setItem('smartGpa_theme', html.dataset.theme);

    // Redraw charts with new colors
    renderCharts();
    renderCgpaRing();
}

// Load saved theme on startup
(function loadTheme() {
    const saved = localStorage.getItem('smartGpa_theme');
    if (saved) document.documentElement.dataset.theme = saved;
})();

// ── 20. RESET ──────────────────────────────────────────────────

function handleReset() {
    if (!confirm('⚠️ Reset ALL data? This will permanently erase your academic record.')) return;
    localStorage.removeItem('smartGpa_v2');
    appState = { studentName: '', totalCredits: 0, totalSemesters: 8, completedSemesters: 0, semesters: [], profileSetup: false };

    // Clear charts
    if (gpaLineChart)   { gpaLineChart.destroy();   gpaLineChart   = null; }
    if (creditDoughnut) { creditDoughnut.destroy(); creditDoughnut = null; }

    // Reset profile form
    $('studentNameInput').value   = '';
    $('totalCreditsInput').value  = '';
    $('totalSemestersInput').value = '8';
    $('completedSemestersInput').value = '0';
    $('studentNameDisplay').textContent = 'My Academic Record';

    renderAll();
    navigateTo('dashboard');
}

// ── 21. PDF EXPORT ─────────────────────────────────────────────

/**
 * Generates a simple printable CGPA report using window.print().
 * Opens a new tab with a formatted HTML report.
 */
function exportReport() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    const total     = appState.totalCredits;
    const remaining = Math.max(0, total - completed);
    const cls       = classifyGpa(cgpa);
    const sems      = appState.semesters;
    const date      = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

    let tableRows = sems.map((s, i) => {
        const c = classifyGpa(s.gpa);
        return `<tr>
            <td>${i + 1}</td>
            <td>${escHtml(s.name)}</td>
            <td><strong>${s.gpa.toFixed(2)}</strong></td>
            <td>${s.credits}</td>
            <td>${c.label}</td>
        </tr>`;
    }).join('');

    if (!tableRows) tableRows = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No semester data</td></tr>';

    const html = `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>CGPA Report – ${escHtml(appState.studentName)}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #0f172a; }
        h1   { color: #2563eb; font-size: 1.8rem; margin-bottom: 4px; }
        .sub { color: #64748b; font-size: 0.9rem; margin-bottom: 28px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .box { background: #f0f4ff; border-radius: 10px; padding: 16px; text-align: center; }
        .box .val { display: block; font-size: 1.8rem; font-weight: 800; color: #2563eb; }
        .box .lbl { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { background: #f0f4ff; padding: 10px 14px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
        td { padding: 11px 14px; border-bottom: 1px solid #e2e8f0; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; background: #dbeafe; color: #2563eb; }
        .footer { margin-top: 28px; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        @media print { body { margin: 0; } }
    </style>
    </head><body>
    <h1>🎓 CGPA Academic Report</h1>
    <div class="sub">
        Student: <strong>${escHtml(appState.studentName)}</strong> &nbsp;|&nbsp; Generated: ${date}
    </div>
    <div class="summary">
        <div class="box"><span class="val">${sems.length > 0 ? cgpa.toFixed(2) : '--'}</span><span class="lbl">Current CGPA</span></div>
        <div class="box"><span class="val">${cls.label}</span><span class="lbl">Classification</span></div>
        <div class="box"><span class="val">${completed}</span><span class="lbl">Credits Done</span></div>
        <div class="box"><span class="val">${remaining}</span><span class="lbl">Credits Left</span></div>
    </div>
    <table>
        <thead><tr><th>#</th><th>Semester</th><th>GPA</th><th>Credits</th><th>Classification</th></tr></thead>
        <tbody>${tableRows}</tbody>
    </table>
    <div class="footer">SmartGPA Academic Portal &nbsp;·&nbsp; ${date}</div>
    <script>window.onload = () => window.print();<\/script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
    } else {
        alert('Please allow pop-ups to export the PDF report.');
    }
}

// ── 22. UTILITY HELPERS ────────────────────────────────────────

/** Safely escape HTML to prevent XSS */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── 23. GLOBAL SCOPE (for inline onclick in HTML) ──────────────
// These need to be accessible from HTML onclick attributes
window.openEditModal  = openEditModal;
window.deleteSemester = deleteSemester;

// ══════════════════════════════════════════════════════════════════
// ── 24. NORMAL GPA CALCULATOR ─────────────────────────────────────
// Standalone semester GPA calculator using grade letter + credits.
// Completely independent of the CGPA tracker above.
// ══════════════════════════════════════════════════════════════════

/**
 * In-memory list of courses for the GPA Calculator tab.
 * Each entry: { id, name, gradePts, credits, gradeLabel }
 * This list is NOT persisted to localStorage (it's a scratch calculator).
 */
let calcCourses = [];

// ── 24a. Bind GPA Calculator Events ───────────────────────────────

(function bindCalcEvents() {
    // We wrap in a function so this runs after DOMContentLoaded
    // but we register it at module load time — DOMContentLoaded fires
    // before script.js finishes, so we use a deferred check.
    document.addEventListener('DOMContentLoaded', () => {
        // "Add" button
        $('calcAddCourseBtn').addEventListener('click', handleCalcAddCourse);

        // Allow Enter key on the course name & credits inputs
        $('calcCourseName').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleCalcAddCourse();
        });
        $('calcCredits').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleCalcAddCourse();
        });

        // Clear all courses
        $('clearCalcBtn').addEventListener('click', () => {
            if (calcCourses.length === 0) return;
            if (!confirm('Clear all courses from the GPA calculator?')) return;
            calcCourses = [];
            renderCalcTable();
            renderCalcResult();
        });

        // Clear invalid state on input
        $('calcCourseName').addEventListener('input', () => {
            $('calcFormError').textContent = '';
            $('calcCourseName').classList.remove('is-invalid');
        });
        $('calcCredits').addEventListener('input', () => {
            $('calcFormError').textContent = '';
            $('calcCredits').classList.remove('is-invalid');
        });

        // Add 'gpacalc' to the navigation title map (extend existing)
        // (navigateTo already handles 'gpacalc' via the titles object inside it)
    });
})();

// ── 24b. Grade label map (value → letter) ─────────────────────────

/** Returns the CSS class for the grade letter badge */
function gradeToClass(gradeLabel) {
    const map = {
        'A+': 'g-ap', 'A': 'g-a', 'A-': 'g-am',
        'B+': 'g-bp', 'B': 'g-b', 'B-': 'g-bm',
        'C+': 'g-cp', 'C': 'g-c', 'C-': 'g-cm',
        'D+': 'g-dp', 'D': 'g-d',
        'E': 'g-e', 'F': 'g-e'
    };
    return map[gradeLabel] || 'g-e';
}

// ── 24c. Add Course Handler ────────────────────────────────────────

function handleCalcAddCourse() {
    const nameEl    = $('calcCourseName');
    const gradeEl   = $('calcGrade');
    const creditsEl = $('calcCredits');
    const errEl     = $('calcFormError');

    const name     = nameEl.value.trim();
    const gradePts = parseFloat(gradeEl.value);
    const credits  = parseInt(creditsEl.value, 10);

    // Reset
    errEl.textContent = '';
    nameEl.classList.remove('is-invalid');
    creditsEl.classList.remove('is-invalid');

    let hasErr = false;

    if (!name) {
        nameEl.classList.add('is-invalid');
        hasErr = true;
    }
    if (isNaN(credits) || credits < 1 || credits > 6) {
        creditsEl.classList.add('is-invalid');
        hasErr = true;
    }

    if (hasErr) {
        errEl.textContent = 'Course name is required and credits must be between 1 and 6.';
        return;
    }

    const selectedOption = gradeEl.options[gradeEl.selectedIndex];
    const gradeLabel = selectedOption.dataset.label || selectedOption.text.split(' ')[0];

    // Push to list
    calcCourses.push({
        id:         Date.now(),
        name:       name,
        gradePts:   gradePts,
        gradeLabel: gradeLabel,
        credits:    credits
    });

    // Clear name field, reset credits to 3, keep grade selection
    nameEl.value    = '';
    creditsEl.value = 3;
    nameEl.focus();

    renderCalcTable();
    renderCalcResult();
}

// ── 24d. Remove a course from the calculator ──────────────────────

function calcDeleteCourse(id) {
    calcCourses = calcCourses.filter(c => c.id !== id);
    renderCalcTable();
    renderCalcResult();
}

// Expose to global for inline onclick
window.calcDeleteCourse = calcDeleteCourse;

// ── 24e. Render the courses table ─────────────────────────────────

function renderCalcTable() {
    const tbody    = $('calcTableBody');
    const emptyRow = $('calcEmptyRow');

    // Remove existing data rows (keep empty-row)
    tbody.querySelectorAll('tr:not(#calcEmptyRow)').forEach(r => r.remove());

    if (calcCourses.length === 0) {
        emptyRow.style.display = '';
        return;
    }

    emptyRow.style.display = 'none';

    calcCourses.forEach((c, idx) => {
        const qualityPts = (c.gradePts * c.credits).toFixed(2);
        const badgeCls   = gradeToClass(c.gradeLabel);
        const tr         = document.createElement('tr');

        tr.innerHTML = `
            <td style="color:var(--text-muted);font-weight:600;">${idx + 1}</td>
            <td style="font-weight:600;">${escHtml(c.name)}</td>
            <td><span class="grade-letter ${badgeCls}">${escHtml(c.gradeLabel)}</span></td>
            <td style="font-weight:600;color:var(--text-primary);">${c.gradePts.toFixed(2)}</td>
            <td>${c.credits} cr.</td>
            <td style="font-weight:700;color:var(--primary);">${qualityPts}</td>
            <td>
                <button class="btn-icon delete" title="Remove course"
                    onclick="calcDeleteCourse(${c.id})">🗑️</button>
            </td>`;

        tbody.appendChild(tr);
    });
}

// ── 24f. Render the live GPA result panel ─────────────────────────

function renderCalcResult() {
    const courses = calcCourses;
    const count   = courses.length;

    // Update course count badge
    $('calcCourseCount').textContent = `${count} course${count !== 1 ? 's' : ''}`;
    $('calcCoursesAdded').textContent = count;

    if (count === 0) {
        // Reset result card to default state
        $('calcGpaValue').textContent    = '0.00';
        $('calcGpaValue').style.color    = 'var(--primary)';
        $('calcTotalCredits').textContent = '0';
        $('calcTotalQP').textContent      = '0.00';
        $('calcGpaBarFill').style.width  = '0%';

        const badge = $('calcBadge');
        badge.textContent = '--';
        badge.className   = 'classification-badge badge-nodata';
        return;
    }

    // ── Calculation ──
    // GPA = Σ(grade_points × credits) / Σ(credits)
    const totalCredits  = courses.reduce((acc, c) => acc + c.credits, 0);
    const totalQP       = courses.reduce((acc, c) => acc + (c.gradePts * c.credits), 0);
    const gpa           = totalCredits > 0 ? totalQP / totalCredits : 0;

    // Get classification
    const cls = classifyGpa(gpa);

    // ── Update DOM ──
    const gpaEl = $('calcGpaValue');

    // Animate the number change with a brief scale pop
    gpaEl.style.transform  = 'scale(0.85)';
    gpaEl.style.transition = 'transform 0.15s ease';

    setTimeout(() => {
        gpaEl.textContent          = gpa.toFixed(2);
        gpaEl.style.color          = cls.color;
        gpaEl.style.transform      = 'scale(1)';
        gpaEl.style.transition     = 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), color 0.3s ease';
    }, 100);

    $('calcTotalCredits').textContent = totalCredits;
    $('calcTotalQP').textContent      = totalQP.toFixed(2);

    // Progress bar: scale 0–4 → 0–100%
    const pct = (gpa / 4.0) * 100;
    $('calcGpaBarFill').style.width = pct.toFixed(1) + '%';

    // Classification badge
    const badge = $('calcBadge');
    badge.textContent = `${cls.icon}  ${cls.label}`;
    badge.className   = `classification-badge ${cls.badge}`;
}

// ── 24g. Patch navigateTo to include 'gpacalc' title ──────────────

// We patch the titles object by wrapping navigateTo after it's defined.
// Since navigateTo uses a local `titles` object, we override it cleanly
// by re-registering the section title via a data attribute approach.
// The simplest fix: update the page title manually when navigating to gpacalc.

const _origNavigateTo = navigateTo;

// Re-define navigateTo in global scope to add the gpacalc title
window.navigateTo = function(sectionId) {
    _origNavigateTo(sectionId);
    // Override page title for gpacalc since original titles map didn't include it
    if (sectionId === 'gpacalc') {
        $('pageTitle').textContent = 'GPA Calculator';
    }
    // Auto-close sidebar on navigation (useful for mobile)
    const sidebar = $('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
};

// Make nav items use the patched version
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        // Re-bind to use window.navigateTo (patched version)
        item.onclick = (e) => {
            e.preventDefault();
            window.navigateTo(item.dataset.section);
        };
    });
});
