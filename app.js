(function () {
  const STORAGE_KEY = 'work-time-calculator:v1';
  const STORAGE_TARGET_KEY = 'work-time-calculator:weekly-target-hours';

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];

  /**
   * Utils
   */
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

  function resetWeek() {
    dayKeys.forEach((k) => {
      const els = getDayElements(k);
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
    // Force 24-hour display on supported browsers by setting locale
    try {
      document.querySelectorAll('input[type="time"]').forEach((el) => {
        el.setAttribute('lang', 'en-GB');
      });
    } catch (_) { /* no-op */ }

    const weeklyTargetEl = document.getElementById('weekly-target-hours');
    weeklyTargetEl.addEventListener('input', recalc);

    dayKeys.forEach((k) => {
      const els = getDayElements(k);
      ['input', 'change'].forEach((evt) => {
        els.start.addEventListener(evt, recalc);
        els.end.addEventListener(evt, recalc);
        els.lunch.addEventListener(evt, recalc);
        els.dinner.addEventListener(evt, recalc);
      });
    });

    document.getElementById('reset-week').addEventListener('click', resetWeek);
  }

  // Bootstrap
  loadState();
  bindEvents();
  recalc();
})();


