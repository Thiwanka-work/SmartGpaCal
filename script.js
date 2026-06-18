/* ============================================================
   SmartGPA - University Academic Management System
   script.js - Complete Application Logic (Mobile-First Redesign)
   ============================================================ */

'use strict';

// ── 1. APPLICATION STATE ──────────────────────────────────────
let appState = {
    studentName:        '',
    totalCredits:       0,
    totalSemesters:     8,
    completedSemesters: 0,
    semesters:          [],
    profileSetup:       false,
    calcCourses:        []
};

// ── 2. CHART INSTANCES ─────────────────────────────────────────
let gpaLineChart   = null;
let creditDoughnut = null;

// ── 3. DOM REFERENCES ──────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── 4. INITIALIZATION ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    bindEvents();
    renderAll();
});

// ── 5. LOCALSTORAGE PERSISTENCE ────────────────────────────────

function saveToStorage() {
    localStorage.setItem('smartGpa_v2', JSON.stringify(appState));
}

function loadFromStorage() {
    const raw = localStorage.getItem('smartGpa_v2');
    if (raw) {
        try {
            appState = JSON.parse(raw);
            if (appState.totalSemesters === undefined)     appState.totalSemesters = 8;
            if (appState.completedSemesters === undefined) appState.completedSemesters = 0;
            if (!Array.isArray(appState.calcCourses))      appState.calcCourses = [];
        } catch (e) {
            console.warn('Could not parse saved data, starting fresh.');
        }
    }
}

// ── 6. EVENT BINDING ───────────────────────────────────────────

function bindEvents() {
    // ---- Desktop Sidebar Navigation ----
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });

    // ---- Mobile Bottom Navigation ----
    document.querySelectorAll('.mbn-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });

    // ---- Mobile hamburger menu toggle ----
    $('menuToggle').addEventListener('click', e => {
        e.stopPropagation();
        const sidebar = $('sidebar');
        const overlay = $('sidebarOverlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
    });

    // Close sidebar when clicking overlay
    $('sidebarOverlay').addEventListener('click', () => {
        $('sidebar').classList.remove('open');
        $('sidebarOverlay').classList.remove('visible');
    });

    // ---- Profile Setup ----
    $('setupProfileBtn').addEventListener('click', handleProfileSetup);

    [$('studentNameInput'), $('totalCreditsInput'), $('totalSemestersInput'), $('completedSemestersInput')].forEach(el => {
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleProfileSetup(); });
    });

    // ---- Add Semester (Add GPA page) ----
    $('addSemesterBtn').addEventListener('click', handleAddSemester);
    [$('semName'), $('semGpa'), $('semCredits')].forEach(el => {
        if (!el) return;
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddSemester(); });
        el.addEventListener('input', () => el.classList.remove('is-invalid'));
        // Scroll into view on focus (mobile keyboard fix)
        el.addEventListener('focus', () => {
            setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        });
    });

    // ---- Add Semester button in Semesters management tab ----
    $('addSemBtn2').addEventListener('click', () => {
        navigateTo('addgpa');
        setTimeout(() => $('semName').focus(), 200);
    });

    // ---- Edit Modal ----
    $('closeModal').addEventListener('click',  closeModal);
    $('cancelModal').addEventListener('click', closeModal);
    $('saveEditBtn').addEventListener('click', handleSaveEdit);
    $('editModal').addEventListener('click', e => {
        if (e.target === $('editModal')) closeModal();
    });

    // ---- Theme Toggles (sidebar + mobile topbar) ----
    $('themeToggle').addEventListener('click', toggleTheme);
    $('themeToggleMobile').addEventListener('click', toggleTheme);

    // ---- Reset All ----
    $('resetBtn').addEventListener('click', handleReset);

    // ---- Run Prediction ----
    $('runPredictionBtn').addEventListener('click', renderPrediction);

    // ---- Export PDF ----
    $('exportPdfBtn').addEventListener('click', exportReport);

    // ---- Prediction target buttons ----
    bindPredictionEvents();

    // ---- GPA Calculator events ----
    bindCalcEvents();
}

// ── 7. NAVIGATION ──────────────────────────────────────────────

