(() => {
  'use strict';

  const STORAGE_KEY = 'peachy.tasks.v1';
  const THEME_KEY = 'peachy.theme';
  const NAME_KEY = 'peachy.name';
  const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const STATUS_LABEL = { pending: 'Pending', progress: 'In Progress', done: 'Completed' };
  const STATUS_NEXT = { pending: 'progress', progress: 'done', done: 'pending' };
  const VIEW_TITLE = { all: 'All Tasks', progress: 'In Progress', done: 'Completed' };

  // Ikon SVG statis (aman: bukan dari masukan pengguna)
  const stroke = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICONS = {
    home: stroke('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
    list: stroke('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
    clock: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    check: stroke('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'),
    trash: stroke('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    edit: stroke('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>'),
    plus: stroke('<path d="M12 5v14M5 12h14"/>'),
    close: stroke('<path d="M6 6l12 12M18 6L6 18"/>'),
    calendar: stroke('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
    menu: stroke('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    search: stroke('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>'),
    sun: stroke('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
    moon: stroke('<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>'),
    sliders: stroke('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5-9.6-10.3C1.3 7 3.6 4 6.8 4c2 0 3.7 1 5.2 3 1.5-2 3.200-3 5.200-3 3.200 0 5.500 3 4.400 6.700C20 16 12 21 12 21z"/></svg>',
    peach: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 12c-9.500 0-16 6.200-16 15 0 8.500 7 15 16 15s16-6.500 16-15c0-8.800-6.500-15-16-15z" fill="#ff9db5"/><ellipse cx="17" cy="22" rx="5" ry="3.500" fill="#ffc9d6" transform="rotate(-30 17 22)"/><path d="M24 12c.5-5 4.500-8.500 9.500-8.500-.5 5-4 8.500-9.500 8.500z" fill="#7bc67e"/><path d="M24 12c0-3 1-5 3-7" stroke="#5aa55f" stroke-width="1.500" fill="none" stroke-linecap="round"/></svg>',
    mascot: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 16c-12.500 0-21 8.200-21 19.500C11 46.500 20 55 32 55s21-8.500 21-19.500C53 24.200 44.500 16 32 16z" fill="#ffb0c4"/><ellipse cx="22" cy="27" rx="6" ry="4" fill="#ffd3de" transform="rotate(-30 22 27)"/><path d="M32 16c.600-6.500 5.800-11 12.200-11-.6 6.500-5.500 11-12.200 11z" fill="#7bc67e"/><circle cx="24" cy="36" r="2.600" fill="#6b2a45"/><circle cx="40" cy="36" r="2.600" fill="#6b2a45"/><ellipse cx="19" cy="42" rx="4" ry="2.600" fill="#ff7fa1" opacity=".55"/><ellipse cx="45" cy="42" rx="4" ry="2.600" fill="#ff7fa1" opacity=".55"/><path d="M28 42c1.500 2 6.500 2 8 0" stroke="#6b2a45" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
  };

  const $ = id => document.getElementById(id);
  const sidebar = $('sidebar'), scrim = $('scrim');
  const listEl = $('task-list'), emptyEl = $('empty-state'), emptyText = $('empty-text');
  const counterEl = $('counter'), clearBtn = $('clear-done');
  const searchInput = $('search'), sortSelect = $('sort');
  const pills = document.querySelectorAll('.pill');
  const navItems = document.querySelectorAll('.nav-item');
  const progressBar = $('progress-bar'), progressText = $('progress-text');
  const toastEl = $('toast'), toastText = $('toast-text'), toastUndo = $('toast-undo');
  const themeBtn = $('theme-toggle');
  const taskDialog = $('task-dialog'), nameDialog = $('name-dialog');
  const hero = $('hero'), viewTitle = $('view-title');

  let tasks = loadTasks();
  let view = 'home';            // home | all | progress | done
  let currentFilter = 'all';    // all | progress | done
  let searchQuery = '';
  let sortMode = 'newest';
  let editingId = null;
  let undoSnapshot = null;
  let toastTimer = null;

  // ---------- Penyimpanan ----------
  function normalize(t) {
    return {
      id: t.id,
      title: t.title,
      desc: typeof t.desc === 'string' ? t.desc : '',
      priority: PRIORITY_ORDER[t.priority] !== undefined ? t.priority : 'medium',
      due: typeof t.due === 'string' ? t.due : '',
      status: STATUS_LABEL[t.status] ? t.status : (t.done ? 'done' : 'pending')
    };
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return [];
      return data.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string').map(normalize);
    } catch (err) {
      console.warn('Data tersimpan rusak, memulai dari kosong.', err);
      return [];
    }
  }

  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (err) { console.warn('Gagal menyimpan ke localStorage.', err); }
  }

  // ---------- Logika ----------
  function createId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function snapshotTasks() { return tasks.map(t => ({ ...t })); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function toISODate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

  function addTask(data) {
    const title = (data.title || '').trim();
    if (!title) return false;
    tasks.unshift(normalize({ id: createId(), title, desc: (data.desc || '').trim(), priority: data.priority || 'medium', due: data.due || '', status: data.status || 'pending' }));
    saveTasks(); render();
    return true;
  }

  function updateTask(id, data) {
    const task = tasks.find(t => t.id === id);
    const title = (data.title || '').trim();
    if (!task || !title) return false;
    Object.assign(task, normalize({ ...task, ...data, title, desc: (data.desc || '').trim() }));
    saveTasks(); render();
    return true;
  }

  function setStatus(id, status) {
    const task = tasks.find(t => t.id === id);
    if (task) { task.status = status; saveTasks(); render(); }
  }

  function deleteTask(id) {
    const snapshot = snapshotTasks();
    tasks = tasks.filter(t => t.id !== id);     // berdasarkan ID, bukan indeks
    saveTasks(); render();
    showToast('Tugas dihapus.', snapshot);
  }

  function clearDone() {
    const count = tasks.filter(t => t.status === 'done').length;
    if (!count) return;
    const snapshot = snapshotTasks();
    tasks = tasks.filter(t => t.status !== 'done');
    saveTasks(); render();
    showToast(`${count} tugas selesai dihapus.`, snapshot);
  }

  function undo() {
    if (!undoSnapshot) return;
    tasks = undoSnapshot; undoSnapshot = null;
    saveTasks(); hideToast(); render();
  }

  function isOverdue(task) {
    if (!task.due || task.status === 'done') return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(task.due + 'T00:00:00') < today;
  }

  function formatDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function byDue(a, b) {
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  }

  function visibleTasks() {
    let list = tasks;
    if (currentFilter !== 'all') list = list.filter(t => t.status === currentFilter);
    if (searchQuery) {
      list = list.filter(t => (t.title + ' ' + t.desc).toLowerCase().includes(searchQuery));
    }
    if (sortMode === 'due') list = [...list].sort(byDue);
    if (sortMode === 'priority') list = [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return list;
  }

  // ---------- Tampilan ----------
  function fillIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
      if (!el.firstElementChild && ICONS[el.dataset.icon]) el.innerHTML = ICONS[el.dataset.icon];
    });
  }

  function iconSpan(name) {
    const s = document.createElement('span');
    s.dataset.icon = name;
    s.innerHTML = ICONS[name];
    return s;
  }

  function iconButton(name, label, className, handler) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn ' + className;
    b.setAttribute('aria-label', label);
    b.title = label;
    b.append(iconSpan(name));
    b.addEventListener('click', handler);
    return b;
  }

  function buildItem(task) {
    const li = document.createElement('li');
    li.className = `task st-${task.status}`;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.status === 'done';
    cb.setAttribute('aria-label', 'Tandai selesai: ' + task.title);
    cb.addEventListener('change', () => setStatus(task.id, cb.checked ? 'done' : 'pending'));

    const body = document.createElement('div');
    body.className = 'task-body';
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;             // textContent: aman dari XSS
    body.append(title);

    if (task.desc) {
      const desc = document.createElement('div');
      desc.className = 'task-desc';
      desc.textContent = task.desc;
      body.append(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    const prio = document.createElement('span');
    prio.className = 'prio ' + task.priority;
    prio.textContent = PRIORITY_LABEL[task.priority];
    meta.append(prio);
    if (task.due) {
      const due = document.createElement('span');
      due.className = 'due' + (isOverdue(task) ? ' overdue' : '');
      due.append(iconSpan('calendar'), document.createTextNode(formatDate(task.due) + (isOverdue(task) ? ' (terlambat)' : '')));
      meta.append(due);
    }
    body.append(meta);

    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'badge st-' + task.status;
    badge.textContent = STATUS_LABEL[task.status];
    badge.title = 'Klik untuk mengganti status';
    badge.setAttribute('aria-label', `Status ${STATUS_LABEL[task.status]}, klik untuk mengganti`);
    badge.addEventListener('click', () => setStatus(task.id, STATUS_NEXT[task.status]));

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.append(
      iconButton('edit', 'Ubah tugas', '', () => openTaskDialog(task)),
      iconButton('trash', 'Hapus tugas', 'danger', () => deleteTask(task.id))
    );

    li.append(cb, body, badge, actions);
    return li;
  }

  function emptyMessage() {
    if (tasks.length === 0) return 'Belum ada tugas. Tulis tugas pertamamu di atas!';
    if (searchQuery) return 'Tidak ada tugas yang cocok dengan pencarianmu.';
    if (currentFilter === 'progress') return 'Belum ada tugas yang sedang dikerjakan.';
    if (currentFilter === 'done') return 'Belum ada tugas yang selesai.';
    return 'Tidak ada tugas.';
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 11) return 'Good Morning';
    if (h < 15) return 'Good Afternoon';
    if (h < 19) return 'Good Evening';
    return 'Good Night';
  }

  function render() {
    const items = visibleTasks();
    listEl.replaceChildren(...items.map(buildItem));
    emptyEl.hidden = items.length > 0;
    emptyText.textContent = items.length ? '' : emptyMessage();

    const total = tasks.length;
    const counts = {
      all: total,
      progress: tasks.filter(t => t.status === 'progress').length,
      done: tasks.filter(t => t.status === 'done').length
    };
    counterEl.textContent = `${total - counts.done} tugas aktif`;
    clearBtn.disabled = counts.done === 0;

    progressBar.style.width = total ? `${Math.round((counts.done / total) * 100)}%` : '0%';
    progressText.textContent = total ? `${counts.done} dari ${total} tugas selesai` : 'Belum ada tugas';

    pills.forEach(p => {
      p.textContent = `${p.dataset.label} (${counts[p.dataset.filter]})`;
      p.classList.toggle('active', p.dataset.filter === currentFilter);
    });
    document.querySelectorAll('[data-count]').forEach(el => { el.textContent = counts[el.dataset.count]; });
    navItems.forEach(n => n.classList.toggle('active', n.dataset.view === view));

    hero.hidden = view !== 'home';
    viewTitle.hidden = view === 'home';
    viewTitle.textContent = VIEW_TITLE[view] || '';
  }

  function showToast(message, snapshot) {
    undoSnapshot = snapshot;
    toastText.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 6000);
  }

  function hideToast() {
    toastEl.hidden = true; undoSnapshot = null; clearTimeout(toastTimer);
  }

  // ---------- Dialog ----------
  function openTaskDialog(task, prefillTitle = '') {
    editingId = task ? task.id : null;
    $('dialog-title').textContent = task ? 'Edit Tugas' : 'Tambah Tugas';
    $('f-title').value = task ? task.title : prefillTitle;
    $('f-desc').value = task ? task.desc : '';
    $('f-priority').value = task ? task.priority : 'medium';
    $('f-status').value = task ? task.status : 'pending';
    $('f-due').value = task ? task.due : '';
    taskDialog.showModal();
    $('f-title').focus();
  }

  function applyName(name) {
    $('user-name').textContent = name;
    $('greeting').textContent = `${greeting()}, ${name}!`;
  }

  function initName() {
    let saved = '';
    try { saved = localStorage.getItem(NAME_KEY) || ''; } catch (err) { /* abaikan */ }
    applyName(saved || 'Kamu');
  }

  // ---------- Tema ----------
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeBtn.replaceChildren(iconSpan(theme === 'dark' ? 'sun' : 'moon'));
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* abaikan */ }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  function setSidebar(open) {
    sidebar.classList.toggle('open', open);
    scrim.hidden = !open;
  }

  // ---------- Event ----------
  $('add-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('quick-title');
    if (input.value.trim()) { addTask({ title: input.value }); input.value = ''; input.focus(); }
    else openTaskDialog(null);                  // kosong: buka form lengkap
  });

  $('detail-btn').addEventListener('click', () => {
    const input = $('quick-title');
    const text = input.value;
    input.value = '';
    openTaskDialog(null, text);
  });

  $('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title: $('f-title').value, desc: $('f-desc').value, priority: $('f-priority').value,
      status: $('f-status').value, due: $('f-due').value
    };
    const ok = editingId ? updateTask(editingId, data) : addTask(data);
    if (ok) taskDialog.close();
    else { $('f-title').value = ''; $('f-title').focus(); }
  });

  document.querySelectorAll('#task-dialog .chip').forEach(chip => chip.addEventListener('click', () => {
    const d = new Date(); d.setDate(d.getDate() + Number(chip.dataset.offset));
    $('f-due').value = toISODate(d);
  }));

  document.querySelectorAll('dialog').forEach(dlg => {
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // klik latar menutup
    dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  });

  $('name-btn').addEventListener('click', () => {
    $('f-name').value = $('user-name').textContent === 'Kamu' ? '' : $('user-name').textContent;
    nameDialog.showModal();
    $('f-name').focus();
  });

  $('name-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('f-name').value.trim();
    if (!name) return;
    try { localStorage.setItem(NAME_KEY, name); } catch (err) { /* abaikan */ }
    applyName(name);
    nameDialog.close();
  });

  pills.forEach(p => p.addEventListener('click', () => {
    currentFilter = p.dataset.filter;
    view = currentFilter === 'all' ? (view === 'home' ? 'home' : 'all') : currentFilter;
    render();
  }));

  navItems.forEach(n => n.addEventListener('click', () => {
    view = n.dataset.view;
    currentFilter = view === 'progress' ? 'progress' : view === 'done' ? 'done' : 'all';
    setSidebar(false);
    render();
  }));

  searchInput.addEventListener('input', () => { searchQuery = searchInput.value.trim().toLowerCase(); render(); });
  sortSelect.addEventListener('change', () => { sortMode = sortSelect.value; render(); });
  clearBtn.addEventListener('click', clearDone);
  toastUndo.addEventListener('click', undo);
  $('menu-btn').addEventListener('click', () => setSidebar(true));
  scrim.addEventListener('click', () => setSidebar(false));

  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* abaikan */ }
  });

  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !taskDialog.open) { e.preventDefault(); searchInput.focus(); }
  });

  fillIcons();
  initTheme();
  initName();
  render();
})();
