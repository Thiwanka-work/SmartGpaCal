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

// ── 1b. GRADING SETTINGS STATE ────────────────────────────────
// University preset grading scales
const UNI_PRESETS = {
    sliit: {
        name: 'SLIIT (Standard 4.0)',
        maxGpa: 4.0,
        grades: [
            { grade: 'A+', points: 4.00, markMin: 80, markMax: 100 },
            { grade: 'A',  points: 4.00, markMin: 75, markMax: 79 },
            { grade: 'A-', points: 3.75, markMin: 70, markMax: 74 },
            { grade: 'B+', points: 3.50, markMin: 65, markMax: 69 },
            { grade: 'B',  points: 3.00, markMin: 60, markMax: 64 },
            { grade: 'B-', points: 2.75, markMin: 55, markMax: 59 },
            { grade: 'C+', points: 2.50, markMin: 50, markMax: 54 },
            { grade: 'C',  points: 2.00, markMin: 45, markMax: 49 },
            { grade: 'C-', points: 1.75, markMin: 40, markMax: 44 },
            { grade: 'D+', points: 1.50, markMin: 35, markMax: 39 },
            { grade: 'D',  points: 1.00, markMin: 30, markMax: 34 },
            { grade: 'E',  points: 0.00, markMin: 0,  markMax: 29 }
        ],
        classifications: [
            { label: 'First Class',   minGpa: 3.70 },
            { label: 'Second Upper',  minGpa: 3.30 },
            { label: 'Second Lower',  minGpa: 3.00 },
            { label: 'General Pass',  minGpa: 2.00 }
        ]
    },
    uom: {
        name: 'University of Moratuwa (4.2 Scale)',
        maxGpa: 4.2,
        grades: [
            { grade: 'A+', points: 4.20, markMin: 85, markMax: 100 },
            { grade: 'A',  points: 4.00, markMin: 75, markMax: 84 },
            { grade: 'A-', points: 3.70, markMin: 70, markMax: 74 },
            { grade: 'B+', points: 3.30, markMin: 65, markMax: 69 },
            { grade: 'B',  points: 3.00, markMin: 60, markMax: 64 },
            { grade: 'B-', points: 2.70, markMin: 55, markMax: 59 },
            { grade: 'C+', points: 2.30, markMin: 50, markMax: 54 },
            { grade: 'C',  points: 2.00, markMin: 45, markMax: 49 },
            { grade: 'C-', points: 1.50, markMin: 40, markMax: 44 },
            { grade: 'D',  points: 1.00, markMin: 35, markMax: 39 },
            { grade: 'F',  points: 0.00, markMin: 0,  markMax: 34 }
        ],
        classifications: [
            { label: 'First Class',   minGpa: 3.70 },
            { label: 'Second Upper',  minGpa: 3.30 },
            { label: 'Second Lower',  minGpa: 3.00 },
            { label: 'General Pass',  minGpa: 2.00 }
        ]
    },
    uoc: {
        name: 'University of Colombo / UCSC (4.0 Scale)',
        maxGpa: 4.0,
        grades: [
            { grade: 'A+', points: 4.00, markMin: 90, markMax: 100 },
            { grade: 'A',  points: 4.00, markMin: 85, markMax: 89 },
            { grade: 'A-', points: 3.70, markMin: 75, markMax: 84 },
            { grade: 'B+', points: 3.30, markMin: 70, markMax: 74 },
            { grade: 'B',  points: 3.00, markMin: 65, markMax: 69 },
            { grade: 'B-', points: 2.70, markMin: 60, markMax: 64 },
            { grade: 'C+', points: 2.30, markMin: 55, markMax: 59 },
            { grade: 'C',  points: 2.00, markMin: 50, markMax: 54 },
            { grade: 'C-', points: 1.70, markMin: 45, markMax: 49 },
            { grade: 'D+', points: 1.30, markMin: 40, markMax: 44 },
            { grade: 'D',  points: 1.00, markMin: 30, markMax: 39 },
            { grade: 'E',  points: 0.00, markMin: 0,  markMax: 29 }
        ],
        classifications: [
            { label: 'First Class',   minGpa: 3.70 },
            { label: 'Second Upper',  minGpa: 3.30 },
            { label: 'Second Lower',  minGpa: 3.00 },
            { label: 'General Pass',  minGpa: 2.00 }
        ]
    },
    usjp: {
        name: 'University of Sri Jayewardenepura (USJP)',
        maxGpa: 4.0,
        grades: [
            { grade: 'A+', points: 4.00, markMin: 85, markMax: 100 },
            { grade: 'A',  points: 4.00, markMin: 75, markMax: 84 },
            { grade: 'A-', points: 3.70, markMin: 70, markMax: 74 },
            { grade: 'B+', points: 3.30, markMin: 65, markMax: 69 },
            { grade: 'B',  points: 3.00, markMin: 60, markMax: 64 },
            { grade: 'B-', points: 2.70, markMin: 55, markMax: 59 },
            { grade: 'C+', points: 2.30, markMin: 50, markMax: 54 },
            { grade: 'C',  points: 2.00, markMin: 45, markMax: 49 },
            { grade: 'C-', points: 1.70, markMin: 40, markMax: 44 },
            { grade: 'D',  points: 1.00, markMin: 35, markMax: 39 },
            { grade: 'E',  points: 0.00, markMin: 0,  markMax: 34 }
        ],
        classifications: [
            { label: 'First Class',   minGpa: 3.70 },
            { label: 'Second Upper',  minGpa: 3.30 },
            { label: 'Second Lower',  minGpa: 3.00 },
            { label: 'General Pass',  minGpa: 2.00 }
        ]
    },
    nsbm_iit: {
        name: 'NSBM / IIT (Standard 4.0)',
        maxGpa: 4.0,
        grades: [
            { grade: 'A+', points: 4.00, markMin: 85, markMax: 100 },
            { grade: 'A',  points: 4.00, markMin: 75, markMax: 84 },
            { grade: 'A-', points: 3.70, markMin: 70, markMax: 74 },
            { grade: 'B+', points: 3.30, markMin: 65, markMax: 69 },
            { grade: 'B',  points: 3.00, markMin: 60, markMax: 64 },
            { grade: 'B-', points: 2.70, markMin: 55, markMax: 59 },
            { grade: 'C+', points: 2.30, markMin: 50, markMax: 54 },
            { grade: 'C',  points: 2.00, markMin: 45, markMax: 49 },
            { grade: 'D',  points: 1.00, markMin: 40, markMax: 44 },
            { grade: 'E',  points: 0.00, markMin: 0,  markMax: 39 }
        ],
        classifications: [
            { label: 'First Class',   minGpa: 3.70 },
            { label: 'Second Upper',  minGpa: 3.30 },
            { label: 'Second Lower',  minGpa: 3.00 },
            { label: 'General Pass',  minGpa: 2.00 }
        ]
    },
    custom: {
        name: 'Custom (User Defined)',
        maxGpa: 4.0,
        grades: [
            { grade: 'A+', points: 4.00, markMin: 90, markMax: 100 },
            { grade: 'A',  points: 4.00, markMin: 85, markMax: 89 },
            { grade: 'A-', points: 3.75, markMin: 80, markMax: 84 },
            { grade: 'B+', points: 3.50, markMin: 75, markMax: 79 },
            { grade: 'B',  points: 3.00, markMin: 70, markMax: 74 },
            { grade: 'B-', points: 2.75, markMin: 65, markMax: 69 },
            { grade: 'C+', points: 2.50, markMin: 60, markMax: 64 },
            { grade: 'C',  points: 2.00, markMin: 55, markMax: 59 },
            { grade: 'C-', points: 1.75, markMin: 50, markMax: 54 },
            { grade: 'D+', points: 1.50, markMin: 45, markMax: 49 },
            { grade: 'D',  points: 1.00, markMin: 40, markMax: 44 },
            { grade: 'E',  points: 0.00, markMin: 0,  markMax: 39 }
        ],
        classifications: [
            { label: 'First Class',   minGpa: 3.70 },
            { label: 'Second Upper',  minGpa: 3.30 },
            { label: 'Second Lower',  minGpa: 3.00 },
            { label: 'General Pass',  minGpa: 2.00 }
        ]
    }
};

// Active grading settings (loaded from localStorage or defaults to SLIIT)
let gradingSettings = {
    preset:          'sliit',
    grades:          JSON.parse(JSON.stringify(UNI_PRESETS.sliit.grades)),
    classifications: JSON.parse(JSON.stringify(UNI_PRESETS.sliit.classifications)),
    maxGpa:          4.0
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
    // Initialize semester name auto-value on first load
    setTimeout(() => updateSemNameAutoValue(), 50);
    // Populate GPA calc grade dropdown from saved grading settings
    setTimeout(() => refreshGradeDropdown(), 120);
});

// ── 4.1 LUCIDE ICONS HELPER ────────────────────────────────────
function refreshIcons() {
    if (window.lucide) {
        setTimeout(() => lucide.createIcons(), 10);
    }
}

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
    // Load grading settings
    const rawSettings = localStorage.getItem('smartGpa_gradingSettings');
    if (rawSettings) {
        try {
            const saved = JSON.parse(rawSettings);
            gradingSettings.preset          = saved.preset          || 'sliit';
            gradingSettings.grades          = saved.grades          || gradingSettings.grades;
            gradingSettings.classifications = saved.classifications || gradingSettings.classifications;
            gradingSettings.maxGpa          = saved.maxGpa          || 4.0;
        } catch (e) {
            console.warn('Could not parse grading settings, using defaults.');
        }
    }
}

