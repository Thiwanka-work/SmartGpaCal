/* ============================================================
   SmartGPA — js/gpacalc.js
   Standalone GPA Calculator tab logic
   ============================================================ */

'use strict';

let calcCourses = [];

document.addEventListener('DOMContentLoaded', () => {
    // Bind Add button
    $('calcAddCourseBtn').addEventListener('click', handleCalcAddCourse);

    // Enter key support
    $('calcCourseName').addEventListener('keydown', e => { if (e.key === 'Enter') handleCalcAddCourse(); });
    $('calcCredits').addEventListener('keydown', e => { if (e.key === 'Enter') handleCalcAddCourse(); });

    // Clear all
    $('clearCalcBtn').addEventListener('click', () => {
        if (calcCourses.length === 0) return;
        if (!confirm('Clear all courses from the GPA calculator?')) return;
        calcCourses = [];
        renderCalcTable();
        renderCalcResult();
    });

    // Clear validation
    $('calcCourseName').addEventListener('input', () => { $('calcFormError').textContent = ''; $('calcCourseName').classList.remove('is-invalid'); });
    $('calcCredits').addEventListener('input', () => { $('calcFormError').textContent = ''; $('calcCredits').classList.remove('is-invalid'); });
});

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
    if (!name) { nameEl.classList.add('is-invalid'); hasErr = true; }
    if (isNaN(credits) || credits < 1 || credits > 6) { creditsEl.classList.add('is-invalid'); hasErr = true; }

    if (hasErr) {
        errEl.textContent = 'Course name is required and credits must be between 1 and 6.';
        return;
    }

    const selectedOption = gradeEl.options[gradeEl.selectedIndex];
    const gradeLabel = selectedOption.dataset.label || selectedOption.text.split(' ')[0];

    calcCourses.push({
        id:         Date.now(),
        name:       name,
        gradePts:   gradePts,
        gradeLabel: gradeLabel,
        credits:    credits
    });

    nameEl.value    = '';
    creditsEl.value = 3;
    nameEl.focus();

    renderCalcTable();
    renderCalcResult();
}

function calcDeleteCourse(id) {
    calcCourses = calcCourses.filter(c => c.id !== id);
    renderCalcTable();
    renderCalcResult();
}
window.calcDeleteCourse = calcDeleteCourse;

function renderCalcTable() {
    const tbody    = $('calcTableBody');
    const emptyRow = $('calcEmptyRow');

    tbody.querySelectorAll('tr:not(#calcEmptyRow)').forEach(r => r.remove());

    if (calcCourses.length === 0) { emptyRow.style.display = ''; return; }
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
            <td><button class="btn-icon delete" title="Remove course" onclick="calcDeleteCourse(${c.id})">🗑️</button></td>`;
        tbody.appendChild(tr);
    });
}

function renderCalcResult() {
    const count = calcCourses.length;

    $('calcCourseCount').textContent  = `${count} course${count !== 1 ? 's' : ''}`;
    $('calcCoursesAdded').textContent = count;

    if (count === 0) {
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

    const totalCredits = calcCourses.reduce((acc, c) => acc + c.credits, 0);
    const totalQP      = calcCourses.reduce((acc, c) => acc + (c.gradePts * c.credits), 0);
    const gpa          = totalCredits > 0 ? totalQP / totalCredits : 0;
    const cls          = classifyGpa(gpa);

    const gpaEl = $('calcGpaValue');
    gpaEl.style.transform  = 'scale(0.85)';
    gpaEl.style.transition = 'transform 0.15s ease';

    setTimeout(() => {
        gpaEl.textContent      = gpa.toFixed(2);
        gpaEl.style.color      = cls.color;
        gpaEl.style.transform  = 'scale(1)';
        gpaEl.style.transition = 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), color 0.3s ease';
    }, 100);

    $('calcTotalCredits').textContent = totalCredits;
    $('calcTotalQP').textContent      = totalQP.toFixed(2);
    $('calcGpaBarFill').style.width  = ((gpa / 4.0) * 100).toFixed(1) + '%';

    const badge = $('calcBadge');
    badge.textContent = `${cls.icon}  ${cls.label}`;
    badge.className   = `classification-badge ${cls.badge}`;
}