function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // Show target section
    const target = $(`section-${sectionId}`);
    if (target) target.classList.add('active');

    // Update desktop sidebar nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = $(`nav-${sectionId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update mobile bottom nav
    document.querySelectorAll('.mbn-item').forEach(n => n.classList.remove('active'));
    const activeMbn = $(`mbn-${sectionId}`);
    if (activeMbn) activeMbn.classList.add('active');

    // Update topbar page title
    const titles = {
        dashboard:  'Dashboard',
        addgpa:     'Add GPA',
        semesters:  'Semesters',
        analytics:  'Analytics',
        prediction: 'Prediction',
        gpacalc:    'GPA Calculator'
    };
    $('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    // Close mobile sidebar
    $('sidebar').classList.remove('open');
    $('sidebarOverlay').classList.remove('visible');

    // Refresh charts if navigating to analytics
    if (sectionId === 'analytics') renderCharts();

    // Refresh prediction standing
    if (sectionId === 'prediction') updatePredictionStanding();

    // Refresh Add GPA preview
    if (sectionId === 'addgpa') renderAddGpaPreview();

    // Refresh GPA calc semester dropdown
    if (sectionId === 'gpacalc') refreshCalcSemDropdown();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 8. PROFILE SETUP ───────────────────────────────────────────

function handleProfileSetup() {
    const name     = $('studentNameInput').value.trim();
    const credits  = parseInt($('totalCreditsInput').value, 10);
    const totalSem = parseInt($('totalSemestersInput').value, 10);
    const compSem  = parseInt($('completedSemestersInput').value, 10);

    // Reset styles
    $('studentNameInput').style.borderColor        = '';
    $('totalCreditsInput').style.borderColor       = '';
    $('totalSemestersInput').style.borderColor     = '';
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

    // After setup, navigate to Add GPA for quick first entry
    setTimeout(() => navigateTo('addgpa'), 300);
}

// ── 9. SEMESTER CRUD ───────────────────────────────────────────

function handleAddSemester() {
    const nameEl    = $('semName');
    const gpaEl     = $('semGpa');
    const creditsEl = $('semCredits');
    const errEl     = $('formError');

    const name    = nameEl.value.trim();
    const gpa     = parseFloat(gpaEl.value);
    const credits = parseInt(creditsEl.value, 10);

    // Clear previous errors
    errEl.textContent = '';
    [nameEl, gpaEl, creditsEl].forEach(el => el.classList.remove('is-invalid'));

    let hasError = false;

    if (!name) { nameEl.classList.add('is-invalid'); hasError = true; }
    if (isNaN(gpa) || gpa < 0 || gpa > 4) { gpaEl.classList.add('is-invalid'); hasError = true; }
    if (isNaN(credits) || credits < 1 || credits > 60) { creditsEl.classList.add('is-invalid'); hasError = true; }

    if (hasError) {
        errEl.textContent = 'Please fill all fields correctly. GPA: 0–4, Credits: 1–60.';
        return;
    }

    const semester = {
        id:        Date.now(),
        semNumber: appState.semesters.length + 1,
        name,
        gpa,
        credits
    };

    appState.semesters.push(semester);
    saveToStorage();

    // Clear form & prep for next entry
    nameEl.value    = '';
    gpaEl.value     = '';
    creditsEl.value = '';
    nameEl.focus();

    const nextNum = appState.semesters.length + 1;
    nameEl.placeholder = `e.g. Semester ${nextNum}`;

    renderAll();

    // Show a quick success flash
    showAddSuccessFlash(semester.name, gpa);
}

function showAddSuccessFlash(name, gpa) {
    // Brief visual feedback that the semester was added
    const btn = $('addSemesterBtn');
    const origText = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg> Added!`;
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    setTimeout(() => {
        btn.innerHTML = origText;
        btn.style.background = '';
    }, 1800);
}

function openEditModal(id) {
    const sem = appState.semesters.find(s => s.id === id);
    if (!sem) return;

    $('editSemId').value      = sem.id;
    $('editSemName').value    = sem.name;
    $('editSemGpa').value     = sem.gpa;
    $('editSemCredits').value = sem.credits;
    $('editFormError').textContent = '';

    $('editModal').classList.add('open');
}

function closeModal() {
    $('editModal').classList.remove('open');
}

function handleSaveEdit() {
    const id      = parseInt($('editSemId').value, 10);
    const name    = $('editSemName').value.trim();
    const gpa     = parseFloat($('editSemGpa').value);
    const credits = parseInt($('editSemCredits').value, 10);

    $('editFormError').textContent = '';

    if (!name || isNaN(gpa) || gpa < 0 || gpa > 4 || isNaN(credits) || credits < 1 || credits > 60) {
        $('editFormError').textContent = 'Please fill all fields correctly. GPA: 0–4, Credits: 1–60.';
        return;
    }

    const idx = appState.semesters.findIndex(s => s.id === id);
    if (idx !== -1) {
        const semNumber = appState.semesters[idx].semNumber || (idx + 1);
        appState.semesters[idx] = { id, semNumber, name, gpa, credits };
        saveToStorage();
        closeModal();
        renderAll();
    }
}

function deleteSemester(id) {
    const sem = appState.semesters.find(s => s.id === id);
    if (!sem) return;
    if (!confirm(`Delete "${sem.name}"? This cannot be undone.`)) return;

    appState.semesters = appState.semesters.filter(s => s.id !== id);
    saveToStorage();
    renderAll();
}

// ── 10. CALCULATIONS ───────────────────────────────────────────

function calcCGPA() {
    const sems = appState.semesters;
    if (sems.length === 0) return 0;
    const totalWeighted = sems.reduce((acc, s) => acc + (s.gpa * s.credits), 0);
    const totalCredits  = sems.reduce((acc, s) => acc + s.credits, 0);
    return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}

function calcCompletedCredits() {
    return appState.semesters.reduce((acc, s) => acc + s.credits, 0);
}

function classifyGpa(gpa) {
    if (gpa >= 3.7) return { label: 'First Class',  badge: 'badge-first', icon: '🏆', cardClass: 'class-first', color: '#059669' };
    if (gpa >= 3.3) return { label: 'Second Upper',  badge: 'badge-upper', icon: '🥇', cardClass: 'class-upper', color: '#2563eb' };
    if (gpa >= 3.0) return { label: 'Second Lower',  badge: 'badge-lower', icon: '🥈', cardClass: 'class-lower', color: '#d97706' };
    if (gpa >= 2.0) return { label: 'General Pass',  badge: 'badge-pass',  icon: '✅', cardClass: 'class-pass',  color: '#64748b' };
    return             { label: 'Fail',              badge: 'badge-fail',  icon: '❌', cardClass: 'class-fail',  color: '#ef4444' };
}

function getGpaTableClass(gpa) {
    if (gpa >= 3.7) return 'gpa-first';
    if (gpa >= 3.3) return 'gpa-upper';
    if (gpa >= 3.0) return 'gpa-lower';
    if (gpa >= 2.0) return 'gpa-pass';
    return 'gpa-fail';
}

// ── 11. MASTER RENDER FUNCTION ─────────────────────────────────

function renderAll() {
    if (!appState.profileSetup) {
        $('welcomeBanner').style.display  = '';
        $('dashboardGrid').style.display  = 'none';
    } else {
        $('welcomeBanner').style.display  = 'none';
        $('dashboardGrid').style.display  = '';
        $('studentNameDisplay').textContent = appState.studentName;

        renderStatCards();
        renderSemesterTable();
        renderSemesterCards();
        renderAnalyticsSummary();
        renderCgpaRing();
        renderSemesterRoadmap();
        renderAddGpaPreview();
        updatePredictionStanding();
        showDashQuickCalc();
    }
}

// ── 12. ADD GPA PAGE PREVIEW ───────────────────────────────────

function renderAddGpaPreview() {
    if (!appState.profileSetup) return;

    const sems  = appState.semesters;
    const cgpa  = calcCGPA();
    const cls   = classifyGpa(cgpa);

    // Update CGPA big display
    const cgpaEl = $('addgpaCgpaValue');
    if (cgpaEl) {
        cgpaEl.textContent = sems.length > 0 ? cgpa.toFixed(2) : '0.00';
        cgpaEl.style.color = sems.length > 0 ? cls.color : 'var(--primary)';
    }

    // Badge
    const badgeEl = $('addgpaBadge');
    if (badgeEl) {
        badgeEl.textContent = sems.length > 0 ? `${cls.icon} ${cls.label}` : 'Not Calculated';
        badgeEl.className   = `classification-badge ${sems.length > 0 ? cls.badge : 'badge-nodata'}`;
    }

    // Semester count
    const countEl = $('addgpaSemCount');
    if (countEl) {
        countEl.textContent = `${sems.length} semester${sems.length !== 1 ? 's' : ''}`;
    }

    // Semester list
    const listEl = $('addgpaSemList');
    if (!listEl) return;

    if (sems.length === 0) {
        listEl.innerHTML = `
            <div class="addgpa-empty-hint">
                <span>📋</span>
                <p>Add your first semester above to see CGPA calculation</p>
            </div>`;
        return;
    }

    // Show semesters newest-first in the list
    const reversed = [...sems].reverse();
    listEl.innerHTML = reversed.map((sem, idx) => {
        const semCls = classifyGpa(sem.gpa);
        const borderColor = semCls.color;
        return `
            <div class="addgpa-sem-item" style="border-left-color:${borderColor};">
                <span class="sem-name">${escHtml(sem.name)}</span>
                <span class="sem-credits">${sem.credits} cr.</span>
                <span class="sem-gpa" style="color:${borderColor};">${sem.gpa.toFixed(2)}</span>
                <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})" style="margin-left:4px;">🗑️</button>
            </div>`;
    }).join('');
}

// ── 13. STAT CARDS RENDERING ───────────────────────────────────

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

// ── 14. CGPA RING CHART (Canvas) ───────────────────────────────

function renderCgpaRing() {
    const canvas = $('cgpaRing');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const cgpa = calcCGPA();
    const pct  = cgpa / 4.0;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r  = 38;
    const lw = 8;
    const start = -Math.PI / 2;
    const end   = start + pct * 2 * Math.PI;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = getComputedStyle(document.documentElement)
                        .getPropertyValue('--border').trim() || '#e2e8f0';
    ctx.lineWidth = lw;
    ctx.stroke();

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

// ── 15. SEMESTER TABLE (Dashboard) ─────────────────────────────

function renderSemesterTable() {
    const tbody    = $('semTableBody');
    const emptyRow = $('emptyTableRow');
    const sems     = appState.semesters;

    $('semCountBadge').textContent = `${sems.length} entr${sems.length === 1 ? 'y' : 'ies'}`;

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

// ── 16. SEMESTER CARDS (Management Section) ─────────────────────

function renderSemesterCards() {
    const grid = $('semestersGrid');
    const sems = appState.semesters;

    grid.innerHTML = '';

    if (sems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-full">
                <div class="empty-icon">📚</div>
                <h3>No Semesters Yet</h3>
                <p>Add your first semester from the <strong>Add GPA</strong> page to begin tracking.</p>
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

// ── 17. ANALYTICS SUMMARY ──────────────────────────────────────

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

    const best  = sems.reduce((p, c) => c.gpa > p.gpa ? c : p);
    const weak  = sems.reduce((p, c) => c.gpa < p.gpa ? c : p);
    const cgpa  = calcCGPA();
    const cls   = classifyGpa(cgpa);

    $('bestSemName').textContent  = best.name;
    $('bestSemGpa').textContent   = `GPA: ${best.gpa.toFixed(2)}`;
    $('weakSemName').textContent  = weak.name;
    $('weakSemGpa').textContent   = `GPA: ${weak.gpa.toFixed(2)}`;
    $('perfCgpa').textContent     = cgpa.toFixed(2);
    $('perfClass').textContent    = `Classification: ${cls.label}`;

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

// ── 18. SEMESTER ROADMAP ───────────────────────────────────────

function renderSemesterRoadmap() {
    const totalSems      = appState.totalSemesters || 8;
    const compSems       = appState.completedSemesters || 0;
    const recordedSems   = appState.semesters;
    const lastCompletedIndex = Math.max(compSems, recordedSems.length);

    const badge = $('roadmapProgressBadge');
    if (badge) {
        const pct = totalSems > 0 ? Math.min(100, Math.round((lastCompletedIndex / totalSems) * 100)) : 0;
        badge.textContent = `${lastCompletedIndex} of ${totalSems} Semesters (${pct}% Complete)`;
    }

    const completedChipsDiv  = $('completedChips');
    const completedSection   = $('completedSemsSection');
    const roadmapDivider     = $('roadmapDivider');
    const upcomingTimeline   = $('upcomingTimeline');
    const upcomingSection    = $('upcomingSemsSection');

    // Completed semesters chips
    if (completedChipsDiv) {
        completedChipsDiv.innerHTML = '';
        if (lastCompletedIndex > 0) {
            completedSection.style.display = '';
            roadmapDivider.style.display   = '';

            for (let i = 1; i <= lastCompletedIndex; i++) {
                const semData = recordedSems.find(s => s.semNumber === i) || recordedSems[i - 1];
                let displayName = `Semester ${i}`;
                let detailText  = 'No record';
                let hasGpa      = false;

                if (semData) {
                    displayName = semData.name;
                    detailText  = `${semData.gpa.toFixed(2)} GPA`;
                    hasGpa      = true;
                }

                const chip = document.createElement('div');
                chip.className = 'completed-chip';
                chip.innerHTML = `
                    <span class="icon">✅</span>
                    <span class="chip-name">${escHtml(displayName)}</span>
                    <span class="chip-gpa" style="${hasGpa ? '' : 'color:var(--text-muted);font-style:italic;border-color:var(--border);'}">${detailText}</span>`;
                completedChipsDiv.appendChild(chip);
            }
        } else {
            completedSection.style.display = 'none';
            roadmapDivider.style.display   = 'none';
        }
    }

    // Upcoming semesters timeline
    if (upcomingTimeline) {
        upcomingTimeline.innerHTML = '';
        const upcomingCount = totalSems - lastCompletedIndex;

        if (upcomingCount > 0) {
            upcomingSection.style.display = '';

            for (let i = lastCompletedIndex + 1; i <= totalSems; i++) {
                const step   = document.createElement('div');
                const isNext = (i === lastCompletedIndex + 1);
                step.className = `roadmap-timeline-step ${isNext ? 'active-step' : ''}`;
                step.innerHTML = `
                    <div class="rts-name">Semester ${i}</div>
                    <div class="rts-status">${isNext ? '🎯 Next Up' : '⏳ Pending'}</div>`;
                upcomingTimeline.appendChild(step);
            }
        } else {
            upcomingSection.style.display = 'none';
            roadmapDivider.style.display  = 'none';

            const congMessage = document.createElement('div');
            congMessage.className = 'pred-empty';
            congMessage.style.cssText = 'padding:20px; width:100%;';
            congMessage.innerHTML = `
                <div style="font-size:2.5rem;margin-bottom:8px;">🎓</div>
                <h4 style="color:#059669;font-weight:700;">Congratulations!</h4>
                <p style="font-size:0.85rem;color:var(--text-secondary);">You have completed all semesters of your program.</p>`;
            upcomingTimeline.appendChild(congMessage);
            upcomingSection.style.display = '';
        }
    }
}

// ── 19. CHARTS ─────────────────────────────────────────────────

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

    let runningSum = 0, runningCredits = 0;
    const cgpaLine = sems.map(s => {
        runningSum     += s.gpa * s.credits;
        runningCredits += s.credits;
        return parseFloat((runningSum / runningCredits).toFixed(2));
    });

    const isDark    = document.documentElement.dataset.theme === 'dark';
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
                    labels: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 12, family: 'Inter' }, usePointStyle: true, padding: 16 }
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

// ── 20. PREDICTION ENGINE ──────────────────────────────────────

let predictionTarget = 3.70;

function bindPredictionEvents() {
    const btns = document.querySelectorAll('.target-cls-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            predictionTarget = parseFloat(btn.dataset.target);
            resetPredictionUI();
        });
    });

    const nextCreditsEl = $('predNextCredits');
    if (nextCreditsEl) nextCreditsEl.addEventListener('input', resetPredictionUI);
}

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

    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();

    $('predEmptyState').style.display = 'none';

    if (appState.semesters.length === 0) {
        alert('Please add at least one semester before running a prediction.');
        resetPredictionUI();
        return;
    }

    const banner = $('predVerdictBanner');
    const b1sem  = $('pred1SemBlock');
    const bMulti = $('predMultiBlock');

    banner.classList.add('hidden');
    b1sem.classList.add('hidden');
    bMulti.classList.add('hidden');

    const targetCGPA = predictionTarget;
    const activeBtn  = document.querySelector('.target-cls-btn.active');
    const targetName = activeBtn ? activeBtn.dataset.label : 'Target Class';

    const startSemOffset             = Math.max(appState.completedSemesters || 0, appState.semesters.length);
    const remainingSemestersInProgram = Math.max(0, (appState.totalSemesters || 8) - startSemOffset);

    if (remainingSemestersInProgram === 0) {
        banner.className = 'pred-verdict-banner verdict-done';
        $('verdictIcon').textContent  = '🎓';
        $('verdictTitle').textContent = 'Program Completed';
        $('verdictSub').textContent   = 'No upcoming semesters remaining in your program.';
        $('verdictGpaPill').textContent = 'Finished';
        banner.classList.remove('hidden');
        return;
    }

    const needed1Sem = (targetCGPA * (completed + nextCredits) - cgpa * completed) / nextCredits;

    if (needed1Sem <= 4.00 && remainingSemestersInProgram >= 1) {
        const requiredGpa = Math.max(0, needed1Sem);

        banner.className = 'pred-verdict-banner verdict-can';
        $('verdictIcon').textContent  = cgpa >= targetCGPA ? '🛡️' : '🚀';
        $('verdictTitle').textContent = cgpa >= targetCGPA ? 'Maintain Your Standing' : 'Highly Achievable';
        $('verdictSub').textContent   = cgpa >= targetCGPA
            ? `You are currently above ${targetName}.`
            : `You can reach ${targetName} next semester!`;
        $('verdictGpaPill').textContent = `Need ${requiredGpa.toFixed(2)}`;

        b1sem.classList.remove('hidden');
        $('pred1SemTitle').textContent = `Semester ${startSemOffset + 1} Goal`;
        $('pred1SemSub').textContent   = `Based on taking ${nextCredits} credits`;

        const gpaBox = $('pred1SemBox');
        gpaBox.className = 'pred-gpa-required-box box-achievable';
        $('pred1SemGpa').textContent = requiredGpa.toFixed(2);
        $('pred1SemNote').textContent = cgpa >= targetCGPA
            ? `Score at least this GPA in Semester ${startSemOffset + 1} to stay in ${targetName}.`
            : `Score this GPA in Semester ${startSemOffset + 1} to hit ${targetCGPA.toFixed(2)} CGPA.`;

        banner.classList.remove('hidden');
    } else {
        banner.className = 'pred-verdict-banner verdict-cannot';
        $('verdictIcon').textContent  = '📈';
        $('verdictTitle').textContent = 'Long-term Goal';
        $('verdictSub').textContent   = 'Cannot be reached in just one semester.';
        $('verdictGpaPill').textContent = 'Multi-Sem Plan';

        bMulti.classList.remove('hidden');

        let roadmapHTML = '';
        let targetSems  = 0;
        let balancedGPA = 0;

        for (let sems = 2; sems <= remainingSemestersInProgram; sems++) {
            const totalFutureCredits = sems * nextCredits;
            const neededAverage = (targetCGPA * (completed + totalFutureCredits) - cgpa * completed) / totalFutureCredits;
            if (neededAverage <= 4.00) {
                targetSems  = sems;
                balancedGPA = Math.max(0, neededAverage);
                break;
            }
        }

        const rmapDiv = $('predRoadmap');

        if (targetSems > 0) {
            $('predMultiSub').textContent = `Balanced Plan: Average ${balancedGPA.toFixed(2)} GPA over the next ${targetSems} semesters to reach ${targetName}.`;

            roadmapHTML += `
                <div class="roadmap-step step-past">
                    <div class="rs-number">!</div>
                    <div class="rs-info">
                        <div class="rs-sem-name">Current Standing</div>
                        <div class="rs-sem-note">${completed} credits completed</div>
                    </div>
                    <div class="rs-gpa-tag">${cgpa.toFixed(2)} CGPA</div>
                </div>`;

            let simCGPA = cgpa, simCompleted = completed;

            for (let i = 1; i <= targetSems; i++) {
                simCompleted += nextCredits;
                simCGPA = (simCGPA * (simCompleted - nextCredits) + balancedGPA * nextCredits) / simCompleted;
                const isLast     = (i === targetSems);
                const displayCGPA = isLast ? Math.max(targetCGPA, simCGPA) : simCGPA;
                const semNumber  = startSemOffset + i;

                roadmapHTML += `
                    <div class="roadmap-step ${isLast ? 'step-achieved' : 'step-next'}">
                        <div class="rs-number">${semNumber}</div>
                        <div class="rs-info">
                            <div class="rs-sem-name">Semester ${semNumber}</div>
                            <div class="rs-sem-note">Score ${balancedGPA.toFixed(2)} (${nextCredits} cr.)</div>
                        </div>
                        <div class="rs-gpa-tag">CGPA ${displayCGPA.toFixed(2)}</div>
                    </div>`;
            }

            $('predRoadmapNote').innerHTML = `💡 <strong>Analysis:</strong> By balancing your effort to hit exactly <strong>${balancedGPA.toFixed(2)}</strong> each semester, your CGPA will steadily climb to your goal.`;
        } else {
            $('predMultiSub').textContent = 'Mathematical Limit Reached';
            roadmapHTML = `
                <div class="pred-empty" style="text-align:center;padding:20px;border-radius:8px;border:1px solid var(--border);">
                    <div style="font-size:2.5rem;margin-bottom:10px;">📉</div>
                    <p style="color:var(--danger);font-weight:600;">Mathematically impossible with remaining semesters.</p>
                    <p style="font-size:0.85rem;color:var(--text-secondary);margin-top:5px;">
                        Even with perfect 4.00 GPAs for all ${remainingSemestersInProgram} remaining semesters,
                        you cannot reach ${targetCGPA.toFixed(2)} CGPA.
                    </p>
                </div>`;
            $('predRoadmapNote').textContent = '💡 Tip: Focus on the next immediate classification level instead.';
        }

        rmapDiv.innerHTML = roadmapHTML;
        banner.classList.remove('hidden');
    }
}

// ── 21. THEME TOGGLE ───────────────────────────────────────────

function toggleTheme() {
    const html    = document.documentElement;
    const current = html.dataset.theme;
    html.dataset.theme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('smartGpa_theme', html.dataset.theme);
    updateThemeLabel();
    renderCharts();
    renderCgpaRing();
}

function updateThemeLabel() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const span   = document.querySelector('.theme-toggle span');
    if (span) span.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// Load saved theme on startup
(function loadTheme() {
    const saved = localStorage.getItem('smartGpa_theme');
    if (saved) document.documentElement.dataset.theme = saved;
    document.addEventListener('DOMContentLoaded', updateThemeLabel);
})();

// ── 22. RESET ──────────────────────────────────────────────────

function handleReset() {
    if (!confirm('⚠️ Reset ALL data? This will permanently erase your academic record.')) return;
    localStorage.removeItem('smartGpa_v2');
    appState = {
        studentName: '', totalCredits: 0, totalSemesters: 8,
        completedSemesters: 0, semesters: [], profileSetup: false, calcCourses: []
    };
    renderCalcTable();
    renderCalcResult();

    if (gpaLineChart)   { gpaLineChart.destroy();   gpaLineChart   = null; }
    if (creditDoughnut) { creditDoughnut.destroy(); creditDoughnut = null; }

    $('studentNameInput').value        = '';
    $('totalCreditsInput').value       = '';
    $('totalSemestersInput').value     = '8';
    $('completedSemestersInput').value = '0';
    $('studentNameDisplay').textContent = 'My Academic Record';

    renderAll();
    navigateTo('dashboard');
}

// ── 23. PDF EXPORT ─────────────────────────────────────────────

function exportReport() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    const total     = appState.totalCredits;
    const remaining = Math.max(0, total - completed);
    const cls       = classifyGpa(cgpa);
    const sems      = appState.semesters;
    const date      = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
        .footer { margin-top: 28px; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        @media print { body { margin: 0; } }
    </style>
    </head><body>
    <h1>🎓 CGPA Academic Report</h1>
    <div class="sub">Student: <strong>${escHtml(appState.studentName)}</strong> &nbsp;|&nbsp; Generated: ${date}</div>
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

// ── 24. UTILITY HELPERS ────────────────────────────────────────

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── 25. GLOBAL SCOPE (for inline onclick in HTML) ──────────────
window.openEditModal  = openEditModal;
window.deleteSemester = deleteSemester;
window.navigateTo     = navigateTo;

// ══════════════════════════════════════════════════════════════════
// ── 26. NORMAL GPA CALCULATOR ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

Object.defineProperty(window, 'calcCourses', {
    get: () => appState.calcCourses,
    set: (v) => { appState.calcCourses = v; }
});

// Active semester context for the calculator
let calcActiveSem = null; // { id, name, isNew, credits } — set when user confirms semester

// ── 26a. Bind GPA Calculator Events ──────────────────────────────

function bindCalcEvents() {
    const addBtn   = $('calcAddCourseBtn');
    const clearBtn = $('clearCalcBtn');

    if (addBtn)   addBtn.addEventListener('click', handleCalcAddCourse);
    if (clearBtn) clearBtn.addEventListener('click', handleCalcClear);

    // Semester confirm / change buttons
    const confirmBtn = $('calcConfirmSemBtn');
    const changeBtn  = $('calcChangeSemBtn');
    const doSaveBtn  = $('calcDoSaveBtn');
    if (confirmBtn) confirmBtn.addEventListener('click', handleCalcConfirmSem);
    if (changeBtn)  changeBtn.addEventListener('click',  handleCalcChangeSem);
    if (doSaveBtn)  doSaveBtn.addEventListener('click',  handleCalcDoSave);

    // Enter key support in inputs
    [$('calcCourseName'), $('calcCredits')].forEach(el => {
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') handleCalcAddCourse();
        });
    });

    // Render initial state
    refreshCalcSemDropdown();
    renderCalcTable();
    renderCalcResult();
}

// ── 26a2. Populate the semester dropdown ──────────────────────────

function refreshCalcSemDropdown() {
    const sel = $('calcSemesterSelect');
    if (!sel) return;
    const sems = appState.semesters;
    sel.innerHTML = '<option value="">— Select semester —</option>';
    sems.forEach(s => {
        const opt = document.createElement('option');
        opt.value       = s.id;
        opt.textContent = s.name;
        sel.appendChild(opt);
    });
    // Show/hide existing col hint
    const col = $('calcExistingCol');
    if (col) col.style.display = sems.length === 0 ? 'none' : '';
}

// ── 26a3. Confirm semester handler ────────────────────────────────

function handleCalcConfirmSem() {
    const sel      = $('calcSemesterSelect');
    const newName  = ($('calcNewSemName') ? $('calcNewSemName').value.trim() : '');
    const newCreds = ($('calcNewSemCreditsHint') ? parseInt($('calcNewSemCreditsHint').value, 10) : NaN);
    const errEl    = $('calcStepErr');
    errEl.textContent = '';

    const existingId = sel ? sel.value : '';

    if (!existingId && !newName) {
        errEl.textContent = '⚠️ Please select an existing semester or enter a name for a new one.';
        return;
    }

    if (existingId) {
        const sem = appState.semesters.find(s => String(s.id) === String(existingId));
        if (!sem) { errEl.textContent = '⚠️ Semester not found.'; return; }
        calcActiveSem = { id: sem.id, name: sem.name, isNew: false };
    } else {
        // Create new semester stub (will be properly saved when GPA is saved)
        calcActiveSem = { id: null, name: newName, isNew: true, credits: isNaN(newCreds) ? 0 : newCreds };
    }

    // Update UI
    const display = $('calcActiveSemDisplay');
    const nameSpan = $('calcActiveSemName');
    const banner   = $('calcStepBanner');
    const tag      = $('calcForSemTag');

    if (nameSpan) nameSpan.textContent = calcActiveSem.name;
    if (display)  display.style.display = '';
    if (banner)   banner.classList.add('confirmed');
    if (tag)      { tag.textContent = `for ${calcActiveSem.name}`; tag.style.display = ''; }

    // Show auto-save section if courses exist
    renderCalcResult();
}

// ── 26a4. Change semester handler ─────────────────────────────────

function handleCalcChangeSem() {
    calcActiveSem = null;
    const display = $('calcActiveSemDisplay');
    const banner  = $('calcStepBanner');
    const tag     = $('calcForSemTag');
    const autoSave = $('calcAutoSaveSection');
    if (display)  display.style.display = 'none';
    if (banner)   banner.classList.remove('confirmed');
    if (tag)      tag.style.display = 'none';
    if (autoSave) autoSave.style.display = 'none';
}

// ── 26a5. Do save handler ─────────────────────────────────────────

function handleCalcDoSave() {
    const msg = $('calcSaveMsg');
    if (!calcActiveSem) {
        if (msg) { msg.textContent = '⚠️ Please confirm a semester first (Step 1 above).'; msg.style.color = 'var(--danger)'; }
        return;
    }

    const courses      = calcCourses;
    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    const totalQP      = courses.reduce((acc, c) => acc + (c.gradePts * c.credits), 0);
    const gpa          = totalCredits > 0 ? totalQP / totalCredits : 0;

    if (courses.length === 0) {
        if (msg) { msg.textContent = '⚠️ Add at least one course first.'; msg.style.color = 'var(--danger)'; }
        return;
    }

    const creditsToUse = totalCredits;

    if (calcActiveSem.isNew) {
        // Create a brand-new semester
        const newSem = {
            id:        Date.now(),
            semNumber: appState.semesters.length + 1,
            name:      calcActiveSem.name,
            gpa:       parseFloat(gpa.toFixed(2)),
            credits:   creditsToUse
        };
        appState.semesters.push(newSem);
        calcActiveSem.id    = newSem.id;
        calcActiveSem.isNew = false;
    } else {
        // Update existing semester
        const sem = appState.semesters.find(s => String(s.id) === String(calcActiveSem.id));
        if (!sem) {
            if (msg) { msg.textContent = '⚠️ Semester not found.'; msg.style.color = 'var(--danger)'; }
            return;
        }
        sem.gpa     = parseFloat(gpa.toFixed(2));
        sem.credits = creditsToUse;
    }

    saveToStorage();
    renderAll();
    refreshCalcSemDropdown();

    if (msg) {
        msg.textContent = `✅ GPA ${gpa.toFixed(2)} saved to "${calcActiveSem.name}" — your CGPA has been updated!`;
        msg.style.color = 'var(--secondary)';
        setTimeout(() => { if (msg) msg.textContent = ''; }, 5000);
    }
}

// ── 26b. Grade label map ──────────────────────────────────────────

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

// ── 26c. Add Course Handler ────────────────────────────────────────

function handleCalcAddCourse() {
    const nameEl    = $('calcCourseName');
    const gradeEl   = $('calcGrade');
    const creditsEl = $('calcCredits');
    const errEl     = $('calcFormError');

    const name     = nameEl.value.trim();
    const gradePts = parseFloat(gradeEl.value);
    const credits  = parseInt(creditsEl.value, 10);

    errEl.textContent = '';
    nameEl.classList.remove('is-invalid');
    creditsEl.classList.remove('is-invalid');

    let hasErr = false;
    if (!name)                                        { nameEl.classList.add('is-invalid');    hasErr = true; }
    if (isNaN(credits) || credits < 1 || credits > 6) { creditsEl.classList.add('is-invalid'); hasErr = true; }

    if (hasErr) {
        errEl.textContent = 'Course name is required and credits must be between 1 and 6.';
        return;
    }

    const selectedOption = gradeEl.options[gradeEl.selectedIndex];
    const gradeLabel = selectedOption.dataset.label || selectedOption.text.split(' ')[0];

    appState.calcCourses.push({
        id: Date.now(),
        name,
        gradePts,
        gradeLabel,
        credits
    });
    saveToStorage();

    nameEl.value    = '';
    creditsEl.value = 3;
    nameEl.focus();

    renderCalcTable();
    renderCalcResult();
}

// ── 26d. Clear all courses ────────────────────────────────────────

function handleCalcClear() {
    if (appState.calcCourses.length === 0) return;
    if (!confirm('Clear all courses from the GPA Calculator?')) return;
    appState.calcCourses = [];
    saveToStorage();
    renderCalcTable();
    renderCalcResult();
}

// ── 26e. Remove a course ──────────────────────────────────────────

function calcDeleteCourse(id) {
    appState.calcCourses = appState.calcCourses.filter(c => c.id !== id);
    saveToStorage();
    renderCalcTable();
    renderCalcResult();
}

window.calcDeleteCourse = calcDeleteCourse;

// ── 26f. Render the courses table ─────────────────────────────────

function renderCalcTable() {
    const tbody    = $('calcTableBody');
    const emptyRow = $('calcEmptyRow');
    if (!tbody) return;

    tbody.querySelectorAll('tr:not(#calcEmptyRow)').forEach(r => r.remove());

    if (calcCourses.length === 0) {
        emptyRow.style.display = '';
        return;
    }

    emptyRow.style.display = 'none';

    calcCourses.forEach((c, idx) => {
        const badgeCls   = gradeToClass(c.gradeLabel);
        const tr         = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:var(--text-muted);font-weight:600;">${idx + 1}</td>
            <td style="font-weight:600;">${escHtml(c.name)}</td>
            <td><span class="grade-letter ${badgeCls}">${escHtml(c.gradeLabel)}</span></td>
            <td style="font-weight:600;color:var(--text-primary);">${c.gradePts.toFixed(2)}</td>
            <td>${c.credits} cr.</td>
            <td>
                <button class="btn-icon delete" title="Remove course" onclick="calcDeleteCourse(${c.id})">🗑️</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ── 26g. Render the live GPA result panel ─────────────────────────

function renderCalcResult() {
    const courses = calcCourses;
    const count   = courses.length;

    $('calcCourseCount').textContent  = `${count} course${count !== 1 ? 's' : ''}`;
    $('calcCoursesAdded').textContent = count;

    const autoSave  = $('calcAutoSaveSection');
    const nameLabel = $('calcAutoSaveSemName');

    if (count === 0) {
        $('calcGpaValue').textContent     = '0.00';
        $('calcGpaValue').style.color     = 'var(--primary)';
        $('calcTotalCredits').textContent = '0';
        $('calcGpaBarFill').style.width   = '0%';
        const badge = $('calcBadge');
        badge.textContent = '--';
        badge.className   = 'classification-badge badge-nodata';
        if (autoSave) autoSave.style.display = 'none';
        return;
    }

    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    const totalQP      = courses.reduce((acc, c) => acc + (c.gradePts * c.credits), 0);
    const gpa          = totalCredits > 0 ? totalQP / totalCredits : 0;
    const cls          = classifyGpa(gpa);
    const gpaEl        = $('calcGpaValue');

    gpaEl.style.transform  = 'scale(0.85)';
    gpaEl.style.transition = 'transform 0.15s ease';

    setTimeout(() => {
        gpaEl.textContent      = gpa.toFixed(2);
        gpaEl.style.color      = cls.color;
        gpaEl.style.transform  = 'scale(1)';
        gpaEl.style.transition = 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), color 0.3s ease';
    }, 100);

    $('calcTotalCredits').textContent = totalCredits;
    $('calcGpaBarFill').style.width   = ((gpa / 4.0) * 100).toFixed(1) + '%';

    const badge = $('calcBadge');
    badge.textContent = `${cls.icon}  ${cls.label}`;
    badge.className   = `classification-badge ${cls.badge}`;

    // Show auto-save section if a semester is confirmed
    if (autoSave) {
        if (calcActiveSem) {
            if (nameLabel) nameLabel.textContent = calcActiveSem.name;
            autoSave.style.display = 'block';
        } else {
            autoSave.style.display = 'none';
        }
    }
}

// Also show bottom quick-calc on dashboard when profile set up
function showDashQuickCalc() {
    const el = $('dashQuickCalcBottom');
    if (el) el.style.display = appState.profileSetup ? '' : 'none';
}