function saveGradingSettings() {
    localStorage.setItem('smartGpa_gradingSettings', JSON.stringify(gradingSettings));
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
    const menuToggleBtn = $('menuToggle');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            const sidebar = $('sidebar');
            const overlay = $('sidebarOverlay');
            if (sidebar) sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('visible');
        });
    }

    // Close sidebar when clicking overlay
    const overlay = $('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            const sidebar = $('sidebar');
            if (sidebar) sidebar.classList.remove('open');
            overlay.classList.remove('visible');
        });
    }

    // ---- Profile Setup ----
    const setupProfileBtn = $('setupProfileBtn');
    if (setupProfileBtn) setupProfileBtn.addEventListener('click', handleProfileSetup);

    [$('studentNameInput'), $('totalCreditsInput'), $('totalSemestersInput'), $('completedSemestersInput')].forEach(el => {
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleProfileSetup(); });
    });

    // ---- Add Semester (Add GPA page) ----
    const addSemesterBtn = $('addSemesterBtn');
    if (addSemesterBtn) addSemesterBtn.addEventListener('click', handleAddSemester);

    [$('semName'), $('semGpa'), $('semCredits')].forEach(el => {
        if (!el) return;
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddSemester(); });
        el.addEventListener('input', () => el.classList.remove('is-invalid'));
        // Scroll into view on focus (mobile keyboard fix)
        el.addEventListener('focus', () => {
            setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        });
    });
    // When user manually types in semName, stop auto-overwriting it
    const semNameEl = $('semName');
    if (semNameEl) {
        semNameEl.addEventListener('input', () => { semNameEl.dataset.auto = 'false'; });
        // Select all on focus so user can quickly replace auto value
        semNameEl.addEventListener('focus', () => {
            if (semNameEl.dataset.auto === 'true') semNameEl.select();
        });
    }

    // ---- Skip hint toggle on GPA input ----
    const semGpaEl = $('semGpa');
    if (semGpaEl) {
        semGpaEl.addEventListener('input', () => {
            const skipHint = $('skipHintEl');
            if (skipHint) skipHint.style.display = semGpaEl.value === '' ? '' : 'none';
        });
    }

    // ---- Add Semester button in Semesters management tab ----
    const addSemBtn2 = $('addSemBtn2');
    if (addSemBtn2) {
        addSemBtn2.addEventListener('click', () => {
            navigateTo('addgpa');
            setTimeout(() => { const n = $('semName'); if(n) n.focus(); }, 200);
        });
    }

    // ---- Edit Modal ----
    const closeBtn = $('closeModal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    const cancelBtn = $('cancelModal');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    const saveEditBtn = $('saveEditBtn');
    if (saveEditBtn) saveEditBtn.addEventListener('click', handleSaveEdit);
    const editModal = $('editModal');
    if (editModal) {
        editModal.addEventListener('click', e => {
            if (e.target === editModal) closeModal();
        });
    }

    // ---- Theme Toggles (sidebar + mobile topbar) ----
    const themeToggle = $('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    const themeToggleMobile = $('themeToggleMobile');
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

    // ---- Reset All ----
    const resetBtn = $('resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', handleReset);

    // ---- Run Prediction ----
    const runPredictionBtn = $('runPredictionBtn');
    if (runPredictionBtn) runPredictionBtn.addEventListener('click', renderPrediction);

    // ---- Export PDF ----
    const exportPdfBtn = $('exportPdfBtn');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportReport);

    // ---- Prediction target buttons ----
    bindPredictionEvents();

    // ---- Skip Semester modal ----
    const skipSemBtn = $('skipSemBtn');
    if (skipSemBtn) skipSemBtn.addEventListener('click', openSkipReasonModal);
    const closeSkipModalBtn = $('closeSkipModal');
    if (closeSkipModalBtn) closeSkipModalBtn.addEventListener('click', () => { const m = $('skipReasonModal'); if (m) m.classList.remove('active'); });
    const cancelSkipModalBtn = $('cancelSkipModal');
    if (cancelSkipModalBtn) cancelSkipModalBtn.addEventListener('click', () => { const m = $('skipReasonModal'); if (m) m.classList.remove('active'); });
    const confirmSkipBtn = $('confirmSkipBtn');
    if (confirmSkipBtn) confirmSkipBtn.addEventListener('click', handleConfirmSkip);
    const skipReasonSelectEl = $('skipReasonSelect');
    if (skipReasonSelectEl) {
        skipReasonSelectEl.addEventListener('change', () => {
            const customField = $('skipCustomReasonField');
            if (customField) customField.style.display = skipReasonSelectEl.value === 'Other' ? '' : 'none';
        });
    }
    const skipReasonModalEl = $('skipReasonModal');
    if (skipReasonModalEl) skipReasonModalEl.addEventListener('click', e => { if (e.target === skipReasonModalEl) skipReasonModalEl.classList.remove('active'); });

    // ---- GPA Calculator events ----
    bindCalcEvents();

    // ---- Blog events ----
    const backToBlogBtn = $('backToBlogBtn');
    if (backToBlogBtn) backToBlogBtn.addEventListener('click', closeBlogArticle);
}

// ── 7. NAVIGATION ──────────────────────────────────────────────

function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // Show target section and re-trigger animation
    const target = $(`section-${sectionId}`);
    if (target) {
        target.classList.remove('active');
        void target.offsetWidth; // Force reflow to restart animation
        target.classList.add('active');
    }

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
        addgpa:     'CGPA Calculator',
        semesters:  'Semesters',
        analytics:  'Analytics',
        prediction: 'Prediction',
        gpacalc:    'GPA Calculator',
        blog:       'Blog & Guides',
        settings:   'Grading Settings'
    };
    $('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    // Refresh settings page if navigating to it
    if (sectionId === 'settings') renderSettingsPage();

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
    const gpaRaw  = gpaEl.value.trim();
    const gpa     = gpaRaw === '' ? null : parseFloat(gpaRaw); // null = skipped
    const credits = parseInt(creditsEl.value, 10);
    const skipped = (gpaRaw === '' || gpa === null);

    // Clear previous errors
    errEl.textContent = '';
    [nameEl, gpaEl, creditsEl].forEach(el => el.classList.remove('is-invalid'));

    let hasError = false;

    if (!name) { nameEl.classList.add('is-invalid'); hasError = true; }
    if (!skipped && (isNaN(gpa) || gpa < 0 || gpa > 4)) { gpaEl.classList.add('is-invalid'); hasError = true; }
    if (isNaN(credits) || credits < 1 || credits > 60) { creditsEl.classList.add('is-invalid'); hasError = true; }

    if (hasError) {
        errEl.textContent = 'Please fill all fields correctly. GPA: 0–4 (or leave blank to skip), Credits: 1–60.';
        return;
    }

    const semester = {
        id:          Date.now(),
        semNumber:   appState.semesters.length + 1,
        name,
        gpa:         skipped ? null : gpa,
        credits,
        skipped,
        skipReason:  ''
    };

    appState.semesters.push(semester);
    saveToStorage();

    // Clear form & prep for next entry
    nameEl.value    = '';
    gpaEl.value     = '';
    creditsEl.value = '';

    // Hide skip hint
    const skipHint = $('skipHintEl');
    if (skipHint) skipHint.style.display = 'none';

    renderAll();

    // Re-focus after render (renderAll updates semName auto-value)
    setTimeout(() => { const n = $('semName'); if(n) n.focus(); }, 50);

    // Show a quick success flash
    showAddSuccessFlash(semester.name, skipped ? null : gpa);
}

