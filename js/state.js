/* ============================================================
   SmartGPA — js/state.js
   Single source of truth: appState + localStorage helpers
   ============================================================ */

'use strict';

// ── 1. APPLICATION STATE ──────────────────────────────────────
let appState = {
    studentName:        '',
    totalCredits:       0,
    totalSemesters:     8,
    completedSemesters: 0,
    semesters:          [],
    profileSetup:       false
};

// ── 2. CHART INSTANCES (shared across render.js) ──────────────
let gpaLineChart   = null;
let creditDoughnut = null;

// ── 3. GLOBAL SHORTHAND ───────────────────────────────────────
const $ = id => document.getElementById(id);

// ── 4. LOCALSTORAGE ───────────────────────────────────────────

function saveToStorage() {
    localStorage.setItem('smartGpa_v2', JSON.stringify(appState));
}

function loadFromStorage() {
    const raw = localStorage.getItem('smartGpa_v2');
    if (raw) {
        try {
            appState = JSON.parse(raw);
            if (appState.totalSemesters   === undefined) appState.totalSemesters   = 8;
            if (appState.completedSemesters === undefined) appState.completedSemesters = 0;
        } catch (e) {
            console.warn('SmartGPA: Could not parse saved data, starting fresh.');
        }
    }
}

// ── 5. THEME LOADER (runs immediately so no flash) ────────────
(function loadTheme() {
    const saved = localStorage.getItem('smartGpa_theme');
    if (saved) document.documentElement.dataset.theme = saved;
})();
