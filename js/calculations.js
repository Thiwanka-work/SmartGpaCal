/* ============================================================
   SmartGPA — js/calculations.js
   Pure calculation functions — no DOM access
   ============================================================ */

'use strict';

// ── CGPA (credit-weighted) ────────────────────────────────────
function calcCGPA() {
    const sems = appState.semesters;
    if (sems.length === 0) return 0;
    const totalWeighted = sems.reduce((acc, s) => acc + (s.gpa * s.credits), 0);
    const totalCredits  = sems.reduce((acc, s) => acc + s.credits, 0);
    return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}

// ── Total credits earned ──────────────────────────────────────
function calcCompletedCredits() {
    return appState.semesters.reduce((acc, s) => acc + s.credits, 0);
}

// ── GPA → Academic Classification ────────────────────────────
function classifyGpa(gpa) {
    if (gpa >= 3.7) return { label: 'First Class',  badge: 'badge-first', icon: '🏆', cardClass: 'class-first', color: '#059669' };
    if (gpa >= 3.3) return { label: 'Second Upper', badge: 'badge-upper', icon: '🥇', cardClass: 'class-upper', color: '#2563eb' };
    if (gpa >= 3.0) return { label: 'Second Lower', badge: 'badge-lower', icon: '🥈', cardClass: 'class-lower', color: '#d97706' };
    if (gpa >= 2.0) return { label: 'General Pass', badge: 'badge-pass',  icon: '✅', cardClass: 'class-pass',  color: '#64748b' };
    return             { label: 'Fail',            badge: 'badge-fail',  icon: '❌', cardClass: 'class-fail',  color: '#ef4444' };
}

// ── Get next higher classification above current GPA ─────────
function getNextClassification(gpa) {
    if (gpa < 2.0) return { label: 'General Pass', target: 2.0,  color: '#64748b' };
    if (gpa < 3.0) return { label: 'Second Lower', target: 3.0,  color: '#d97706' };
    if (gpa < 3.3) return { label: 'Second Upper', target: 3.3,  color: '#2563eb' };
    if (gpa < 3.7) return { label: 'First Class',  target: 3.7,  color: '#059669' };
    return null; // Already First Class
}

// ── GPA color class for table cells ──────────────────────────
function getGpaTableClass(gpa) {
    if (gpa >= 3.7) return 'gpa-first';
    if (gpa >= 3.3) return 'gpa-upper';
    if (gpa >= 3.0) return 'gpa-lower';
    if (gpa >= 2.0) return 'gpa-pass';
    return 'gpa-fail';
}

// ── Safe HTML escape (XSS prevention) ────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
