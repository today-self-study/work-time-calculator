(function () {
  const STORAGE_KEY = 'work-time-calculator:v1';
  const STORAGE_TARGET_KEY = 'work-time-calculator:weekly-target-hours';

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];

  /**
   * Utils
   */
  function pad2(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '';
    return v < 10 ? '0' + v : String(v);
  }
  function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const [hh, mm] = timeStr.split(':');
    const hours = Number(hh);
    const minutes = Number(mm || 0);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  function minutesToHHMM(totalMinutes) {
    if (totalMinutes == null || !Number.isFinite(totalMinutes)) return '0:00';
    const negative = totalMinutes < 0;
    const abs = Math.abs(Math.round(totalMinutes));
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const mm = m < 10 ? '0' + m : String(m);
    return (negative ? '-' : '') + h + ':' + mm;
  }

  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  function getTargetHours() {
    const el = document.getElementById('weekly-target-hours');
    const raw = Number(el.value);
    if (Number.isFinite(raw) && raw >= 0) return raw;
    return 40; // default
  }

  function getDayElements(key) {
    return {
      start: document.getElementById(`${key}-start`),
      end: document.getElementById(`${key}-end`),
      lunch: document.getElementById(`${key}-lunch`),
      dinner: document.getElementById(`${key}-dinner`),
      total: document.getElementById(`${key}-total`),
      remaining: document.getElementById(`${key}-remaining`),
    };
  }

  function getDaySelects(key) {
    return {
      startH: document.getElementById(`${key}-start-h`),
      startM: document.getElementById(`${key}-start-m`),
      endH: document.getElementById(`${key}-end-h`),
      endM: document.getElementById(`${key}-end-m`),
    };
  }

  function createOptions(selectEl, start, end, step, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholder || '--';
    selectEl.appendChild(ph);
    for (let v = start; v <= end; v += step) {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = pad2(v);
      selectEl.appendChild(opt);
    }
  }

  function populateTimeSelects() {
    dayKeys.forEach((k) => {
      const s = getDaySelects(k);
      createOptions(s.startH, 0, 23, 1, '시');
      createOptions(s.endH, 0, 23, 1, '시');
      createOptions(s.startM, 0, 59, 1, '분');
      createOptions(s.endM, 0, 59, 1, '분');
    });
  }

  function setSelectsFromHidden(key) {
    const els = getDayElements(key);
    const sel = getDaySelects(key);
    if (!sel.startH || !sel.startM || !sel.endH || !sel.endM) return;
    const [sh, sm] = (els.start.value || '').split(':');
    const [eh, em] = (els.end.value || '').split(':');
    if (sh !== undefined && sh !== '') sel.startH.value = String(Number(sh));
    if (sm !== undefined && sm !== '') sel.startM.value = String(Number(sm));
    if (eh !== undefined && eh !== '') sel.endH.value = String(Number(eh));
    if (em !== undefined && em !== '') sel.endM.value = String(Number(em));
  }

  function syncHiddenForDay(key) {
    const sel = getDaySelects(key);
    const els = getDayElements(key);
    const sh = sel.startH && sel.startH.value !== '' ? pad2(sel.startH.value) : '';
    const sm = sel.startM && sel.startM.value !== '' ? pad2(sel.startM.value) : '';
    const eh = sel.endH && sel.endH.value !== '' ? pad2(sel.endH.value) : '';
    const em = sel.endM && sel.endM.value !== '' ? pad2(sel.endM.value) : '';
    els.start.value = sh !== '' && sm !== '' ? `${sh}:${sm}` : '';
    els.end.value = eh !== '' && em !== '' ? `${eh}:${em}` : '';
  }

  function loadState() {
    try {
      const targetRaw = localStorage.getItem(STORAGE_TARGET_KEY);
      if (targetRaw != null) {
        const el = document.getElementById('weekly-target-hours');
        el.value = String(targetRaw);
      } else {
        // initialize default
        document.getElementById('weekly-target-hours').value = '40';
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      dayKeys.forEach((k) => {
        const d = data[k] || {};
        const els = getDayElements(k);
        if (d.start) els.start.value = d.start;
        if (d.end) els.end.value = d.end;
        els.lunch.checked = !!d.lunch;
        els.dinner.checked = !!d.dinner;
      });
    } catch (_) {
      // ignore
    }
  }

  function saveState() {
    try {
      const data = {};
      dayKeys.forEach((k) => {
        const els = getDayElements(k);
        data[k] = {
          start: els.start.value || '',
          end: els.end.value || '',
          lunch: !!els.lunch.checked,
          dinner: !!els.dinner.checked,
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_TARGET_KEY, String(getTargetHours()));
    } catch (_) {
      // ignore
    }
  }

  function computeDailyMinutes(startStr, endStr, hadLunch, hadDinner) {
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    if (start == null || end == null) return 0;
    let diff = end - start;
    // If crossed midnight, assume next day
    if (diff < 0) diff += 24 * 60;

    if (hadLunch) diff -= 60;     // -1h
    if (hadDinner) diff -= 30;    // -30m
    return Math.max(0, diff);
  }

  function recalc() {
    const targetHours = getTargetHours();
    const targetMinutes = Math.round(targetHours * 60);
    let remaining = targetMinutes;

    dayKeys.forEach((k) => {
      const els = getDayElements(k);
      const minutes = computeDailyMinutes(els.start.value, els.end.value, els.lunch.checked, els.dinner.checked);
      els.total.textContent = minutesToHHMM(minutes);
      remaining -= minutes;
      els.remaining.textContent = minutesToHHMM(remaining);
    });

    saveState();
  }

  function resetDay(key) {
    const els = getDayElements(key);
    const sels = getDaySelects(key);
    if (sels.startH) { sels.startH.selectedIndex = 0; sels.startH.value = ''; }
    if (sels.startM) { sels.startM.selectedIndex = 0; sels.startM.value = ''; }
    if (sels.endH) { sels.endH.selectedIndex = 0; sels.endH.value = ''; }
    if (sels.endM) { sels.endM.selectedIndex = 0; sels.endM.value = ''; }
    syncHiddenForDay(key);
    els.start.value = '';
    els.end.value = '';
    els.lunch.checked = false;
    els.dinner.checked = false;
    recalc();
  }

  function resetWeek() {
    dayKeys.forEach((k) => {
      const els = getDayElements(k);
      const sels = getDaySelects(k);
      if (sels.startH) { sels.startH.selectedIndex = 0; sels.startH.value = ''; }
      if (sels.startM) { sels.startM.selectedIndex = 0; sels.startM.value = ''; }
      if (sels.endH) { sels.endH.selectedIndex = 0; sels.endH.value = ''; }
      if (sels.endM) { sels.endM.selectedIndex = 0; sels.endM.value = ''; }
      // Sync hidden fields from cleared selects
      syncHiddenForDay(k);
      els.start.value = '';
      els.end.value = '';
      els.lunch.checked = false;
      els.dinner.checked = false;
      els.total.textContent = '0:00';
      els.remaining.textContent = '0:00';
    });
    // Keep weekly target
    const saved = localStorage.getItem(STORAGE_TARGET_KEY);
    localStorage.removeItem(STORAGE_KEY);
    if (saved != null) localStorage.setItem(STORAGE_TARGET_KEY, saved);
    recalc();
  }

  function bindEvents() {
    const weeklyTargetEl = document.getElementById('weekly-target-hours');
    weeklyTargetEl.addEventListener('input', recalc);

    dayKeys.forEach((k) => {
      const els = getDayElements(k);
      const sels = getDaySelects(k);
      ['change'].forEach((evt) => {
        if (sels.startH) sels.startH.addEventListener(evt, () => { syncHiddenForDay(k); recalc(); });
        if (sels.startM) sels.startM.addEventListener(evt, () => { syncHiddenForDay(k); recalc(); });
        if (sels.endH) sels.endH.addEventListener(evt, () => { syncHiddenForDay(k); recalc(); });
        if (sels.endM) sels.endM.addEventListener(evt, () => { syncHiddenForDay(k); recalc(); });
        els.lunch.addEventListener(evt, recalc);
        els.dinner.addEventListener(evt, recalc);
      });
    });

    document.getElementById('reset-week').addEventListener('click', resetWeek);

    // Day-specific reset buttons
    document.querySelectorAll('.day-reset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-day');
        if (!key) return;
        resetDay(key);
      });
    });
  }

  // Bootstrap
  populateTimeSelects();
  loadState();
  dayKeys.forEach(setSelectsFromHidden);
  bindEvents();
  recalc();
})();


