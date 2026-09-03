// Peculiar Candles — jars, oils, wicks, and the candle build log all live in this
// browser's localStorage (keys prefixed "peculiarCandles."). No Google Sheet
// backend yet — see js/config.js.

const state = {
  jars: [],
  oils: [],
  wicks: [],
  candles: [],
  jarFilter: 'all',
  logFilter: 'all',
  buildIntensity: 'medium',
  buildWickType: 'cotton',
  buildPurpose: 'personal',
  blendMode: 'single',
  selectedRecipeId: '',
  wickAddType: 'cotton',
  oilRows: [{ oilId: '', amt: '' }],
  oilNoteRows: [{ text: '', family: 'woody' }],
};

function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function localGet(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function localSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function saveJars() { localSet('peculiarCandles.jars', state.jars); }
function saveOils() { localSet('peculiarCandles.oils', state.oils); }
function saveWicks() { localSet('peculiarCandles.wicks', state.wicks); }
function saveCandles() { localSet('peculiarCandles.candles', state.candles); }

// ---------------------------------------------------------------------
// Scent note chips — color per family, with text color computed for
// contrast (WCAG relative luminance) so light families like "Clean"
// stay legible against a near-white chip.
// ---------------------------------------------------------------------
function luminance(hex) {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16) / 255);
  const [R, G, B] = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastText(hex) { return luminance(hex) > 0.52 ? '#242a1a' : '#f8f6ec'; }

function noteChipHTML(note) {
  const meta = NOTE_META[note.family] || { color: '#a6a48d', label: note.family || 'Other' };
  const fg = contrastText(meta.color);
  return `<span class="note-chip" style="background:${meta.color};color:${fg}">${escapeHtml(note.text || meta.label)}</span>`;
}
function renderNoteLegend() {
  document.getElementById('noteLegend').innerHTML = NOTE_FAMILY_ORDER.map(fam => {
    const meta = NOTE_META[fam];
    return `<span class="note-chip" style="background:${meta.color};color:${contrastText(meta.color)}">${meta.label}</span>`;
  }).join('');
}

function wireAddToggle(toggleId, panelId, openLabel, closeLabel = '− Close') {
  const toggle = document.getElementById(toggleId);
  const panel = document.getElementById(panelId);
  toggle.addEventListener('click', () => {
    const open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : '';
    toggle.textContent = open ? openLabel : closeLabel;
  });
}

function renderWickTypeToggle(containerId, current, onSelect) {
  const el = document.getElementById(containerId);
  el.innerHTML = WICK_TYPES.map(t => `<button type="button" data-id="${t.id}" class="${t.id === current ? 'active' : ''}">${t.icon} ${t.label}</button>`).join('');
  el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => onSelect(btn.dataset.id)));
}

// ---------------------------------------------------------------------
// Dashboard tiles (top of Build tab)
// ---------------------------------------------------------------------
function renderDashboard() {
  const availJars = state.jars.filter(j => j.status === 'available').length;
  const inUseJars = state.jars.filter(j => j.status === 'inuse').length;
  const lowOils = state.oils.filter(o => o.amountOz <= LOW_STOCK_OIL_OZ).length;
  const curing = state.candles.filter(c => c.status === 'curing').length;
  const tiles = [
    { num: availJars, lbl: 'Jars available', accent: 'var(--sage)' },
    { num: inUseJars, lbl: 'Jars in use', accent: 'var(--terracotta)' },
    { num: lowOils, lbl: 'Oils low on stock', warn: lowOils > 0, accent: 'var(--danger)' },
    { num: curing, lbl: 'Candles curing', accent: 'var(--gold)' },
    { num: state.candles.length, lbl: 'Total poured', accent: 'var(--sage-dark)' },
  ];
  document.getElementById('dashTiles').innerHTML = tiles.map(t => `
    <div class="stat-tile${t.warn ? ' warn' : ''}" style="--tile-accent:${t.accent}"><div class="num">${t.num}</div><div class="lbl">${t.lbl}</div></div>
  `).join('');
}

// ---------------------------------------------------------------------
// Jars
// ---------------------------------------------------------------------
function jarStatusMeta(id) { return JAR_STATUSES.find(s => s.id === id) || JAR_STATUSES[0]; }

