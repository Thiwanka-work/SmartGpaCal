/* ============================================================
   SmartGPA — js/events.js
   Event binding, navigation, modals, CRUD, prediction, export
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    bindEvents();
    renderAll();
});

function bindEvents() {
    // Nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });

    // Mobile menu
    $('menuToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        $('sidebar').classList.toggle('open');
    });
    $('mainContent').addEventListener('click', () => {
        $('sidebar').classList.remove('open');
    });

    // Profile Setup
    $('setupProfileBtn').addEventListener('click', handleProfileSetup);
    [$('studentNameInput'), $('totalCreditsInput'), $('totalSemestersInput'), $('completedSemestersInput')].forEach(el => {
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleProfileSetup(); });
    });

    // Add Semester
    $('addSemesterBtn').addEventListener('click', handleAddSemester);
    [$('semName'), $('semGpa'), $('semCredits')].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddSemester(); });
        el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });

    // Edit Modal
    $('closeModal').addEventListener('click',  closeModal);
    $('cancelModal').addEventListener('click', closeModal);
    $('saveEditBtn').addEventListener('click', handleSaveEdit);
    $('editModal').addEventListener('click', e => { if (e.target === $('editModal')) closeModal(); });

    // Global action buttons
    $('themeToggle').addEventListener('click', toggleTheme);
    $('resetBtn').addEventListener('click', handleReset);
    $('runPredictionBtn').addEventListener('click', renderPrediction);
    $('exportPdfBtn').addEventListener('click', exportReport);

    // Prediction Target Buttons
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

// ── NAVIGATION ────────────────────────────────────────────────

function navigateTo(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = $(`section-${sectionId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = $(`nav-${sectionId}`);
    if (activeNav) activeNav.classList.add('active');

    const titles = {
        dashboard:  'Dashboard',
        semesters:  'Semester Management',
        analytics:  'Performance Analytics',
        prediction: 'GPA Prediction Engine',
        gpacalc:    'GPA Calculator'
    };
    $('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    if (sectionId === 'analytics') renderCharts();
    if (sectionId === 'prediction') updatePredictionStanding();
    if (sectionId === 'gpacalc' && typeof renderCalcResult === 'function') renderCalcResult();

    const sidebar = $('sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

// Global hook for inline handlers
window.navigateTo = navigateTo;

// ── PROFILE ───────────────────────────────────────────────────

function handleProfileSetup() {
    const name     = $('studentNameInput').value.trim();
    const credits  = parseInt($('totalCreditsInput').value, 10);
    const totalSem = parseInt($('totalSemestersInput').value, 10);
    const compSem  = parseInt($('completedSemestersInput').value, 10);

    ['studentNameInput', 'totalCreditsInput', 'totalSemestersInput', 'completedSemestersInput']
        .forEach(id => $(id).style.borderColor = '');

    if (!name) return $('studentNameInput').style.borderColor = 'var(--danger)';
    if (!credits || credits < 30 || credits > 300) return $('totalCreditsInput').style.borderColor = 'var(--danger)';
    if (!totalSem || totalSem < 1 || totalSem > 20) return $('totalSemestersInput').style.borderColor = 'var(--danger)';
    if (isNaN(compSem) || compSem < 0 || compSem > totalSem) return $('completedSemestersInput').style.borderColor = 'var(--danger)';

    appState.studentName        = name;
    appState.totalCredits       = credits;
    appState.totalSemesters     = totalSem;
    appState.completedSemesters = compSem;
    appState.profileSetup       = true;

    saveToStorage();
    renderAll();
}

// ── CRUD SEMESTERS ────────────────────────────────────────────

function handleAddSemester() {
    const nameEl    = $('semName'), gpaEl = $('semGpa'), creditsEl = $('semCredits');
    const name      = nameEl.value.trim();
    const gpa       = parseFloat(gpaEl.value);
    const credits   = parseInt(creditsEl.value, 10);

    $('formError').textContent = '';
    [nameEl, gpaEl, creditsEl].forEach(el => el.classList.remove('is-invalid'));

    let err = false;
    if (!name) { nameEl.classList.add('is-invalid'); err = true; }
    if (isNaN(gpa) || gpa < 0 || gpa > 4) { gpaEl.classList.add('is-invalid'); err = true; }
    if (isNaN(credits) || credits < 1 || credits > 60) { creditsEl.classList.add('is-invalid'); err = true; }

    if (err) {
        $('formError').textContent = 'Please fill correctly. GPA: 0–4, Credits: 1–60.';
        return;
    }

    appState.semesters.push({ id: Date.now(), name, gpa, credits });
    saveToStorage();

    nameEl.value = ''; gpaEl.value = ''; creditsEl.value = '';
    nameEl.focus();
    nameEl.placeholder = `e.g. Semester ${appState.semesters.length + 1}`;

    renderAll();
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

function closeModal() { $('editModal').classList.remove('open'); }

function handleSaveEdit() {
    const id      = parseInt($('editSemId').value, 10);
    const name    = $('editSemName').value.trim();
    const gpa     = parseFloat($('editSemGpa').value);
    const credits = parseInt($('editSemCredits').value, 10);

    if (!name || isNaN(gpa) || gpa < 0 || gpa > 4 || isNaN(credits) || credits < 1) {
        $('editFormError').textContent = 'Please fill fields correctly. GPA: 0–4.';
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

function deleteSemester(id) {
    const sem = appState.semesters.find(s => s.id === id);
    if (!sem || !confirm(`Delete "${sem.name}"? Cannot be undone.`)) return;
    appState.semesters = appState.semesters.filter(s => s.id !== id);
    saveToStorage();
    renderAll();
}

window.openEditModal = openEditModal;
window.deleteSemester = deleteSemester;

// ── THEME & RESET ─────────────────────────────────────────────

function toggleTheme() {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('smartGpa_theme', html.dataset.theme);
    renderCharts();
    renderCgpaRing();
}

function handleReset() {
    if (!confirm('⚠️ Reset ALL data? This will permanently erase your academic record.')) return;
    localStorage.removeItem('smartGpa_v2');
    appState = { studentName: '', totalCredits: 0, totalSemesters: 8, completedSemesters: 0, semesters: [], profileSetup: false };
    
    if (gpaLineChart)   { gpaLineChart.destroy();   gpaLineChart   = null; }
    if (creditDoughnut) { creditDoughnut.destroy(); creditDoughnut = null; }

    ['studentNameInput', 'totalCreditsInput'].forEach(id => $(id).value = '');
    $('totalSemestersInput').value = '8';
    $('completedSemestersInput').value = '0';
    $('studentNameDisplay').textContent = 'My Academic Record';

    renderAll();
    navigateTo('dashboard');
}

// ── PREDICTION LOGIC ──────────────────────────────────────────

let predictionTarget = 3.70;

function resetPredictionUI() {
    $('predVerdictBanner').classList.add('hidden');
    $('pred1SemBlock').classList.add('hidden');
    $('predMultiBlock').classList.add('hidden');
    $('predEmptyState').style.display = 'block';
}

function renderPrediction() {
    const nextCredits = parseInt($('predNextCredits').value, 10);

    if (isNaN(nextCredits) || nextCredits < 1 || nextCredits > 60) {
        $('predNextCredits').classList.add('is-invalid'); return;
    }
    $('predNextCredits').classList.remove('is-invalid');

    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    
    $('predEmptyState').style.display = 'none';

    if (appState.semesters.length === 0) {
        alert("Please add at least one semester before running a prediction.");
        resetPredictionUI(); return;
    }

    const banner = $('predVerdictBanner'), b1sem = $('pred1SemBlock'), bMulti = $('predMultiBlock');
    banner.classList.add('hidden'); b1sem.classList.add('hidden'); bMulti.classList.add('hidden');

    const activeBtn  = document.querySelector('.target-cls-btn.active');
    const targetName = activeBtn ? activeBtn.dataset.label : "Target Class";

    const startOff = Math.max(appState.completedSemesters || 0, appState.semesters.length);
    const remSems  = Math.max(0, (appState.totalSemesters || 8) - startOff);

    if (remSems === 0) {
        banner.className = 'pred-verdict-banner verdict-done';
        $('verdictIcon').textContent = '🎓';
        $('verdictTitle').textContent = 'Program Completed';
        $('verdictSub').textContent = `No upcoming semesters remaining.`;
        $('verdictGpaPill').textContent = `Finished`;
        banner.classList.remove('hidden'); return;
    }

    const needed1Sem = (predictionTarget * (completed + nextCredits) - cgpa * completed) / nextCredits;

    if (needed1Sem <= 4.00 && remSems >= 1) {
        let reqGpa = Math.max(0, needed1Sem);
        banner.className = 'pred-verdict-banner verdict-can';
        $('verdictIcon').textContent  = (cgpa >= predictionTarget) ? '🛡️' : '🚀';
        $('verdictTitle').textContent = (cgpa >= predictionTarget) ? 'Maintain Standing' : 'Achievable';
        $('verdictSub').textContent   = (cgpa >= predictionTarget) ? `Above ${targetName}.` : `Reach ${targetName} next semester!`;
        $('verdictGpaPill').textContent = `Need ${reqGpa.toFixed(2)}`;
        
        b1sem.classList.remove('hidden');
        $('pred1SemTitle').textContent = `Semester ${startOff + 1} Goal`;
        $('pred1SemSub').textContent   = `Taking ${nextCredits} credits`;
        $('pred1SemBox').className     = 'pred-gpa-required-box box-achievable';
        $('pred1SemGpa').textContent   = reqGpa.toFixed(2);
        $('pred1SemNote').textContent  = `Score this GPA in Semester ${startOff + 1} to reach ${predictionTarget.toFixed(2)} CGPA.`;
        banner.classList.remove('hidden');
    } else {
        banner.className = 'pred-verdict-banner verdict-cannot';
        $('verdictIcon').textContent = '📈';
        $('verdictTitle').textContent = 'Long-term Goal';
        $('verdictSub').textContent = `Requires multiple semesters.`;
        $('verdictGpaPill').textContent = `Multi-Sem Plan`;
        
        bMulti.classList.remove('hidden');
        let roadmapHTML = '', targetSems = 0, balGPA = 0;
        
        for (let s = 2; s <= remSems; s++) {
            let tc = s * nextCredits;
            let needed = (predictionTarget * (completed + tc) - cgpa * completed) / tc;
            if (needed <= 4.00) { targetSems = s; balGPA = Math.max(0, needed); break; }
        }
        
        const rmapDiv = $('predRoadmap');
        if (targetSems > 0) {
            $('predMultiSub').textContent = `Balance: Average ${balGPA.toFixed(2)} over next ${targetSems} semesters to reach ${targetName}.`;
            roadmapHTML += `<div class="roadmap-step step-past"><div class="rs-number">!</div><div class="rs-info"><div class="rs-sem-name">Current Standing</div><div class="rs-sem-note">${completed} credits</div></div><div class="rs-gpa-tag">${cgpa.toFixed(2)} CGPA</div></div>`;
            
            let simCGPA = cgpa, simComp = completed;
            for (let i = 1; i <= targetSems; i++) {
                simComp += nextCredits;
                simCGPA = (simCGPA * (simComp - nextCredits) + balGPA * nextCredits) / simComp;
                let disp = (i === targetSems) ? Math.max(predictionTarget, simCGPA) : simCGPA;
                let sn = startOff + i;
                roadmapHTML += `<div class="roadmap-step ${i===targetSems?'step-achieved':'step-next'}"><div class="rs-number">${sn}</div><div class="rs-info"><div class="rs-sem-name">Semester ${sn}</div><div class="rs-sem-note">Score ${balGPA.toFixed(2)} (${nextCredits} cr)</div></div><div class="rs-gpa-tag">CGPA ${disp.toFixed(2)}</div></div>`;
            }
            $('predRoadmapNote').innerHTML = `💡 Hit exactly <strong>${balGPA.toFixed(2)}</strong> each semester.`;
        } else {
            $('predMultiSub').textContent = `Mathematical Limit Reached`;
            roadmapHTML = `<div class="pred-empty" style="padding:20px; border:1px solid var(--border); border-radius:8px;"><div style="font-size:2.5rem; margin-bottom:10px;">📉</div><p style="color:var(--danger); font-weight:600;">Impossible</p><p style="font-size:0.85rem;color:var(--text-secondary); margin-top:5px;">Even perfect 4.00 GPAs won't reach ${predictionTarget.toFixed(2)} in ${remSems} semesters.</p></div>`;
            $('predRoadmapNote').textContent = "💡 Tip: Focus on the next immediate classification level.";
        }
        rmapDiv.innerHTML = roadmapHTML;
        banner.classList.remove('hidden');
    }
}

// ── EXPORT PDF ────────────────────────────────────────────────

function exportReport() {
    const cgpa      = calcCGPA();
    const completed = calcCompletedCredits();
    const remaining = Math.max(0, appState.totalCredits - completed);
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
            <td><span class="badge" style="background:${c.color}20; color:${c.color}">${c.label}</span></td>
        </tr>`;
    }).join('');

    if (!tableRows) tableRows = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No semester data</td></tr>';

    const html = `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>CGPA Report – ${escHtml(appState.studentName)}</title>
    <style>
        body { font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; color: #0f172a; padding: 0 20px; }
        .header-wrap { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon { width: 40px; height: 40px; background: #2563eb; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; }
        h1 { font-size: 1.8rem; margin: 0; color: #0f172a; }
        .sub { color: #64748b; font-size: 0.95rem; margin-top: 5px; }
        .class-banner { background: ${cls.color}15; border-left: 4px solid ${cls.color}; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .cb-label { color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; }
        .cb-val { font-size: 1.5rem; font-weight: bold; color: ${cls.color}; margin-top: 4px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
        .box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center; }
        .box .val { display: block; font-size: 2rem; font-weight: 800; color: #0f172a; }
        .box .lbl { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-top: 6px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 40px; }
        th { background: #f8fafc; padding: 12px 14px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: bold; border-bottom: 2px solid #e2e8f0; }
        td { padding: 14px; border-bottom: 1px solid #f1f5f9; }
        tr:nth-child(even) { background: #fafbfc; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
        .footer { text-align: center; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print { body { margin: 0; padding: 0; } .box { border: 1px solid #ddd; } }
    </style>
    </head><body>
    <div class="header-wrap">
        <div>
            <h1>🎓 Academic Transcript Report</h1>
            <div class="sub">Student: <strong>${escHtml(appState.studentName)}</strong></div>
        </div>
        <div class="brand">
            <div class="brand-icon">S</div>
            <strong style="color:#2563eb; font-size: 1.2rem;">SmartGPA</strong>
        </div>
    </div>

    <div class="class-banner">
        <div>
            <div class="cb-label">Current Classification</div>
            <div class="cb-val">${cls.icon} ${cls.label}</div>
        </div>
        <div style="text-align: right;">
            <div class="cb-label">Cumulative GPA</div>
            <div class="cb-val" style="font-size: 2rem;">${sems.length > 0 ? cgpa.toFixed(2) : '--'}</div>
        </div>
    </div>

    <div class="summary">
        <div class="box"><span class="val">${sems.length}</span><span class="lbl">Semesters Recorded</span></div>
        <div class="box"><span class="val">${completed}</span><span class="lbl">Credits Earned</span></div>
        <div class="box"><span class="val">${remaining}</span><span class="lbl">Credits Remaining</span></div>
    </div>

    <table>
        <thead><tr><th>No.</th><th>Semester Name</th><th>GPA</th><th>Credits</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
    </table>

    <div class="footer">
        Generated by SmartGPA Academic Portal &nbsp;·&nbsp; ${date}<br>
        <a href="https://smartgpa.app" style="color: #2563eb; text-decoration: none; margin-top: 8px; display: inline-block;">smartgpa.app</a>
    </div>
    <script>setTimeout(() => window.print(), 500);<\/script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
    else alert('Please allow pop-ups to export the PDF report.');
}