function showAddSuccessFlash(name, gpa) {
    // Brief visual feedback that the semester was added
    const btn = $('addSemesterBtn');
    const origText = btn.innerHTML;
    const label = gpa === null ? 'Skipped!' : 'Added!';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg> ${label}`;
    btn.style.background = gpa === null
        ? 'linear-gradient(135deg, #64748b, #94a3b8)'
        : 'linear-gradient(135deg, #10b981, #059669)';
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
        const prev      = appState.semesters[idx];
        const semNumber = prev.semNumber || (idx + 1);
        appState.semesters[idx] = {
            id, semNumber, name, gpa, credits,
            skipped:    prev.skipped    || false,
            skipReason: prev.skipReason || ''
        };
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

// ── 9b. SKIP SEMESTER WITH REASON ──────────────────────────────

function openSkipReasonModal() {
    const nameEl = $('semName');
    const nameVal = nameEl ? nameEl.value.trim() : '';
    const modal = $('skipReasonModal');
    if (!modal) return;

    // Pre-fill semester name display
    const semNameDisplay = $('skipModalSemName');
    if (semNameDisplay) semNameDisplay.textContent = nameVal || `Semester ${appState.semesters.length + 1}`;

    // Pre-fill credits if user entered them
    const creditsEl = $('semCredits');
    const skipCreditsInput = $('skipSemCreditsModal');
    if (skipCreditsInput && creditsEl && creditsEl.value) {
        skipCreditsInput.value = creditsEl.value;
    } else if (skipCreditsInput) {
        skipCreditsInput.value = '0';
    }

    // Reset selects
    const sel = $('skipReasonSelect');
    if (sel) sel.value = '';
    const customField = $('skipCustomReasonField');
    if (customField) customField.style.display = 'none';
    const errEl = $('skipReasonError');
    if (errEl) errEl.textContent = '';

    modal.classList.add('active');
    refreshIcons();
}

function handleConfirmSkip() {
    const sel       = $('skipReasonSelect');
    const custom    = $('skipCustomReason');
    const creditsEl = $('skipSemCreditsModal');
    const errEl     = $('skipReasonError');

    let reason = sel ? sel.value : '';
    if (reason === 'Other') reason = custom && custom.value.trim() ? custom.value.trim() : 'Other';

    if (!reason) {
        if (errEl) errEl.textContent = '⚠️ Please select a reason.';
        return;
    }

    const credits = parseInt(creditsEl ? creditsEl.value : '0', 10) || 0;

    // Get the semester name
    const nameEl  = $('semName');
    const semNameDisplay = $('skipModalSemName');
    const name = (nameEl && nameEl.value.trim()) || (semNameDisplay ? semNameDisplay.textContent : '') || `Semester ${appState.semesters.length + 1}`;

    const semester = {
        id:         Date.now(),
        semNumber:  appState.semesters.length + 1,
        name,
        gpa:        null,
        credits,
        skipped:    true,
        skipReason: reason
    };

    appState.semesters.push(semester);
    saveToStorage();

    // Close modal & clear form
    const modal = $('skipReasonModal');
    if (modal) modal.classList.remove('active');
    if (nameEl) nameEl.value = '';
    const semGpaEl = $('semGpa');
    if (semGpaEl) semGpaEl.value = '';
    const semCreditsEl = $('semCredits');
    if (semCreditsEl) semCreditsEl.value = '';
    const skipHint = $('skipHintEl');
    if (skipHint) skipHint.style.display = 'none';

    renderAll();
    setTimeout(() => { const n = $('semName'); if (n) n.focus(); }, 50);
    showAddSuccessFlash(semester.name, null);
}

// ── 10. CALCULATIONS ───────────────────────────────────────────

function calcCGPA() {
    // Only include non-skipped semesters in CGPA calculation
    const sems = appState.semesters.filter(s => !s.skipped && s.gpa !== null && s.gpa !== undefined);
    if (sems.length === 0) return 0;
    const totalWeighted = sems.reduce((acc, s) => acc + (s.gpa * s.credits), 0);
    const totalCredits  = sems.reduce((acc, s) => acc + s.credits, 0);
    return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}

function calcCompletedCredits() {
    // Include ALL semesters (including non-GPA/skipped) for credit count
    return appState.semesters.reduce((acc, s) => acc + (s.credits || 0), 0);
}

// Classification icon/badge helpers mapped by index in classifications array
const CLASS_STYLES = [
    { badge: 'badge-first', icon: '<i data-lucide="award" class="icon-bounce" style="color: #059669;"></i>', cardClass: 'class-first', color: '#059669' },
    { badge: 'badge-upper', icon: '<i data-lucide="medal" class="icon-pulse" style="color: #2563eb;"></i>', cardClass: 'class-upper', color: '#2563eb' },
    { badge: 'badge-lower', icon: '<i data-lucide="medal" style="opacity:0.8; color: #d97706;"></i>', cardClass: 'class-lower', color: '#d97706' },
    { badge: 'badge-pass',  icon: '<i data-lucide="check-circle" style="color: #64748b;"></i>', cardClass: 'class-pass',  color: '#64748b' },
    { badge: 'badge-pass',  icon: '<i data-lucide="check-circle" style="color: #94a3b8;"></i>', cardClass: 'class-pass',  color: '#94a3b8' },
    { badge: 'badge-pass',  icon: '<i data-lucide="check-circle" style="color: #94a3b8;"></i>', cardClass: 'class-pass',  color: '#94a3b8' }
];

function classifyGpa(gpa) {
    // Use active gradingSettings.classifications (sorted high→low)
    const classes = [...gradingSettings.classifications].sort((a, b) => b.minGpa - a.minGpa);
    for (let i = 0; i < classes.length; i++) {
        if (gpa >= classes[i].minGpa) {
            const style = CLASS_STYLES[i] || CLASS_STYLES[CLASS_STYLES.length - 1];
            return { label: classes[i].label, ...style };
        }
    }
    return { label: 'Fail', badge: 'badge-fail', icon: '<i data-lucide="x-circle" style="color: #ef4444;"></i>', cardClass: 'class-fail', color: '#ef4444' };
}

function getGpaTableClass(gpa) {
    const classes = [...gradingSettings.classifications].sort((a, b) => b.minGpa - a.minGpa);
    const tableClasses = ['gpa-first','gpa-upper','gpa-lower','gpa-pass'];
    for (let i = 0; i < classes.length; i++) {
        if (gpa >= classes[i].minGpa) return tableClasses[i] || 'gpa-pass';
    }
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
    refreshIcons();
    // Auto-fill next semester name
    updateSemNameAutoValue();
    // Render global upgrade hints
    renderGlobalUpgradeHints();
    // Render classification guide from active grading settings
    renderClassificationGuide();
}

function updateSemNameAutoValue() {
    const nameEl = $('semName');
    if (!nameEl) return;
    // Only auto-fill if the user hasn't typed anything custom
    const nextNum = appState.semesters.length + 1;
    const autoName = `Semester ${nextNum}`;
    // Set as value so user sees it immediately; user can still edit
    if (!nameEl.value || nameEl.dataset.auto === 'true') {
        nameEl.value = autoName;
        nameEl.dataset.auto = 'true';
    }
    nameEl.placeholder = autoName;
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
        badgeEl.innerHTML = sems.length > 0 ? `${cls.icon} <span style="margin-left:4px;">${cls.label}</span>` : 'Not Calculated';
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
                <i data-lucide="clipboard-list"></i>
                <p>Add your first semester above to see CGPA calculation</p>
            </div>`;
        return;
    }

    // Show semesters newest-first in the list
    const reversed = [...sems].reverse();
    listEl.innerHTML = reversed.map((sem, idx) => {
        const isSkipped = sem.skipped || sem.gpa === null || sem.gpa === undefined;
        if (isSkipped) {
            return `
                <div class="addgpa-sem-item sem-skipped" style="border-left-color:#7c3aed;background:rgba(124,58,237,0.04);">
                    <span class="sem-name" style="color:var(--text-primary);">${escHtml(sem.name)}</span>
                    <span style="font-size:0.75rem;font-weight:700;color:#7c3aed;background:rgba(124,58,237,0.12);padding:2px 8px;border-radius:99px;">Non-GPA ${sem.skipReason ? `· ${escHtml(sem.skipReason)}` : ''}</span>
                    <span class="sem-credits" style="color:var(--text-muted);">${sem.credits} cr.</span>
                    <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})" style="margin-left:4px;"><i data-lucide="trash-2" style="width:16px;height:16px;color:#ef4444;"></i></button>
                </div>`;
        }
        const semCls = classifyGpa(sem.gpa);
        const borderColor = semCls.color;
        return `
            <div class="addgpa-sem-item" style="border-left-color:${borderColor};">
                <span class="sem-name">${escHtml(sem.name)}</span>
                <span class="sem-credits">${sem.credits} cr.</span>
                <span class="sem-gpa" style="color:${borderColor};">${sem.gpa.toFixed(2)}</span>
                <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})" style="margin-left:4px;"><i data-lucide="trash-2" style="width:16px;height:16px;color:#ef4444;"></i></button>
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
    badge.innerHTML = sems.length > 0 ? cls.label : 'Not Calculated';
    badge.className   = `classification-badge ${sems.length > 0 ? cls.badge : 'badge-nodata'}`;

    // Credits Card
    $('completedCreditsDisplay').textContent = completed;
    $('totalCreditsDisplay').textContent     = total;
    $('remainingCreditsDisplay').textContent = remaining;
    $('creditProgressBar').style.width       = pct.toFixed(1) + '%';
    $('creditProgressPct').textContent       = pct.toFixed(0) + '%';

    // Semesters Count Card
    $('semesterCountDisplay').textContent = sems.length;
    const validSems = sems.filter(s => !s.skipped && s.gpa !== null && s.gpa !== undefined);
    if (validSems.length > 0) {
        const best   = validSems.reduce((p, c) => c.gpa > p.gpa ? c : p);
        const lowest = validSems.reduce((p, c) => c.gpa < p.gpa ? c : p);
        $('bestGpaDisplay').textContent   = best.gpa.toFixed(2);
        $('lowestGpaDisplay').textContent = lowest.gpa.toFixed(2);
    } else {
        $('bestGpaDisplay').textContent   = '--';
        $('lowestGpaDisplay').textContent = '--';
    }

    // Status Card
    if (validSems.length > 0) {
        $('statusIconBig').innerHTML = cls.icon;
        $('statusText').textContent  = cls.label;

        if (validSems.length >= 2) {
            const last = validSems[validSems.length - 1].gpa;
            const prev = validSems[validSems.length - 2].gpa;
            const diff = (last - prev).toFixed(2);
            if (last > prev) {
                $('trendArrow').innerHTML = '<i data-lucide="trending-up"></i>';
                $('trendArrow').style.color = '#10b981';
                $('trendText').textContent  = `Up ${diff} from last semester`;
            } else if (last < prev) {
                $('trendArrow').innerHTML = '<i data-lucide="trending-down"></i>';
                $('trendArrow').style.color = '#ef4444';
                $('trendText').textContent  = `Down ${Math.abs(diff)} from last semester`;
            } else {
                $('trendArrow').innerHTML = '<i data-lucide="minus"></i>';
                $('trendArrow').style.color = '#94a3b8';
                $('trendText').textContent  = 'Same as last semester';
            }
        } else {
            $('trendArrow').innerHTML = '<i data-lucide="minus"></i>';
            $('trendArrow').style.color = '#94a3b8';
            $('trendText').textContent  = 'Add more semesters to see trend';
        }
    } else {
        $('statusIconBig').innerHTML = '<i data-lucide="clipboard-list"></i>';
        $('statusText').textContent  = 'No data yet';
        $('trendArrow').innerHTML    = '<i data-lucide="minus"></i>';
        $('trendArrow').style.color  = '#94a3b8';
        $('trendText').textContent   = 'Add semesters to see trend';
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
        const cls = classifyGpa(sem.gpa !== null && sem.gpa !== undefined ? sem.gpa : 0);
        const isSkipped = sem.skipped || sem.gpa === null || sem.gpa === undefined;
        const tr  = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:var(--text-muted);font-weight:600;">${idx + 1}</td>
            <td style="font-weight:600;">${escHtml(sem.name)}</td>
            <td class="gpa-cell ${isSkipped ? '' : getGpaTableClass(sem.gpa)}">${isSkipped ? '<span style="color:#7c3aed;font-weight:700;font-size:0.82rem;">Non-GPA</span>' : sem.gpa.toFixed(2)}</td>
            <td>${sem.credits} cr.</td>
            <td>${isSkipped
                ? `<span class="classification-badge" style="background:rgba(124,58,237,0.12);color:#7c3aed;border:1px solid rgba(124,58,237,0.25);font-size:0.76rem;">${escHtml(sem.skipReason || 'Non-GPA Semester')}</span>`
                : `<span class="classification-badge ${cls.badge}">${cls.label}</span>`
            }</td>
            <td class="action-btns">
                <button class="btn-icon edit" title="Edit" onclick="openEditModal(${sem.id})"><i data-lucide="edit-2" style="width:16px;height:16px;"></i></button>
                <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})"><i data-lucide="trash-2" style="width:16px;height:16px;color:#ef4444;"></i></button>
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
                <div class="empty-icon"><i data-lucide="library" style="width: 48px; height: 48px; opacity: 0.5;"></i></div>
                <h3>No Semesters Yet</h3>
                <p>Add your first semester from the <strong>CGPA Calculator</strong> page to begin tracking.</p>
            </div>`;
        return;
    }

    sems.forEach((sem, idx) => {
        const isSkipped = sem.skipped || sem.gpa === null || sem.gpa === undefined;
        const gpaVal = isSkipped ? 0 : sem.gpa;
        const cls  = classifyGpa(gpaVal);
        const card = document.createElement('div');
        card.className = `semester-card ${isSkipped ? 'class-skip' : cls.cardClass}`;
        if (isSkipped) card.style.cssText += ';border-top:3px solid #7c3aed;';
        card.innerHTML = `
            <div class="sem-card-header">
                <div class="sem-card-name">${escHtml(sem.name)}</div>
                <div class="sem-card-actions">
                    <button class="btn-icon edit" title="Edit" onclick="openEditModal(${sem.id})"><i data-lucide="edit-2" style="width:16px;height:16px;"></i></button>
                    <button class="btn-icon delete" title="Delete" onclick="deleteSemester(${sem.id})"><i data-lucide="trash-2" style="width:16px;height:16px;color:#ef4444;"></i></button>
                </div>
            </div>
            <div class="sem-card-gpa" style="${isSkipped ? 'color:#7c3aed;font-size:1.2rem;' : ''}">${isSkipped ? 'Non-GPA' : gpaVal.toFixed(2)}</div>
            <div class="sem-card-label" style="${isSkipped ? 'color:#7c3aed;' : ''}">${isSkipped ? `<i data-lucide="bookmark-x" style="width:14px;height:14px;margin-right:4px;"></i>${escHtml(sem.skipReason || 'Non-GPA Semester')}` : `GPA — ${cls.icon} ${cls.label}`}</div>
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
    const validSems = sems.filter(s => !s.skipped && s.gpa !== null && s.gpa !== undefined);

    if (validSems.length === 0) {
        ['bestSemName','bestSemGpa','weakSemName','weakSemGpa',
         'perfTrendText','perfTrendSub','perfCgpa','perfClass'].forEach(id => {
            const el = $(id);
            if (el) el.textContent = '--';
        });
        $('perfTrendIcon').innerHTML = '<i data-lucide="bar-chart"></i>';
        return;
    }

    const best  = validSems.reduce((p, c) => c.gpa > p.gpa ? c : p);
    const weak  = validSems.reduce((p, c) => c.gpa < p.gpa ? c : p);
    const cgpa  = calcCGPA();
    const cls   = classifyGpa(cgpa);

    $('bestSemName').textContent  = best.name;
    $('bestSemGpa').textContent   = `GPA: ${best.gpa.toFixed(2)}`;
    $('weakSemName').textContent  = weak.name;
    $('weakSemGpa').textContent   = `GPA: ${weak.gpa.toFixed(2)}`;
    $('perfCgpa').textContent     = cgpa.toFixed(2);
    $('perfClass').textContent    = `Classification: ${cls.label}`;

    if (validSems.length >= 2) {
        const first = validSems[0].gpa;
        const last  = cgpa;
        if (last > first) {
            $('perfTrendIcon').innerHTML  = '<i data-lucide="trending-up"></i>';
            $('perfTrendText').textContent  = 'Improving';
            $('perfTrendSub').textContent   = `+${(last - first).toFixed(2)} since Sem 1`;
        } else if (last < first) {
            $('perfTrendIcon').innerHTML  = '<i data-lucide="trending-down"></i>';
            $('perfTrendText').textContent  = 'Declining';
            $('perfTrendSub').textContent   = `${(last - first).toFixed(2)} since Sem 1`;
        } else {
            $('perfTrendIcon').innerHTML  = '<i data-lucide="minus"></i>';
            $('perfTrendText').textContent  = 'Stable';
            $('perfTrendSub').textContent   = 'No change since Sem 1';
        }
    } else {
        $('perfTrendIcon').innerHTML = '<i data-lucide="bar-chart"></i>';
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
                    const isSkipped = semData.skipped || semData.gpa === null || semData.gpa === undefined;
                    detailText  = isSkipped ? `Non-GPA${semData.skipReason ? ' · ' + semData.skipReason : ''}` : `${semData.gpa.toFixed(2)} GPA`;
                    hasGpa      = !isSkipped;
                }

                const chip = document.createElement('div');
                chip.className = 'completed-chip';
                chip.innerHTML = `
                    <span class="icon"><i data-lucide="check-circle" style="width:18px;height:18px;color:#10b981;"></i></span>
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
                    <div class="rts-status" style="display:flex;align-items:center;">${isNext ? '<i data-lucide="target" style="width:14px;height:14px;margin-right:4px;"></i> Next Up' : '<i data-lucide="clock" style="width:14px;height:14px;margin-right:4px;"></i> Pending'}</div>`;
                upcomingTimeline.appendChild(step);
            }
        } else {
            upcomingSection.style.display = 'none';
            roadmapDivider.style.display  = 'none';

            const congMessage = document.createElement('div');
            congMessage.className = 'pred-empty';
            congMessage.style.cssText = 'padding:20px; width:100%;';
            congMessage.innerHTML = `
                <div style="margin-bottom:8px; display:flex; justify-content:center;"><i data-lucide="graduation-cap" class="icon-bounce" style="width:48px;height:48px;color:#059669;"></i></div>
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

    const validSems  = sems.filter(s => !s.skipped && s.gpa !== null && s.gpa !== undefined);

    if (validSems.length < 2) {
        canvas.style.display   = 'none';
        emptyMsg.style.display = '';
        return;
    }

    canvas.style.display   = '';
    emptyMsg.style.display = 'none';

    const labels = validSems.map(s => s.name);
    const data   = validSems.map(s => s.gpa);

    let runningSum = 0, runningCredits = 0;
    const cgpaLine = validSems.map(s => {
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

    const timeframeEl = $('predTimeframe');
    const calcModeEl = $('predCalcMode');

    if (timeframeEl) {
        timeframeEl.addEventListener('change', () => {
            handlePredictionUIChange();
            resetPredictionUI();
        });
    }

    if (calcModeEl) {
        calcModeEl.addEventListener('change', () => {
            handlePredictionUIChange();
            resetPredictionUI();
        });
    }

    // Init UI state
    setTimeout(handlePredictionUIChange, 100);
}

function handlePredictionUIChange() {
    const timeframeEl = $('predTimeframe');
    if (!timeframeEl) return;
    
    const timeframe = timeframeEl.value;
    const calcModeEl = $('predCalcModeField');
    const nextCreditsField = $('predNextCreditsField');
    const averageNote = $('predAverageNote');
    const exactInputsContainer = $('predExactInputsContainer');

    if (timeframe === 'next') {
        if (calcModeEl) calcModeEl.classList.add('hidden');
        if (nextCreditsField) nextCreditsField.classList.remove('hidden');
        if (averageNote) averageNote.classList.add('hidden');
        if (exactInputsContainer) exactInputsContainer.classList.add('hidden');
    } else {
        if (calcModeEl) calcModeEl.classList.remove('hidden');
        if (nextCreditsField) nextCreditsField.classList.add('hidden');
        
        const calcMode = $('predCalcMode').value;
        if (calcMode === 'average') {
            if (averageNote) averageNote.classList.remove('hidden');
            if (exactInputsContainer) exactInputsContainer.classList.add('hidden');
        } else {
            if (averageNote) averageNote.classList.add('hidden');
            if (exactInputsContainer) {
                exactInputsContainer.classList.remove('hidden');
                renderExactCreditInputs();
            }
        }
    }
}

function renderExactCreditInputs() {
    const container = $('predExactInputsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startSemOffset = Math.max(appState.completedSemesters || 0, appState.semesters.length);
    const totalSems = appState.totalSemesters || 8;
    const remainingSemesters = Math.max(0, totalSems - startSemOffset);

    if (remainingSemesters <= 0) {
        container.innerHTML = '<div class="pred-note" style="color: var(--text-secondary);">No upcoming semesters remaining in your program.</div>';
        return;
    }

    let html = '<h4 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-primary);">Enter Exact Credits Per Semester</h4>';
    for (let i = 1; i <= remainingSemesters; i++) {
        const semNum = startSemOffset + i;
        html += `
            <div class="form-field" style="margin-bottom: 10px;">
                <label for="predExactCr_${semNum}">Credits for Semester ${semNum}</label>
                <input type="number" id="predExactCr_${semNum}" class="pred-exact-input" min="1" max="60" step="1" value="18">
            </div>
        `;
    }
    
    container.innerHTML = html;
    container.querySelectorAll('.pred-exact-input').forEach(input => {
        input.addEventListener('input', resetPredictionUI);
    });
}

function resetPredictionUI() {
    const banner = $('predVerdictBanner');
    const b1sem  = $('pred1SemBlock');
    const bMulti = $('predMultiBlock');
    const empty  = $('predEmptyState');
    
    if (banner) banner.classList.add('hidden');
    if (b1sem) b1sem.classList.add('hidden');
    if (bMulti) bMulti.classList.add('hidden');
    if (empty) empty.style.display = 'block';
}

function updatePredictionStanding() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    const remaining = Math.max(0, appState.totalCredits - completed);
    const cls       = classifyGpa(cgpa);

    const cgpaEl = $('predCurrentCgpa');
    if (cgpaEl) cgpaEl.textContent = appState.semesters.length > 0 ? cgpa.toFixed(2) : '--';
    
    const classEl = $('predCurrentClass');
    if (classEl) {
        classEl.textContent = appState.semesters.length > 0 ? cls.label : '--';
        classEl.style.color = appState.semesters.length > 0 ? cls.color : 'inherit';
    }
    
    const compEl = $('predCompletedCredits');
    if (compEl) compEl.textContent = completed + ' cr.';
    
    const remEl = $('predRemainingCredits');
    if (remEl) remEl.textContent = remaining > 0 ? remaining + ' cr.' : '0 cr.';
    
    if ($('predTimeframe') && $('predTimeframe').value === 'end' && $('predCalcMode') && $('predCalcMode').value === 'exact') {
        renderExactCreditInputs();
    }
}

function renderPrediction() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();

    const empty = $('predEmptyState');
    if (empty) empty.style.display = 'none';

    if (appState.semesters.length === 0) {
        alert('Please add at least one semester before running a prediction.');
        resetPredictionUI();
        return;
    }

    const banner = $('predVerdictBanner');
    const b1sem  = $('pred1SemBlock');
    const bMulti = $('predMultiBlock');

    if (banner) banner.classList.add('hidden');
    if (b1sem) b1sem.classList.add('hidden');
    if (bMulti) bMulti.classList.add('hidden');

    const targetCGPA = predictionTarget;
    const activeBtn  = document.querySelector('.target-cls-btn.active');
    const targetName = activeBtn ? activeBtn.dataset.label : 'Target Class';

    const startSemOffset             = Math.max(appState.completedSemesters || 0, appState.semesters.length);
    const remainingSemestersInProgram = Math.max(0, (appState.totalSemesters || 8) - startSemOffset);

    if (remainingSemestersInProgram === 0) {
        if (banner) {
            banner.className = 'pred-verdict-banner verdict-done';
            $('verdictIcon').innerHTML  = '<i data-lucide="graduation-cap"></i>';
            $('verdictTitle').textContent = 'Program Completed';
            $('verdictSub').textContent   = 'No upcoming semesters remaining in your program.';
            $('verdictGpaPill').textContent = 'Finished';
            banner.classList.remove('hidden');
        }
        return;
    }

    const timeframe = $('predTimeframe') ? $('predTimeframe').value : 'next';

    if (timeframe === 'next') {
        const nextCreditsEl = $('predNextCredits');
        if (!nextCreditsEl) return;
        const nextCredits = parseInt(nextCreditsEl.value, 10);

        if (isNaN(nextCredits) || nextCredits < 1 || nextCredits > 60) {
            nextCreditsEl.classList.add('is-invalid');
            return;
        }
        nextCreditsEl.classList.remove('is-invalid');

        const needed1Sem = (targetCGPA * (completed + nextCredits) - cgpa * completed) / nextCredits;

        if (needed1Sem <= 4.00) {
            const requiredGpa = Math.max(0, needed1Sem);
            if (banner) {
                banner.className = 'pred-verdict-banner verdict-can';
                $('verdictIcon').innerHTML  = cgpa >= targetCGPA ? '<i data-lucide="shield-check" class="icon-pulse"></i>' : '<i data-lucide="rocket" class="icon-bounce"></i>';
                $('verdictTitle').textContent = cgpa >= targetCGPA ? 'Maintain Your Standing' : 'Highly Achievable';
                $('verdictSub').textContent   = cgpa >= targetCGPA
                    ? `You are currently above ${targetName}.`
                    : `You can reach ${targetName} next semester!`;
                $('verdictGpaPill').textContent = `Need ${requiredGpa.toFixed(2)}`;
                banner.classList.remove('hidden');
            }

            if (b1sem) {
                b1sem.classList.remove('hidden');
                $('pred1SemTitle').textContent = `Semester ${startSemOffset + 1} Goal`;
                $('pred1SemSub').textContent   = `Based on taking ${nextCredits} credits`;

                const gpaBox = $('pred1SemBox');
                gpaBox.className = 'pred-gpa-required-box box-achievable';
                $('pred1SemGpa').textContent = requiredGpa.toFixed(2);
                $('pred1SemGpa').style.color = '';
                $('pred1SemNote').textContent = cgpa >= targetCGPA
                    ? `Score at least this GPA in Semester ${startSemOffset + 1} to stay in ${targetName}.`
                    : `Score this GPA in Semester ${startSemOffset + 1} to hit ${targetCGPA.toFixed(2)} CGPA.`;
            }
        } else {
            if (banner) {
                banner.className = 'pred-verdict-banner verdict-cannot';
                $('verdictIcon').innerHTML  = '<i data-lucide="trending-down"></i>';
                $('verdictTitle').textContent = 'Mathematically Impossible';
                $('verdictSub').textContent   = 'Cannot be reached in just one semester.';
                $('verdictGpaPill').textContent = 'Try Multi-Sem';
                banner.classList.remove('hidden');
            }
            
            if (b1sem) {
                b1sem.classList.remove('hidden');
                $('pred1SemTitle').textContent = `Semester ${startSemOffset + 1} Goal`;
                $('pred1SemSub').textContent   = `Based on taking ${nextCredits} credits`;

                const gpaBox = $('pred1SemBox');
                gpaBox.className = 'pred-gpa-required-box';
                $('pred1SemGpa').textContent = '> 4.00';
                $('pred1SemGpa').style.color = 'var(--danger)';
                $('pred1SemNote').textContent = `You would need a ${needed1Sem.toFixed(2)} GPA to hit this target in one semester, which exceeds 4.00. Please change timeframe to "Multiple Semesters".`;
            }
        }
    } else {
        const calcMode = $('predCalcMode') ? $('predCalcMode').value : 'average';
        let totalFutureCredits = 0;
        let semesterWeights = [];
        
        if (calcMode === 'average') {
            const profileTotal = appState.totalCredits || 120;
            totalFutureCredits = Math.max(0, profileTotal - completed);
            
            if (totalFutureCredits <= 0) {
                if (banner) {
                    banner.className = 'pred-verdict-banner verdict-done';
                    if ($('verdictIcon')) $('verdictIcon').innerHTML  = '<i data-lucide="graduation-cap"></i>';
                    if ($('verdictTitle')) $('verdictTitle').textContent = 'Program Completed';
                    if ($('verdictSub')) $('verdictSub').textContent   = 'You have completed all required credits.';
                    if ($('verdictGpaPill')) $('verdictGpaPill').textContent = 'Finished';
                    banner.classList.remove('hidden');
                }
                return;
            }

            const creditsPerSem = totalFutureCredits / remainingSemestersInProgram;
            for (let i = 1; i <= remainingSemestersInProgram; i++) {
                semesterWeights.push({ semNum: startSemOffset + i, credits: creditsPerSem });
            }
        } else {
            let hasError = false;
            for (let i = 1; i <= remainingSemestersInProgram; i++) {
                const semNum = startSemOffset + i;
                const inputEl = $(`predExactCr_${semNum}`);
                if (!inputEl) continue;
                
                const cr = parseInt(inputEl.value, 10);
                if (isNaN(cr) || cr < 1 || cr > 60) {
                    inputEl.classList.add('is-invalid');
                    hasError = true;
                } else {
                    inputEl.classList.remove('is-invalid');
                    semesterWeights.push({ semNum, credits: cr });
                    totalFutureCredits += cr;
                }
            }
            if (hasError) return;
        }

        if (totalFutureCredits <= 0) return;

        const neededAverage = (targetCGPA * (completed + totalFutureCredits) - cgpa * completed) / totalFutureCredits;
        
        if (banner) {
            banner.className = neededAverage <= 4.00 ? 'pred-verdict-banner verdict-can' : 'pred-verdict-banner verdict-cannot';
            $('verdictIcon').innerHTML  = neededAverage <= 4.00 ? '<i data-lucide="trending-up"></i>' : '<i data-lucide="trending-down"></i>';
            $('verdictTitle').textContent = neededAverage <= 4.00 ? 'Long-term Goal' : 'Mathematical Limit Reached';
            $('verdictSub').textContent   = neededAverage <= 4.00 ? 'Achievable over your remaining program.' : 'Cannot be reached before graduation.';
            $('verdictGpaPill').textContent = neededAverage <= 4.00 ? 'Multi-Sem Plan' : 'Impossible';
            banner.classList.remove('hidden');
        }
        
        if (bMulti) {
            bMulti.classList.remove('hidden');
            $('predMultiTitle').textContent = 'Semester-by-Semester Target';

            const semCardsGrid = $('predSemCardsGrid');
            const progressBanner = $('predProgressBanner');

            if (neededAverage <= 4.00) {
                const balancedGPA = Math.max(0, neededAverage);
                $('predMultiSub').textContent = `You need an average of ${balancedGPA.toFixed(2)} GPA across your remaining ${remainingSemestersInProgram} semester${remainingSemestersInProgram !== 1 ? 's' : ''} to reach ${targetName}.`;

                // Show CGPA progress bar
                if (progressBanner) {
                    progressBanner.classList.remove('hidden');
                    const ppbCurrent = $('ppbCurrentVal');
                    const ppbTarget  = $('ppbTargetVal');
                    const ppbFill    = $('ppbFill');
                    if (ppbCurrent) ppbCurrent.textContent = cgpa.toFixed(2);
                    if (ppbTarget)  ppbTarget.textContent  = targetCGPA.toFixed(2);
                    if (ppbFill) {
                        const pct = Math.min(100, (cgpa / 4.0) * 100);
                        setTimeout(() => { ppbFill.style.width = pct.toFixed(1) + '%'; }, 100);
                    }
                }

                // Generate per-semester cards
                let cardsHTML = '';

                // Show current standing card
                cardsHTML += `
                    <div class="pred-sem-card card-past">
                        <div class="psc-num">✓</div>
                        <div class="psc-info">
                            <div class="psc-name">Current Standing</div>
                            <div class="psc-note">${completed} credits completed</div>
                        </div>
                        <div class="psc-gpa">
                            <div class="psc-gpa-val">${cgpa.toFixed(2)}</div>
                            <div class="psc-gpa-label">CGPA Now</div>
                        </div>
                    </div>`;

                let simCGPA = cgpa, simCompleted = completed;

                semesterWeights.forEach((sw, idx) => {
                    simCompleted += sw.credits;
                    simCGPA = (simCGPA * (simCompleted - sw.credits) + balancedGPA * sw.credits) / simCompleted;
                    const isLast = (idx === semesterWeights.length - 1);

                    // Check if this semester's actual GPA meets/exceeds target
                    const actualSem = appState.semesters.find(s => s.semNumber === sw.semNum);
                    const actualGpa = actualSem && !actualSem.skipped ? actualSem.gpa : null;
                    const isAchieved = actualGpa !== null && actualGpa >= balancedGPA;

                    // Determine difficulty class
                    let diffClass = 'card-easy';
                    if (balancedGPA >= 3.7) diffClass = 'card-hard';
                    else if (balancedGPA >= 3.2) diffClass = 'card-moderate';

                    if (isAchieved) diffClass = 'card-achieved';

                    const achievedBadge = isAchieved
                        ? `<div class="psc-achieved-badge"><i data-lucide="check-circle" class="icon-pulse" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Target Achieved!</div>`
                        : '';

                    const gpaLabel = isAchieved ? 'Achieved ✔' : (isLast ? 'Final Goal' : 'Target GPA');
                    const gpaVal   = isAchieved ? actualGpa.toFixed(2) : balancedGPA.toFixed(2);

                    cardsHTML += `
                        <div class="pred-sem-card ${diffClass}">
                            <div class="psc-num">${sw.semNum}</div>
                            <div class="psc-info">
                                <div class="psc-name">Semester ${sw.semNum}</div>
                                <div class="psc-note">${sw.credits.toFixed(0)} credits · CGPA after: ${simCGPA.toFixed(2)}</div>
                            </div>
                            ${achievedBadge}
                            <div class="psc-gpa">
                                <div class="psc-gpa-val">${gpaVal}</div>
                                <div class="psc-gpa-label">${gpaLabel}</div>
                            </div>
                        </div>`;
                });

                if (semCardsGrid) semCardsGrid.innerHTML = cardsHTML;

                // Difficulty legend
                let difficultyText = '';
                if (balancedGPA < 3.2) difficultyText = "🟢 Target is <strong>manageable</strong> — keep up your current pace!";
                else if (balancedGPA < 3.7) difficultyText = "🟡 Target is <strong>moderate</strong> — you'll need to push harder each semester.";
                else difficultyText = "🔴 Target is <strong>very challenging</strong> — near-perfect GPAs required every semester.";

                $('predRoadmapNote').innerHTML = `<i data-lucide="lightbulb" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> <strong>Analysis:</strong> ${difficultyText} Cards turn <strong>green <i data-lucide="check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--success);"></i></strong> when you hit the target in a recorded semester.`;
            } else {
                $('predMultiSub').textContent = 'Mathematically impossible with remaining credits.';
                if (progressBanner) progressBanner.classList.add('hidden');

                const cardsHTMLImpossible = `
                    <div class="pred-empty" style="text-align:center;padding:24px;border-radius:8px;border:1px solid var(--border);">
                        <div style="display:flex;justify-content:center;margin-bottom:10px;"><i data-lucide="trending-down" style="width:48px;height:48px;color:#ef4444;"></i></div>
                        <p style="color:var(--danger);font-weight:600;">Mathematically impossible.</p>
                        <p style="font-size:0.85rem;color:var(--text-secondary);margin-top:5px;">
                            Even with perfect 4.00 GPAs for your remaining ${totalFutureCredits.toFixed(0)} credits,
                            you cannot reach ${targetCGPA.toFixed(2)} CGPA.
                        </p>
                    </div>`;

                if (semCardsGrid) semCardsGrid.innerHTML = cardsHTMLImpossible;
                $('predRoadmapNote').innerHTML = '<i data-lucide="lightbulb" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Tip: Focus on the next immediate classification level instead.';
            }
        }
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
        const isSkipped = s.skipped || s.gpa === null || s.gpa === undefined;
        let classLabel = '';
        if (isSkipped) {
            classLabel = s.skipReason ? `Skipped (${escHtml(s.skipReason)})` : 'Skipped';
        } else {
            classLabel = classifyGpa(s.gpa).label;
        }
        return `<tr>
            <td>${i + 1}</td>
            <td>${escHtml(s.name)}</td>
            <td><strong>${isSkipped ? 'Non-GPA' : s.gpa.toFixed(2)}</strong></td>
            <td>${s.credits}</td>
            <td>${classLabel}</td>
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

    const courses      = appState.calcCourses;
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
    gradeEl.selectedIndex = 0; // Reset to default grade (A+)
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

    if (appState.calcCourses.length === 0) {
        emptyRow.style.display = '';
        return;
    }

    emptyRow.style.display = 'none';

    appState.calcCourses.forEach((c, idx) => {
        const badgeCls   = gradeToClass(c.gradeLabel);
        const tr         = document.createElement('tr');
        tr.innerHTML = `
            <td style="color:var(--text-muted);font-weight:600;">${idx + 1}</td>
            <td style="font-weight:600;">${escHtml(c.name)}</td>
            <td><span class="grade-letter ${badgeCls}">${escHtml(c.gradeLabel)}</span></td>
            <td style="font-weight:600;color:var(--text-primary);">${c.gradePts.toFixed(2)}</td>
            <td>${c.credits} cr.</td>
            <td>
                <button class="btn-icon delete" title="Remove course" onclick="calcDeleteCourse(${c.id})"><i data-lucide="trash-2" style="width:16px;height:16px;color:#ef4444;"></i></button>
            </td>`;
        tbody.appendChild(tr);

        // ── GRADE UPGRADE HINT: show for grades below C (2.00) ──
        const belowCGrades = ['C-', 'D+', 'D', 'E', 'F'];
        if (belowCGrades.includes(c.gradeLabel)) {
            const hintTr = document.createElement('tr');
            hintTr.className = 'calc-grade-hint-row';

            // Calculate impact of upgrading to C (2.00)
            const courses = appState.calcCourses;
            const currentTotalQP = courses.reduce((acc, x) => acc + (x.gradePts * x.credits), 0);
            const currentTotalCr = courses.reduce((acc, x) => acc + x.credits, 0);
            const currentGPA = currentTotalCr > 0 ? currentTotalQP / currentTotalCr : 0;

            const upgradeQP = currentTotalQP - (c.gradePts * c.credits) + (2.00 * c.credits);
            const upgradedSemGPA = currentTotalCr > 0 ? upgradeQP / currentTotalCr : 0;

            // Calculate improved CGPA
            const completedSems = appState.semesters.filter(s => !s.skipped && s.gpa !== null);
            const totalPastWeighted = completedSems.reduce((acc, s) => acc + (s.gpa * s.credits), 0);
            const totalPastCr = completedSems.reduce((acc, s) => acc + s.credits, 0);
            const newCGPA = (totalPastWeighted + upgradeQP) / (totalPastCr + currentTotalCr);
            const oldCGPA = (totalPastWeighted + currentTotalQP) / (totalPastCr + currentTotalCr);

            const gpaDiff = (upgradedSemGPA - currentGPA).toFixed(2);
            const cgpaDiff = (newCGPA - oldCGPA).toFixed(2);

            hintTr.innerHTML = `<td colspan="6">
                <div class="grade-upgrade-hint">
                    <div class="guh-left">
                        <span class="guh-icon"><i data-lucide="lightbulb" class="icon-pulse" style="width:18px;height:18px;display:inline-block;vertical-align:middle;"></i></span>
                        <div class="guh-text">
                            Upgrading <strong>${escHtml(c.name)}</strong> from <strong style="color:var(--danger);">${escHtml(c.gradeLabel)}</strong> to <strong style="color:#d97706;">C (2.00)</strong> would improve your semester GPA by <strong>+${gpaDiff}</strong> → <strong>${upgradedSemGPA.toFixed(2)}</strong>${totalPastCr > 0 ? ` and CGPA by <strong>+${cgpaDiff}</strong> → <strong>${newCGPA.toFixed(2)}</strong>` : ''}.
                        </div>
                    </div>
                </div>
            </td>`;
            tbody.appendChild(hintTr);
        }
    });
}

// ── 26g. Render the live GPA result panel ─────────────────────────

function renderCalcResult() {
    const courses = appState.calcCourses;
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
    badge.innerHTML = `${cls.icon} <span style="margin-left:4px;">${cls.label}</span>`;
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
// ── 26i. Global Upgrade Hints ──────────────────────────────────────

function renderGlobalUpgradeHints() {
    const dashCont = $('dashUpgradeHintsContainer');
    const predCont = $('predUpgradeHintsContainer');

    const courses = appState.calcCourses;
    const belowCGrades = ['C-', 'D+', 'D', 'E', 'F'];
    const weakCourses = courses.filter(c => belowCGrades.includes(c.gradeLabel));

    if (weakCourses.length === 0 || courses.length === 0) {
        if (dashCont) dashCont.style.display = 'none';
        if (predCont) predCont.style.display = 'none';
        return;
    }

    // Accurate calculation:
    // Current CGPA = calcCGPA() which uses saved semesters only
    // The calc courses represent a FUTURE semester not yet saved
    // oldCalcGPA = current calc sem GPA (all courses at current grades)
    // newCalcGPA = calc sem GPA if specific course upgraded to C
    // CGPA impact: (saved weighted sum + new calc QP * calc credits) / (saved credits + calc credits)
    const currentCGPA = calcCGPA();
    const completedSems = appState.semesters.filter(s => !s.skipped && s.gpa !== null);
    const savedWeighted = completedSems.reduce((acc, s) => acc + (s.gpa * s.credits), 0);
    const savedCredits  = completedSems.reduce((acc, s) => acc + s.credits, 0);

    const calcTotalQP = courses.reduce((acc, x) => acc + (x.gradePts * x.credits), 0);
    const calcTotalCr = courses.reduce((acc, x) => acc + x.credits, 0);
    const calcGPA = calcTotalCr > 0 ? calcTotalQP / calcTotalCr : 0;

    let dashHtml = '';
    let predHtml = '';

    weakCourses.forEach(c => {
        const upgradeQP      = calcTotalQP - (c.gradePts * c.credits) + (2.00 * c.credits);
        const upgradedCalcGPA = calcTotalCr > 0 ? upgradeQP / calcTotalCr : 0;
        const gpaDiff = (upgradedCalcGPA - calcGPA).toFixed(2);

        // CGPA with this sem at current grades vs upgraded
        const totalCrWithCalc = savedCredits + calcTotalCr;
        let cgpaNote = '';
        if (totalCrWithCalc > 0) {
            const cgpaWithCurrent  = (savedWeighted + calcTotalQP)  / totalCrWithCalc;
            const cgpaWithUpgraded = (savedWeighted + upgradeQP)    / totalCrWithCalc;
            const cgpaDiff = (cgpaWithUpgraded - cgpaWithCurrent).toFixed(2);
            cgpaNote = ` &amp; CGPA by <strong>+${cgpaDiff}</strong> → <strong>${cgpaWithUpgraded.toFixed(2)}</strong>`;
        }

        const cId = c.id;
        const infoHtml = `
            <strong>${escHtml(c.name)}</strong>: upgrading from <strong style="color:var(--danger);">${escHtml(c.gradeLabel)}</strong> to <strong style="color:#d97706;">C (2.00)</strong>
            would improve your calc semester GPA by <strong>+${gpaDiff}</strong> → <strong>${upgradedCalcGPA.toFixed(2)}</strong>${cgpaNote}.`;

        // Dashboard: hint only (no button)
        dashHtml += `
        <div class="card" style="margin-bottom:8px;border-left:4px solid #d97706;padding:12px 16px;">
            <div style="display:flex;align-items:flex-start;gap:10px;">
                <i data-lucide="lightbulb" class="icon-pulse" style="width:18px;height:18px;flex-shrink:0;color:#d97706;margin-top:2px;"></i>
                <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.55;">
                    <strong style="color:var(--text-primary);">💡 Improvement Tip:</strong> ${infoHtml}
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">Go to <em>GPA Calculator</em> to update this course grade.</div>
                </div>
            </div>
        </div>`;

        // Prediction page: hint WITH Apply button
        predHtml += `
        <div class="card pred-upgrade-card" id="predUpgradeCard_${cId}" style="margin-bottom:8px;border-left:4px solid #d97706;padding:14px 16px;">
            <div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
                <i data-lucide="lightbulb" class="icon-pulse" style="width:18px;height:18px;flex-shrink:0;color:#d97706;margin-top:2px;"></i>
                <div style="flex:1;min-width:200px;">
                    <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.55;margin-bottom:10px;">
                        <strong style="color:var(--text-primary);">💡 Improvement Tip:</strong> ${infoHtml}
                    </div>
                    <button class="btn-secondary" onclick="applyGradeUpgradeGlobal(${cId})"
                        style="font-size:0.8rem;padding:6px 14px;display:inline-flex;align-items:center;gap:6px;border-color:#d97706;color:#d97706;">
                        <i data-lucide="check-circle" style="width:14px;height:14px;"></i>
                        Apply Upgrade in Calculator
                    </button>
                </div>
            </div>
        </div>`;
    });

    const dashTitle = `<p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin-bottom:8px;">💡 GPA Improvement Guide</p>`;
    const predTitle = `<p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin-bottom:8px;">💡 GPA Improvement Guide — Apply changes in the calculator</p>`;

    if (dashCont) { dashCont.innerHTML = dashTitle + dashHtml; dashCont.style.display = ''; }
    if (predCont) { predCont.innerHTML = predTitle + predHtml; predCont.style.display = ''; }
    refreshIcons();
}

function applyGradeUpgradeGlobal(id) {
    const course = appState.calcCourses.find(c => c.id === id);
    if (!course) return;

    course.gradePts   = 2.00;
    course.gradeLabel = 'C';
    saveToStorage();

    // Remove the card from prediction page
    const card = $(`predUpgradeCard_${id}`);
    if (card) {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-8px)';
        setTimeout(() => card.remove(), 400);
    }

    // Re-render calc result and hints
    renderCalcTable();
    renderCalcResult();
    renderGlobalUpgradeHints();
}
window.applyGradeUpgradeGlobal = applyGradeUpgradeGlobal;

// Also show bottom quick-calc on dashboard when profile set up
function showDashQuickCalc() {
    const el = $('dashQuickCalcBottom');
    if (el) el.style.display = appState.profileSetup ? '' : 'none';
}

// ── 16. BLOG & ACADEMIC GUIDES CONTROLLER ──────────────────────

function openBlogArticle(articleId) {
    const source = $(`art-${articleId}`);
    const container = $('blogArticleContainer');
    const grid = $('blogGridView');
    const reader = $('blogReaderView');

    if (!source || !container || !grid || !reader) return;

    // Set article HTML
    container.innerHTML = source.innerHTML;

    // Show reader, hide grid
    grid.classList.add('hidden');
    reader.classList.remove('hidden');

    // Refresh Lucide icons in article
    refreshIcons();

    // Scroll to the top of the blog section
    const section = $('section-blog');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.openBlogArticle = openBlogArticle;

function closeBlogArticle() {
    const grid = $('blogGridView');
    const reader = $('blogReaderView');

    if (!grid || !reader) return;

    // Show grid, hide reader
    grid.classList.remove('hidden');
    reader.classList.add('hidden');

    // Scroll to the top of the blog section
    const section = $('section-blog');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.closeBlogArticle = closeBlogArticle;

// ── 27. GRADING SETTINGS PAGE ──────────────────────────────────

function renderSettingsPage() {
    const container = $('settingsContainer');
    if (!container) return;

    const preset = gradingSettings.preset;
    const presetOptions = Object.entries(UNI_PRESETS).map(([key, p]) =>
        `<option value="${key}" ${preset === key ? 'selected' : ''}>${escHtml(p.name)}</option>`
    ).join('');

    // Grade scale table rows (editable)
    const gradeRows = gradingSettings.grades.map((g, i) => `
        <tr class="settings-grade-row" data-idx="${i}">
            <td><input type="text" class="sg-input sg-grade" value="${escHtml(g.grade)}" maxlength="4" placeholder="A+" data-field="grade" data-idx="${i}"></td>
            <td><input type="number" class="sg-input sg-pts" value="${g.points}" min="0" max="5" step="0.01" placeholder="4.00" data-field="points" data-idx="${i}"></td>
            <td>
                <div class="sg-range-row">
                    <input type="number" class="sg-input sg-range" value="${g.markMin}" min="0" max="100" step="1" placeholder="0" data-field="markMin" data-idx="${i}">
                    <span class="sg-range-dash">–</span>
                    <input type="number" class="sg-input sg-range" value="${g.markMax}" min="0" max="100" step="1" placeholder="100" data-field="markMax" data-idx="${i}">
                </div>
            </td>
            <td>
                <button class="btn-icon delete sg-delete-grade" title="Remove row" data-idx="${i}" onclick="settingsDeleteGradeRow(${i})">
                    <i data-lucide="trash-2" style="width:15px;height:15px;color:#ef4444;"></i>
                </button>
            </td>
        </tr>`).join('');

    // Classification thresholds (editable)
    const classRows = gradingSettings.classifications.map((c, i) => `
        <tr class="settings-class-row" data-idx="${i}">
            <td><input type="text" class="sg-input sg-class-label" value="${escHtml(c.label)}" maxlength="30" placeholder="First Class" data-cidx="${i}"></td>
            <td>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:0.82rem;color:var(--text-muted);">CGPA ≥</span>
                    <input type="number" class="sg-input sg-class-min" value="${c.minGpa}" min="0" max="5" step="0.01" placeholder="3.70" data-cidx="${i}" style="width:80px;">
                </div>
            </td>
            <td>
                <button class="btn-icon delete sg-delete-class" title="Remove" data-cidx="${i}" onclick="settingsDeleteClassRow(${i})">
                    <i data-lucide="trash-2" style="width:15px;height:15px;color:#ef4444;"></i>
                </button>
            </td>
        </tr>`).join('');

    container.innerHTML = `
        <!-- ── INSTRUCTION BANNER ── -->
        <div class="settings-instruction-banner">
            <div class="sib-icon"><i data-lucide="info" style="width:22px;height:22px;color:var(--primary);"></i></div>
            <div class="sib-body">
                <div class="sib-title">How to Customize Your University Grading System</div>
                <ol class="sib-steps">
                    <li><strong>Step 1 — Choose a Preset:</strong> Select your university from the dropdown below (SLIIT, UOM, UOC, USJP, NSBM/IIT). The grade scale and classification thresholds will auto-fill.</li>
                    <li><strong>Step 2 — Review & Edit:</strong> You can modify any grade points, mark ranges, or degree classification thresholds directly in the tables below.</li>
                    <li><strong>Step 3 — Add/Remove Rows:</strong> Use <strong>+ Add Grade Row</strong> or <strong>+ Add Classification</strong> buttons to add new entries, or click the trash icon to remove them.</li>
                    <li><strong>Step 4 — Save Settings:</strong> Click <strong>Save Settings</strong>. Your changes will be applied immediately across the entire app — GPA calculator, classification badges, prediction targets, and CGPA calculations.</li>
                </ol>
                <div class="sib-note"><i data-lucide="lightbulb" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;color:#d97706;"></i><strong>Note:</strong> Settings are saved locally on your device. Resetting will restore the default SLIIT grading scale.</div>
            </div>
        </div>

        <!-- ── PRESET SELECTOR ── -->
        <div class="card settings-card" style="margin-bottom:18px;">
            <div class="card-header">
                <h3><i data-lucide="building-2" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;color:var(--primary);"></i>University Preset</h3>
                <span class="card-badge">${escHtml(UNI_PRESETS[preset]?.name || 'Custom')}</span>
            </div>
            <div style="padding:16px 18px;">
                <label for="settingsPresetSelect" style="font-size:0.88rem;font-weight:600;color:var(--text-primary);display:block;margin-bottom:8px;">Select Your University / System</label>
                <select id="settingsPresetSelect" class="sg-select" onchange="settingsApplyPreset(this.value)" style="width:100%;max-width:420px;">
                    ${presetOptions}
                </select>
                <p style="font-size:0.78rem;color:var(--text-muted);margin-top:8px;">Selecting a preset will <strong>overwrite</strong> the current grade scale below. Save Settings to apply.</p>
            </div>
        </div>

        <!-- ── GRADE SCALE TABLE ── -->
        <div class="card settings-card" style="margin-bottom:18px;">
            <div class="card-header">
                <h3><i data-lucide="table" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;color:var(--secondary);"></i>Grade Scale</h3>
                <span class="card-badge">${gradingSettings.grades.length} grades</span>
            </div>
            <div style="padding:0 0 16px;">
                <div class="table-wrapper">
                    <table class="sem-table grade-settings-table">
                        <thead>
                            <tr>
                                <th>Grade Letter</th>
                                <th>Grade Points</th>
                                <th>Marks Range</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="settingsGradeTableBody">
                            ${gradeRows}
                        </tbody>
                    </table>
                </div>
                <div style="padding:10px 16px 0;">
                    <button class="btn-secondary" onclick="settingsAddGradeRow()" style="font-size:0.85rem;padding:8px 16px;">
                        <i data-lucide="plus" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>Add Grade Row
                    </button>
                </div>
            </div>
        </div>

        <!-- ── CLASSIFICATION THRESHOLDS ── -->
        <div class="card settings-card" style="margin-bottom:18px;">
            <div class="card-header">
                <h3><i data-lucide="award" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;color:#d97706;"></i>Degree Classification Thresholds</h3>
                <span class="card-badge">${gradingSettings.classifications.length} tiers</span>
            </div>
            <div style="padding:0 0 16px;">
                <p style="padding:12px 18px 0;font-size:0.82rem;color:var(--text-muted);">Set the minimum CGPA required for each degree classification. These thresholds are used for your CGPA badge, prediction engine, and dashboard status.</p>
                <div class="table-wrapper" style="margin-top:8px;">
                    <table class="sem-table grade-settings-table">
                        <thead>
                            <tr>
                                <th>Classification Name</th>
                                <th>Minimum CGPA</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="settingsClassTableBody">
                            ${classRows}
                        </tbody>
                    </table>
                </div>
                <div style="padding:10px 16px 0;">
                    <button class="btn-secondary" onclick="settingsAddClassRow()" style="font-size:0.85rem;padding:8px 16px;">
                        <i data-lucide="plus" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>Add Classification
                    </button>
                </div>
            </div>
        </div>

        <!-- ── SAVE / RESET BUTTONS ── -->
        <div class="settings-action-bar">
            <button class="btn-primary" onclick="settingsSave()" id="settingsSaveBtn" style="min-width:160px;">
                <i data-lucide="save" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:6px;"></i>Save Settings
            </button>
            <button class="btn-secondary" onclick="settingsReset()" style="min-width:140px;">
                <i data-lucide="rotate-ccw" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:6px;"></i>Reset to Default
            </button>
        </div>
        <div id="settingsSaveMsg" style="min-height:26px;font-size:0.88rem;font-weight:600;margin-top:8px;color:var(--secondary);"></div>

        <!-- ── CURRENT SCALE PREVIEW ── -->
        <div class="card settings-card" style="margin-top:20px;">
            <div class="card-header">
                <h3><i data-lucide="eye" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;color:var(--primary);"></i>Live Preview — Current Active Scale</h3>
            </div>
            <div style="padding:12px 18px 18px;">
                <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">This is how your currently saved grading settings appear in the app. Press <strong>Save Settings</strong> first to update this preview.</p>
                <div class="settings-preview-grid">
                    ${gradingSettings.grades.map(g => {
                        const displayPts = g.points.toFixed(2);
                        return `<div class="settings-preview-pill">
                            <span class="sp-grade">${escHtml(g.grade)}</span>
                            <span class="sp-pts">${displayPts}</span>
                            <span class="sp-range">${g.markMin}–${g.markMax}%</span>
                        </div>`;
                    }).join('')}
                </div>
                <div style="margin-top:16px;">
                    <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">Classification Thresholds</div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${[...gradingSettings.classifications].sort((a,b)=>b.minGpa-a.minGpa).map((c,i) => {
                            const s = CLASS_STYLES[i] || CLASS_STYLES[3];
                            return `<span class="classification-badge ${s.badge}" style="font-size:0.82rem;">${s.icon} ${escHtml(c.label)} ≥ ${c.minGpa.toFixed(2)}</span>`;
                        }).join('')}
                        <span class="classification-badge badge-fail" style="font-size:0.82rem;">Fail &lt; ${Math.min(...gradingSettings.classifications.map(c=>c.minGpa)).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    refreshIcons();
}
window.renderSettingsPage = renderSettingsPage;

function settingsApplyPreset(presetKey) {
    const preset = UNI_PRESETS[presetKey];
    if (!preset) return;
    gradingSettings.preset          = presetKey;
    gradingSettings.grades          = JSON.parse(JSON.stringify(preset.grades));
    gradingSettings.classifications = JSON.parse(JSON.stringify(preset.classifications));
    gradingSettings.maxGpa          = preset.maxGpa;
    renderSettingsPage();
}
window.settingsApplyPreset = settingsApplyPreset;

function settingsReadFromDOM() {
    // Read grade rows
    const gradeRows = document.querySelectorAll('#settingsGradeTableBody .settings-grade-row');
    const newGrades = [];
    gradeRows.forEach(row => {
        const idx = parseInt(row.dataset.idx, 10);
        const grade  = row.querySelector('[data-field="grade"]').value.trim();
        const points = parseFloat(row.querySelector('[data-field="points"]').value);
        const markMin = parseInt(row.querySelector('[data-field="markMin"]').value, 10);
        const markMax = parseInt(row.querySelector('[data-field="markMax"]').value, 10);
        if (grade) {
            newGrades.push({ grade, points: isNaN(points) ? 0 : points, markMin: isNaN(markMin) ? 0 : markMin, markMax: isNaN(markMax) ? 100 : markMax });
        }
    });

    // Read classification rows
    const classRows = document.querySelectorAll('#settingsClassTableBody .settings-class-row');
    const newClasses = [];
    classRows.forEach(row => {
        const label  = row.querySelector('.sg-class-label').value.trim();
        const minGpa = parseFloat(row.querySelector('.sg-class-min').value);
        if (label) {
            newClasses.push({ label, minGpa: isNaN(minGpa) ? 0 : minGpa });
        }
    });

    return { grades: newGrades, classifications: newClasses };
}

function settingsSave() {
    const data = settingsReadFromDOM();

    if (data.grades.length === 0) {
        const msg = $('settingsSaveMsg');
        if (msg) { msg.textContent = '⚠️ Please add at least one grade row.'; msg.style.color = 'var(--danger)'; }
        return;
    }
    if (data.classifications.length === 0) {
        const msg = $('settingsSaveMsg');
        if (msg) { msg.textContent = '⚠️ Please add at least one classification.'; msg.style.color = 'var(--danger)'; }
        return;
    }

    gradingSettings.grades          = data.grades;
    gradingSettings.classifications = data.classifications;
    // Mark as custom if not matching a preset exactly
    const presetSel = $('settingsPresetSelect');
    if (presetSel) gradingSettings.preset = presetSel.value;

    saveGradingSettings();
    refreshGradeDropdown();
    renderAll(); // Re-classify all semesters with new settings

    const msg = $('settingsSaveMsg');
    if (msg) {
        msg.textContent = '✅ Settings saved! Grading scale applied across the app.';
        msg.style.color = 'var(--secondary)';
        setTimeout(() => { if (msg) msg.textContent = ''; }, 4000);
    }

    // Re-render settings page to refresh the preview
    setTimeout(renderSettingsPage, 100);
}
window.settingsSave = settingsSave;

function settingsReset() {
    if (!confirm('Reset grading settings to the default SLIIT scale? This cannot be undone.')) return;
    gradingSettings.preset          = 'sliit';
    gradingSettings.grades          = JSON.parse(JSON.stringify(UNI_PRESETS.sliit.grades));
    gradingSettings.classifications = JSON.parse(JSON.stringify(UNI_PRESETS.sliit.classifications));
    gradingSettings.maxGpa          = 4.0;
    saveGradingSettings();
    refreshGradeDropdown();
    renderAll();
    renderSettingsPage();
}
window.settingsReset = settingsReset;

function settingsAddGradeRow() {
    const data = settingsReadFromDOM();
    data.grades.push({ grade: '', points: 0.00, markMin: 0, markMax: 0 });
    gradingSettings.grades = data.grades;
    gradingSettings.classifications = settingsReadFromDOM().classifications;
    renderSettingsPage();
    // Focus the last grade input
    setTimeout(() => {
        const rows = document.querySelectorAll('#settingsGradeTableBody .settings-grade-row');
        if (rows.length) rows[rows.length - 1].querySelector('.sg-grade').focus();
    }, 80);
}
window.settingsAddGradeRow = settingsAddGradeRow;

function settingsDeleteGradeRow(idx) {
    const data = settingsReadFromDOM();
    data.grades.splice(idx, 1);
    gradingSettings.grades = data.grades;
    renderSettingsPage();
}
window.settingsDeleteGradeRow = settingsDeleteGradeRow;

function settingsAddClassRow() {
    const data = settingsReadFromDOM();
    data.classifications.push({ label: '', minGpa: 0.00 });
    gradingSettings.classifications = data.classifications;
    renderSettingsPage();
    setTimeout(() => {
        const rows = document.querySelectorAll('#settingsClassTableBody .settings-class-row');
        if (rows.length) rows[rows.length - 1].querySelector('.sg-class-label').focus();
    }, 80);
}
window.settingsAddClassRow = settingsAddClassRow;

function settingsDeleteClassRow(idx) {
    const data = settingsReadFromDOM();
    data.classifications.splice(idx, 1);
    gradingSettings.classifications = data.classifications;
    renderSettingsPage();
}
window.settingsDeleteClassRow = settingsDeleteClassRow;


// ── 27b. Refresh GPA Calculator grade dropdown ─────────────────
function refreshGradeDropdown() {
    const sel = $('calcGrade');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = gradingSettings.grades.map(g =>
        `<option value="${g.points.toFixed(2)}" data-label="${escHtml(g.grade)}">${escHtml(g.grade)} (${g.points.toFixed(2)})</option>`
    ).join('');
    // Try to restore selection
    if (currentVal) sel.value = currentVal;
}
window.refreshGradeDropdown = refreshGradeDropdown;

// ── 27c. Dynamic Classification Guide Renderer ────────────────
function renderClassificationGuide() {
    const container = $('classificationGuideRow');
    if (!container) return;

    const classes = [...gradingSettings.classifications].sort((a, b) => b.minGpa - a.minGpa);
    const barWidths = [100, 82, 68, 47, 30, 20];
    const itemClasses = ['first-class', 'second-upper', 'second-lower', 'general-pass', 'general-pass', 'general-pass'];

    let html = classes.map((c, i) => {
        const nextClass = classes[i + 1];
        const rangeText = nextClass ? `${c.minGpa.toFixed(2)} – ${(c.minGpa + 0.01 > nextClass ? nextClass.minGpa + 0.29 : nextClass.minGpa + 0.29).toFixed(2)}` : `≥ ${c.minGpa.toFixed(2)}`;
        // Simpler range: just show ≥ threshold
        const simpleRange = i === 0 ? `≥ ${c.minGpa.toFixed(2)}` :
            `${c.minGpa.toFixed(2)} – ${(classes[i-1].minGpa - 0.01).toFixed(2)}`;
        const bw = barWidths[i] || 20;
        const cls = itemClasses[i] || 'general-pass';
        return `<div class="class-item ${cls}">
            <div class="class-range">${simpleRange}</div>
            <div class="class-name">${escHtml(c.label)}</div>
            <div class="class-bar"><div style="width:${bw}%"></div></div>
        </div>`;
    }).join('');

    // Add Fail tier
    const lowestMin = Math.min(...classes.map(c => c.minGpa));
    html += `<div class="class-item fail">
        <div class="class-range">&lt; ${lowestMin.toFixed(2)}</div>
        <div class="class-name">Fail</div>
        <div class="class-bar"><div style="width:18%"></div></div>
    </div>`;

    container.innerHTML = html;
}
window.renderClassificationGuide = renderClassificationGuide;

// ── 28. Privacy Modal ──────────────────────────────────────────
function openPrivacyModal() {
    const modal = $('privacyModal');
    if (modal) {
        modal.classList.add('active');
        refreshIcons(); // Ensure Lucide icons render in modal
    }
}
window.openPrivacyModal = openPrivacyModal;

function closePrivacyModal() {
    const modal = $('privacyModal');
    if (modal) modal.classList.remove('active');
}
window.closePrivacyModal = closePrivacyModal;

// ── 29. Feedback Form ──────────────────────────────────────────
function sendFeedback() {
    const msgEl = $('footerFeedbackMsg');
    const msg = msgEl ? msgEl.value.trim() : '';
    if (!msg) {
        alert("Please write a message first!");
        return;
    }
    const subject = encodeURIComponent("SmartGPA Feedback / Bug Report");
    const body = encodeURIComponent(msg);
    window.location.href = `mailto:thiwasan2002@gmail.com?subject=${subject}&body=${body}`;
    if (msgEl) msgEl.value = '';
}
window.sendFeedback = sendFeedback;