function jarCardHTML(j) {
  return `
    <div class="card${j.status === 'retired' ? ' dim' : ''}" style="--accent:var(--c-${j.status})">
      <div class="card-top">
        <div>
          <h3>${escapeHtml(j.name)}</h3>
          <div class="sub">${j.sizeOz ? j.sizeOz + ' oz capacity' : ''}${j.source ? ' · ' + escapeHtml(j.source) : ''}</div>
        </div>
        <select class="mini-select jar-status-select" data-id="${j.id}" style="--badge:var(--c-${j.status})">
          ${JAR_STATUSES.map(s => `<option value="${s.id}"${s.id === j.status ? ' selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      ${j.notes ? `<p class="story">${escapeHtml(j.notes)}</p>` : ''}
      <button class="icon-btn card-delete-btn jar-delete-btn" data-id="${j.id}" title="Delete jar">✕</button>
    </div>
  `;
}

function renderJarFilterChips() {
  const row = document.getElementById('jarFilterChips');
  const counts = {};
  state.jars.forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1; });
  const chips = [{ id: 'all', label: 'All', dot: 'var(--text-faint)' }].concat(JAR_STATUSES.map(s => ({ id: s.id, label: s.label, dot: `var(--c-${s.id})` })));
  row.innerHTML = chips.map(c => `
    <div class="chip${state.jarFilter === c.id ? ' active' : ''}" data-id="${c.id}" style="--dot:${c.dot}">
      <span class="dot"></span>${c.label} · ${c.id === 'all' ? state.jars.length : (counts[c.id] || 0)}
    </div>
  `).join('');
  row.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    state.jarFilter = chip.dataset.id;
    renderJarFilterChips();
    renderJars();
  }));
}

function renderJars() {
  const grid = document.getElementById('jarGrid');
  let items = state.jars.slice();
  if (state.jarFilter !== 'all') items = items.filter(j => j.status === state.jarFilter);
  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  grid.innerHTML = items.length ? items.map(jarCardHTML).join('') : `<div class="empty-state">${state.jars.length ? 'Nothing matches this filter.' : 'No jars yet — add one below.'}</div>`;

  grid.querySelectorAll('.jar-status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const jar = state.jars.find(j => j.id === sel.dataset.id);
      if (!jar) return;
      jar.status = sel.value;
      saveJars();
      renderJarFilterChips();
      renderJars();
      renderDashboard();
      populateBuildJarSelect();
    });
  });
  grid.querySelectorAll('.jar-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteJar(btn.dataset.id)));
}

function deleteJar(id) {
  if (!confirm('Delete this jar? This cannot be undone.')) return;
  state.jars = state.jars.filter(j => j.id !== id);
  saveJars();
  renderJarFilterChips();
  renderJars();
  renderDashboard();
  populateBuildJarSelect();
}

function addJar() {
  const status = document.getElementById('jarStatus');
  const name = document.getElementById('jName').value.trim();
  const sizeOz = parseFloat(document.getElementById('jSize').value);
  const source = document.getElementById('jSource').value;
  const notes = document.getElementById('jNotes').value.trim();
  status.classList.remove('error');
  if (!name || !sizeOz || sizeOz <= 0) { status.classList.add('error'); status.textContent = 'Give it a name and a capacity in oz.'; return; }

  state.jars.push({ id: uid('jar'), name, sizeOz, source, notes, status: 'available', dateAdded: todayStr() });
  saveJars();
  ['jName', 'jSize', 'jNotes'].forEach(id => { document.getElementById(id).value = ''; });
  status.textContent = 'Added.';
  setTimeout(() => { status.textContent = ''; }, 1500);
  renderJarFilterChips();
  renderJars();
  renderDashboard();
  populateBuildJarSelect();
}

// ---------------------------------------------------------------------
// Oils
// ---------------------------------------------------------------------
function oilCardHTML(o) {
  const low = o.amountOz <= LOW_STOCK_OIL_OZ;
  return `
    <div class="card">
      <div class="card-top">
        <div>
          <h3>${escapeHtml(o.name)}</h3>
          ${o.supplier ? `<div class="sub">${escapeHtml(o.supplier)}</div>` : ''}
        </div>
        ${low ? '<span class="low-stock-tag">Low</span>' : ''}
      </div>
      <div class="meta"><span><b>On hand —</b> ${o.amountOz.toFixed(2)} oz</span></div>
      <div class="note-chip-row">${(o.notes || []).map(noteChipHTML).join('') || '<span class="sub">No notes tagged</span>'}</div>
      <div class="card-actions">
        <button class="btn secondary oil-restock-btn" data-id="${o.id}">+ Restock</button>
        <button class="icon-btn card-delete-btn oil-delete-btn" data-id="${o.id}" title="Delete oil">✕</button>
      </div>
    </div>
  `;
}

function renderOils() {
  const grid = document.getElementById('oilGrid');
  const items = state.oils.slice().sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = items.length ? items.map(oilCardHTML).join('') : '<div class="empty-state">No oils yet — add one below.</div>';

  grid.querySelectorAll('.oil-restock-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const oil = state.oils.find(o => o.id === btn.dataset.id);
      if (!oil) return;
      const input = prompt(`Add how many oz to "${oil.name}"?`, '1');
      if (input === null) return;
      const amt = parseFloat(input);
      if (isNaN(amt) || amt <= 0) return;
      oil.amountOz = Math.round((oil.amountOz + amt) * 100) / 100;
      saveOils();
      renderOils();
      renderDashboard();
      populateBuildOilOptions();
    });
  });
  grid.querySelectorAll('.oil-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteOil(btn.dataset.id)));
}

function deleteOil(id) {
  if (!confirm('Delete this oil? This cannot be undone.')) return;
  state.oils = state.oils.filter(o => o.id !== id);
  saveOils();
  renderOils();
  renderDashboard();
  populateBuildOilOptions();
}

function renderOilNoteRowsUI() {
  const container = document.getElementById('oilNoteRows');
  container.innerHTML = state.oilNoteRows.map((row, i) => `
    <div class="oil-row">
      <div class="field"><input type="text" class="onr-text" data-i="${i}" placeholder="e.g. Cedarwood" value="${escapeHtml(row.text)}"></div>
      <div class="field" style="max-width:150px">
        <select class="onr-family" data-i="${i}">
          ${NOTE_FAMILY_ORDER.map(f => `<option value="${f}"${f === row.family ? ' selected' : ''}>${NOTE_META[f].label}</option>`).join('')}
        </select>
      </div>
      ${state.oilNoteRows.length > 1 ? `<button type="button" class="oil-row-remove onr-remove" data-i="${i}">✕</button>` : ''}
    </div>
  `).join('');
  container.querySelectorAll('.onr-text').forEach(el => el.addEventListener('input', e => { state.oilNoteRows[+el.dataset.i].text = e.target.value; }));
  container.querySelectorAll('.onr-family').forEach(el => el.addEventListener('change', e => { state.oilNoteRows[+el.dataset.i].family = e.target.value; }));
  container.querySelectorAll('.onr-remove').forEach(el => el.addEventListener('click', () => { state.oilNoteRows.splice(+el.dataset.i, 1); renderOilNoteRowsUI(); }));
}

function addOil() {
  const status = document.getElementById('oilStatus');
  status.classList.remove('error');
  const name = document.getElementById('oName').value.trim();
  const amountOz = parseFloat(document.getElementById('oAmount').value);
  const supplier = document.getElementById('oSupplier').value.trim();
  const notes = state.oilNoteRows.filter(r => r.text.trim()).map(r => ({ text: r.text.trim(), family: r.family }));

  if (!name || isNaN(amountOz) || amountOz < 0) { status.classList.add('error'); status.textContent = 'Give it a name and an amount on hand.'; return; }

  state.oils.push({ id: uid('oil'), name, amountOz, supplier, notes, dateAdded: todayStr() });
  saveOils();
  document.getElementById('oName').value = '';
  document.getElementById('oAmount').value = '';
  document.getElementById('oSupplier').value = '';
  state.oilNoteRows = [{ text: '', family: 'woody' }];
  renderOilNoteRowsUI();
  status.textContent = 'Added.';
  setTimeout(() => { status.textContent = ''; }, 1500);
  renderOils();
  renderDashboard();
  populateBuildOilOptions();
}

// ---------------------------------------------------------------------
// Wicks
// ---------------------------------------------------------------------
function wickCardHTML(w) {
  const type = WICK_TYPES.find(t => t.id === w.type) || WICK_TYPES[0];
  const low = w.qty <= LOW_STOCK_WICK_QTY;
  return `
    <div class="card" style="--accent:${w.type === 'wood' ? 'var(--terracotta)' : 'var(--sage)'}">
      <div class="card-top">
        <div>
          <h3>${type.icon} ${escapeHtml(w.size)}</h3>
          <div class="sub">${type.label} wick</div>
        </div>
        ${low ? '<span class="low-stock-tag">Low</span>' : ''}
      </div>
      <div class="meta"><span><b>On hand —</b> ${w.qty}</span></div>
      ${w.notes ? `<p class="story">${escapeHtml(w.notes)}</p>` : ''}
      <div class="card-actions">
        <button class="btn secondary wick-restock-btn" data-id="${w.id}">+ Restock</button>
        <button class="icon-btn card-delete-btn wick-delete-btn" data-id="${w.id}" title="Delete">✕</button>
      </div>
    </div>
  `;
}

function renderWicks() {
  const grid = document.getElementById('wickGrid');
  const items = state.wicks.slice().sort((a, b) => a.type.localeCompare(b.type) || a.size.localeCompare(b.size));
  grid.innerHTML = items.length ? items.map(wickCardHTML).join('') : '<div class="empty-state">No wicks yet — add some below.</div>';

  grid.querySelectorAll('.wick-restock-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wick = state.wicks.find(w => w.id === btn.dataset.id);
      if (!wick) return;
      const input = prompt(`Add how many to "${wick.size}"?`, '10');
      if (input === null) return;
      const amt = parseInt(input, 10);
      if (isNaN(amt) || amt <= 0) return;
      wick.qty += amt;
      saveWicks();
      renderWicks();
      renderDashboard();
      populateBuildWickOptions();
    });
  });
  grid.querySelectorAll('.wick-delete-btn').forEach(btn => btn.addEventListener('click', () => deleteWick(btn.dataset.id)));
}

function deleteWick(id) {
  if (!confirm('Delete this wick entry? This cannot be undone.')) return;
  state.wicks = state.wicks.filter(w => w.id !== id);
  saveWicks();
  renderWicks();
  renderDashboard();
  populateBuildWickOptions();
}

function selectWickAddType(id) {
  state.wickAddType = id;
  renderWickTypeToggle('wAddTypeRow', state.wickAddType, selectWickAddType);
}

function addWick() {
  const status = document.getElementById('wickStatus');
  status.classList.remove('error');
  const size = document.getElementById('wSize').value.trim();
  const qty = parseInt(document.getElementById('wQty').value, 10);
  const notes = document.getElementById('wNotes').value.trim();

  if (!size || isNaN(qty) || qty < 0) { status.classList.add('error'); status.textContent = 'Give it a size and a quantity.'; return; }

  state.wicks.push({ id: uid('wick'), type: state.wickAddType, size, qty, notes, dateAdded: todayStr() });
  saveWicks();
  document.getElementById('wSize').value = '';
  document.getElementById('wQty').value = '';
  document.getElementById('wNotes').value = '';
  status.textContent = 'Added.';
  setTimeout(() => { status.textContent = ''; }, 1500);
  renderWicks();
  renderDashboard();
  populateBuildWickOptions();
}

// ---------------------------------------------------------------------
// Build a candle
// ---------------------------------------------------------------------
function renderIntensityRow() {
  const row = document.getElementById('intensityRow');
  row.innerHTML = INTENSITY_LEVELS.map(lv => `<button type="button" data-id="${lv.id}" class="${lv.id === state.buildIntensity ? 'active' : ''}" title="${lv.desc}">${lv.label}</button>`).join('');
  row.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.buildIntensity = btn.dataset.id;
    renderIntensityRow();
    updateCalc();
  }));
}

function renderPurposeRow() {
  const row = document.getElementById('purposeRow');
  row.innerHTML = CANDLE_PURPOSES.map(p => `<button type="button" data-id="${p.id}" class="${p.id === state.buildPurpose ? 'active' : ''}">${p.label}</button>`).join('');
  row.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.buildPurpose = btn.dataset.id;
    renderPurposeRow();
  }));
}

function selectBuildWickType(id) {
  state.buildWickType = id;
  renderWickTypeToggle('wickTypeRow', state.buildWickType, selectBuildWickType);
  populateBuildWickOptions();
}

// ---------------------------------------------------------------------
// Blend type — a single scent (or hand-picked custom blend) vs a named
// recipe, whose ratio-by-parts gets scaled to whatever total fragrance
// oz the calculator suggests for the current jar + intensity.
// ---------------------------------------------------------------------
function renderBlendModeRow() {
  const row = document.getElementById('blendModeRow');
  row.innerHTML = `
    <button type="button" data-mode="single" class="${state.blendMode === 'single' ? 'active' : ''}">Single Scent</button>
    <button type="button" data-mode="recipe" class="${state.blendMode === 'recipe' ? 'active' : ''}">Recipe Blend</button>
  `;
  row.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.blendMode = btn.dataset.mode;
    renderBlendModeRow();
    updateBlendModeVisibility();
    if (state.blendMode === 'recipe' && state.selectedRecipeId) applyRecipe(state.selectedRecipeId);
  }));
}

function updateBlendModeVisibility() {
  document.getElementById('recipePickerField').style.display = state.blendMode === 'recipe' ? '' : 'none';
}

function populateRecipeSelect() {
  const sel = document.getElementById('bRecipe');
  sel.innerHTML = '<option value="">Choose a blend…</option>' + RECIPES.map(r => `<option value="${r.id}"${r.id === state.selectedRecipeId ? ' selected' : ''}>${r.icon} ${escapeHtml(r.name)}</option>`).join('');
}

function renderRecipeDetail() {
  const box = document.getElementById('recipeDetail');
  const recipe = RECIPES.find(r => r.id === state.selectedRecipeId);
  if (!recipe) { box.innerHTML = ''; return; }
  const missing = recipe.parts.filter(p => !state.oils.some(o => o.name.toLowerCase() === p.oil.toLowerCase()));
  box.innerHTML = `
    <p class="calc-note recipe-expect">"${escapeHtml(recipe.expect)}"</p>
    <div class="recipe-parts">${recipe.parts.map(p => `<span class="recipe-part-chip">${p.parts}× ${escapeHtml(p.oil)}</span>`).join('')}</div>
    ${missing.length ? `<p class="status-msg error">Not in your inventory yet: ${missing.map(m => escapeHtml(m.oil)).join(', ')} — add ${missing.length === 1 ? 'it' : 'them'} to the Oils tab first, or that part of the blend will be skipped.</p>` : ''}
  `;
}

function applyRecipe(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return;
  const r = suggestedRatio();
  const targetOz = r ? r.oilOz : 0;
  const totalParts = recipe.parts.reduce((s, p) => s + p.parts, 0);
  state.oilRows = recipe.parts.map(p => {
    const oil = state.oils.find(o => o.name.toLowerCase() === p.oil.toLowerCase());
    const amt = totalParts ? Math.round(targetOz * (p.parts / totalParts) * 100) / 100 : 0;
    return { oilId: oil ? oil.id : '', amt: amt || '' };
  });
  renderOilRows();

  const nameInput = document.getElementById('bName');
  if (!nameInput.value.trim()) nameInput.value = recipe.name;
  const notesInput = document.getElementById('bNotes');
  if (!notesInput.value.trim()) notesInput.value = recipe.expect;
}

function selectedJar() { return state.jars.find(j => j.id === document.getElementById('bJar').value); }
function currentIntensity() { return INTENSITY_LEVELS.find(l => l.id === state.buildIntensity) || INTENSITY_LEVELS[1]; }

function suggestedRatio() {
  const jar = selectedJar();
  if (!jar) return null;
  const waxOz = Math.round(jar.sizeOz * WAX_YIELD_FACTOR * 100) / 100;
  const oilOz = Math.round(waxOz * currentIntensity().pct * 100) / 100;
  return { jar, waxOz, oilOz };
}

function updateCalc() {
  const r = suggestedRatio();
  document.getElementById('calcWax').textContent = r ? r.waxOz.toFixed(2) : '—';
  document.getElementById('calcOil').textContent = r ? r.oilOz.toFixed(2) : '—';
  document.getElementById('calcJarSize').textContent = r ? r.jar.sizeOz : '—';
  document.getElementById('calcFactor').textContent = WAX_YIELD_FACTOR;
  if (state.blendMode === 'recipe' && state.selectedRecipeId) applyRecipe(state.selectedRecipeId);
  updateOilTotalLine();
}

function updateOilTotalLine() {
  const el = document.getElementById('oilTotalLine');
  const total = state.oilRows.reduce((s, r) => s + (parseFloat(r.amt) || 0), 0);
  const r = suggestedRatio();
  if (!r) { el.textContent = total > 0 ? `Total entered: ${total.toFixed(2)} oz` : ''; el.classList.remove('over'); return; }
  const overThresh = total > 0 && Math.abs(total - r.oilOz) > r.oilOz * 0.25 + 0.05;
  el.innerHTML = `Total entered: <b>${total.toFixed(2)} oz</b> · target ~${r.oilOz.toFixed(2)} oz`;
  el.classList.toggle('over', overThresh);
}

function renderOilRows() {
  const container = document.getElementById('oilRows');
  const availableOils = state.oils.slice().sort((a, b) => a.name.localeCompare(b.name));
  container.innerHTML = state.oilRows.map((row, i) => `
    <div class="oil-row">
      <div class="field">
        <select class="or-oil" data-i="${i}">
          <option value="">Choose an oil…</option>
          ${availableOils.map(o => `<option value="${o.id}"${o.id === row.oilId ? ' selected' : ''}>${escapeHtml(o.name)} (${o.amountOz.toFixed(2)} oz on hand)</option>`).join('')}
        </select>
      </div>
      <div class="field oil-amt">
        <input type="number" class="or-amt" data-i="${i}" min="0" step="0.05" placeholder="oz" value="${row.amt}">
      </div>
      ${state.oilRows.length > 1 ? `<button type="button" class="oil-row-remove or-remove" data-i="${i}">✕</button>` : ''}
    </div>
  `).join('');
  container.querySelectorAll('.or-oil').forEach(el => el.addEventListener('change', e => { state.oilRows[+el.dataset.i].oilId = e.target.value; updateOilTotalLine(); }));
  container.querySelectorAll('.or-amt').forEach(el => el.addEventListener('input', e => { state.oilRows[+el.dataset.i].amt = e.target.value; updateOilTotalLine(); }));
  container.querySelectorAll('.or-remove').forEach(el => el.addEventListener('click', () => { state.oilRows.splice(+el.dataset.i, 1); renderOilRows(); }));
  updateOilTotalLine();
}

function populateBuildOilOptions() { renderOilRows(); }

function populateBuildJarSelect() {
  const sel = document.getElementById('bJar');
  const prev = sel.value;
  const avail = state.jars.filter(j => j.status === 'available').sort((a, b) => a.name.localeCompare(b.name));
  sel.innerHTML = avail.length
    ? avail.map(j => `<option value="${j.id}">${escapeHtml(j.name)} — ${j.sizeOz} oz</option>`).join('')
    : '<option value="">No jars available</option>';
  if (avail.some(j => j.id === prev)) sel.value = prev;
  updateCalc();
}

function populateBuildWickOptions() {
  const sel = document.getElementById('bWick');
  const items = state.wicks.filter(w => w.type === state.buildWickType && w.qty > 0).sort((a, b) => a.size.localeCompare(b.size));
  sel.innerHTML = items.length
    ? items.map(w => `<option value="${w.id}">${escapeHtml(w.size)} (${w.qty} on hand)</option>`).join('')
    : `<option value="">No ${state.buildWickType} wicks in stock</option>`;
}

function pourCandle() {
  const status = document.getElementById('buildStatus');
  status.classList.remove('error');

  const name = document.getElementById('bName').value.trim();
  const jar = selectedJar();
  const oilEntries = state.oilRows
    .map(r => ({ oilId: r.oilId, amt: parseFloat(r.amt) }))
    .filter(r => r.oilId && !isNaN(r.amt) && r.amt > 0);
  const wickId = document.getElementById('bWick').value;

  if (!name) { status.classList.add('error'); status.textContent = 'Give this candle a name.'; return; }
  if (!jar) { status.classList.add('error'); status.textContent = 'Pick an available jar.'; return; }
  if (!oilEntries.length) { status.classList.add('error'); status.textContent = 'Add at least one fragrance oil and amount.'; return; }
  if (!wickId) { status.classList.add('error'); status.textContent = `No ${state.buildWickType} wick selected — add one to Wicks first if you're out.`; return; }

  for (const entry of oilEntries) {
    const oil = state.oils.find(o => o.id === entry.oilId);
    if (!oil) { status.classList.add('error'); status.textContent = 'One of the selected oils no longer exists.'; return; }
    if (entry.amt > oil.amountOz + 0.001) {
      status.classList.add('error');
      status.textContent = `Not enough "${oil.name}" on hand (${oil.amountOz.toFixed(2)} oz left, need ${entry.amt.toFixed(2)} oz).`;
      return;
    }
  }
  const wick = state.wicks.find(w => w.id === wickId);
  if (!wick || wick.qty <= 0) { status.classList.add('error'); status.textContent = 'That wick is out of stock.'; return; }

  // Commit deductions
  const oilsUsed = oilEntries.map(entry => {
    const oil = state.oils.find(o => o.id === entry.oilId);
    oil.amountOz = Math.round((oil.amountOz - entry.amt) * 100) / 100;
    return { oilId: oil.id, name: oil.name, amountOz: entry.amt, notes: oil.notes };
  });
  jar.status = 'inuse';
  wick.qty -= 1;

  const r = suggestedRatio();
  const recipe = state.blendMode === 'recipe' ? RECIPES.find(rc => rc.id === state.selectedRecipeId) : null;
  const candle = {
    id: uid('candle'),
    name,
    jarId: jar.id,
    jarName: jar.name,
    jarSizeOz: jar.sizeOz,
    waxOz: r ? r.waxOz : null,
    intensity: state.buildIntensity,
    oils: oilsUsed,
    recipeIcon: recipe ? recipe.icon : '',
    recipeName: recipe ? recipe.name : '',
    wickType: state.buildWickType,
    wickId: wick.id,
    wickSize: wick.size,
    purpose: state.buildPurpose,
    status: 'curing',
    notes: document.getElementById('bNotes').value.trim(),
    dateMade: todayStr(),
  };
  state.candles.push(candle);

  saveJars(); saveOils(); saveWicks(); saveCandles();

  document.getElementById('bName').value = '';
  document.getElementById('bNotes').value = '';
  state.oilRows = [{ oilId: '', amt: '' }];
  state.buildIntensity = 'medium';
  state.buildPurpose = 'personal';

  status.textContent = `Poured "${candle.name}" — jar marked in use, oils and wick deducted.`;
  setTimeout(() => { status.textContent = ''; }, 4500);

  renderIntensityRow();
  renderPurposeRow();
  populateBuildJarSelect(); // reapplies the recipe (via updateCalc) if one's selected
  populateBuildWickOptions();
  if (state.blendMode !== 'recipe') renderOilRows();
  renderJars(); renderJarFilterChips();
  renderOils();
  renderWicks();
  renderLog(); renderLogFilterChips();
  renderDashboard();
}

// ---------------------------------------------------------------------
// Candle log
// ---------------------------------------------------------------------
function jarForCandleIsInUse(c) {
  const jar = state.jars.find(j => j.id === c.jarId);
  return !!jar && jar.status === 'inuse';
}

function logCardHTML(c) {
  const purpose = CANDLE_PURPOSES.find(p => p.id === c.purpose);
  const wtype = WICK_TYPES.find(t => t.id === c.wickType);
  const intensity = INTENSITY_LEVELS.find(l => l.id === c.intensity);
  const allNotes = (c.oils || []).flatMap(o => o.notes || []);
  return `
    <div class="card" style="--accent:var(--c-${c.status})">
      <div class="card-top">
        <div>
          <h3>${escapeHtml(c.name)}</h3>
          <div class="sub">${escapeHtml(c.jarName)} · ${c.jarSizeOz} oz · ${c.dateMade}${c.recipeName ? ` · ${c.recipeIcon} ${escapeHtml(c.recipeName)} recipe` : ''}</div>
        </div>
        <select class="mini-select candle-status-select" data-id="${c.id}" style="--badge:var(--c-${c.status})">
          ${CANDLE_STATUSES.map(s => `<option value="${s.id}"${s.id === c.status ? ' selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      ${allNotes.length ? `<div class="note-chip-row">${allNotes.map(noteChipHTML).join('')}</div>` : ''}
      <div class="meta">
        <span><b>Oils —</b> ${(c.oils || []).map(o => `${escapeHtml(o.name)} (${o.amountOz.toFixed(2)}oz)`).join(', ')}</span>
        <span><b>Intensity —</b> ${intensity ? intensity.label : c.intensity}</span>
        <span><b>Wick —</b> ${wtype ? wtype.icon + ' ' + wtype.label : c.wickType}${c.wickSize ? ' · ' + escapeHtml(c.wickSize) : ''}</span>
      </div>
      ${purpose ? `<span class="purpose-tag ${purpose.id}" style="margin-top:9px;display:inline-block">${purpose.label}</span>` : ''}
      ${c.notes ? `<p class="story">${escapeHtml(c.notes)}</p>` : ''}
      <div class="card-actions">
        ${jarForCandleIsInUse(c) ? `<button class="btn secondary log-empty-btn" data-id="${c.id}">Empty &amp; return jar</button>` : ''}
        <button class="icon-btn card-delete-btn log-delete-btn" data-id="${c.id}" title="Delete entry">✕</button>
      </div>
    </div>
  `;
}

function renderLogFilterChips() {
  const row = document.getElementById('logFilterChips');
  const counts = {};
  state.candles.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
  const chips = [{ id: 'all', label: 'All', dot: 'var(--text-faint)' }].concat(CANDLE_STATUSES.map(s => ({ id: s.id, label: s.label, dot: `var(--c-${s.id})` })));
  row.innerHTML = chips.map(c => `
    <div class="chip${state.logFilter === c.id ? ' active' : ''}" data-id="${c.id}" style="--dot:${c.dot}">
      <span class="dot"></span>${c.label} · ${c.id === 'all' ? state.candles.length : (counts[c.id] || 0)}
    </div>
  `).join('');
  row.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    state.logFilter = chip.dataset.id;
    renderLogFilterChips();
    renderLog();
  }));
}

function renderLog() {
  const grid = document.getElementById('logGrid');
  let items = state.candles.slice();
  if (state.logFilter !== 'all') items = items.filter(c => c.status === state.logFilter);
  items.sort((a, b) => (b.dateMade || '').localeCompare(a.dateMade || '') || (b.id > a.id ? 1 : -1));
  grid.innerHTML = items.length ? items.map(logCardHTML).join('') : `<div class="empty-state">${state.candles.length ? 'Nothing matches this filter.' : 'No candles poured yet — head to Build.'}</div>`;

  grid.querySelectorAll('.candle-status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const candle = state.candles.find(c => c.id === sel.dataset.id);
      if (!candle) return;
      candle.status = sel.value;
      saveCandles();
      renderLog();
      renderLogFilterChips();
      renderDashboard();
    });
  });
  grid.querySelectorAll('.log-empty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const candle = state.candles.find(c => c.id === btn.dataset.id);
      const jar = candle && state.jars.find(j => j.id === candle.jarId);
      if (jar) { jar.status = 'cleaning'; saveJars(); }
      renderJars(); renderJarFilterChips();
      renderLog();
      renderDashboard();
      populateBuildJarSelect();
    });
  });
  grid.querySelectorAll('.log-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this log entry? This does not restore any deducted oil or wick stock.')) return;
      state.candles = state.candles.filter(c => c.id !== btn.dataset.id);
      saveCandles();
      renderLog();
      renderLogFilterChips();
      renderDashboard();
    });
  });
}

// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------
document.querySelectorAll('nav.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.view).classList.add('active');
  });
});
document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------
state.jars = localGet('peculiarCandles.jars', []);
state.oils = localGet('peculiarCandles.oils', SEED_OILS.map(o => ({ ...o, dateAdded: todayStr() })));
state.wicks = localGet('peculiarCandles.wicks', []);
state.candles = localGet('peculiarCandles.candles', []);
if (!localStorage.getItem('peculiarCandles.oils')) saveOils();

document.getElementById('jSource').innerHTML = JAR_SOURCES.map(s => `<option>${escapeHtml(s)}</option>`).join('');

renderNoteLegend();
renderOilNoteRowsUI();
document.getElementById('addOilNoteRowBtn').addEventListener('click', () => { state.oilNoteRows.push({ text: '', family: 'woody' }); renderOilNoteRowsUI(); });
document.getElementById('addOilRowBtn').addEventListener('click', () => { state.oilRows.push({ oilId: '', amt: '' }); renderOilRows(); });

renderWickTypeToggle('wAddTypeRow', state.wickAddType, selectWickAddType);
renderWickTypeToggle('wickTypeRow', state.buildWickType, selectBuildWickType);
renderIntensityRow();
renderPurposeRow();
renderBlendModeRow();
updateBlendModeVisibility();
populateRecipeSelect();
renderRecipeDetail();
document.getElementById('bRecipe').addEventListener('change', e => {
  state.selectedRecipeId = e.target.value;
  renderRecipeDetail();
  if (state.selectedRecipeId) applyRecipe(state.selectedRecipeId);
});
renderOilRows();
populateBuildJarSelect();
populateBuildWickOptions();
document.getElementById('bJar').addEventListener('change', updateCalc);
document.getElementById('pourBtn').addEventListener('click', pourCandle);

renderDashboard();
renderJarFilterChips(); renderJars();
renderOils();
renderWicks();
renderLogFilterChips(); renderLog();

document.getElementById('addJarBtn').addEventListener('click', addJar);
document.getElementById('addOilBtn').addEventListener('click', addOil);
document.getElementById('addWickBtn').addEventListener('click', addWick);

wireAddToggle('jarAddToggle', 'jarAddPanel', '+ Add a jar');
wireAddToggle('oilAddToggle', 'oilAddPanel', '+ Add an oil');
wireAddToggle('wickAddToggle', 'wickAddPanel', '+ Add wicks');
