/* AutoPortfolio Pro 2.0 – vanilla JS */
(() => {
  /* ---------- dom shortcuts ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- state ---------- */
  let state = JSON.parse(localStorage.getItem('portfolio')) || {
    fullName: '', professionalTitle: '', bio: '', profileImage: null,
    skills: [], education: [], experience: [], projects: [],
    contact: { github: '', linkedin: '', email: '', website: '' },
    settings: { theme: 'light', template: 'classic' }
  };

  /* ---------- elements ---------- */
  const form = $('#portfolio-form');
  const preview = $('#portfolio-preview');
  const templateSelect = $('#template-style');
  const themeBtns = $$('.theme-btn');
  const customPanel = $('#custom-theme-panel');
  const customPrimary = $('#custom-primary');
  const customBg = $('#custom-bg');

  /* ---------- init ---------- */
  init();
  function init() {
    populateForm();
    attachEvents();
    updatePreview();
    loadSuggestedSkills();
    applyTheme(state.settings.theme);
    enableSortables();
  }

  /* ---------- events ---------- */
  function attachEvents() {
    form.addEventListener('input', debounce(updatePreview, 200));
    templateSelect.addEventListener('change', updatePreview);
    themeBtns.forEach(btn => btn.onclick = e => {
      const theme = e.currentTarget.dataset.theme;
      if (theme === 'custom') customPanel.classList.remove('hidden');
      else { customPanel.classList.add('hidden'); applyTheme(theme); }
    });
    $('#apply-custom').onclick = () => applyCustomTheme();
    $('#add-skill-btn').onclick = addSkill;
    $('#skills-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });
    $('#add-education-btn').onclick = () => addSection('education');
    $('#add-experience-btn').onclick = () => addSection('experience');
    $('#add-project-btn').onclick = () => addSection('project');
    $$('.sortable').forEach(enableSortables);
    $('#save-btn').onclick = save;
    $('#export-json-btn').onclick = exportJSON;
    $('#download-btn').onclick = downloadHTML;
    $('#print-btn').onclick = () => window.print();
    $('#reset-btn').onclick = reset;
    $('#json-import').addEventListener('change', importJSON);
    $('#profile-image-upload').addEventListener('change', handleUpload);
    $('#profile-image-url').addEventListener('input', handleImageUrl);
  }

  /* ---------- theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.settings.theme = theme;
    save();
  }
  function applyCustomTheme() {
    document.documentElement.style.setProperty('--primary-color', customPrimary.value);
    document.documentElement.style.setProperty('--white', customBg.value);
    state.settings.theme = 'custom';
    save();
  }

  /* ---------- skills ---------- */
  function addSkill() {
    const val = $('#skills-input').value.trim();
    if (val && !state.skills.includes(val)) {
      state.skills.push(val);
      $('#skills-input').value = '';
      rememberSkill(val);
      renderSkills();
      updatePreview();
      save();
    }
  }
  function renderSkills() {
    const box = $('#skills-tags');
    box.innerHTML = '';
    state.skills.forEach((skill, idx) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.draggable = true;
      tag.innerHTML = `${skill}<button class="tag-remove" data-idx="${idx}">&times;</button>`;
      tag.querySelector('button').onclick = () => { state.skills.splice(idx, 1); renderSkills(); updatePreview(); save(); };
      box.appendChild(tag);
    });
  }
  function rememberSkill(skill) {
    const arr = JSON.parse(localStorage.getItem('suggested-skills') || '[]');
    if (!arr.includes(skill)) { arr.push(skill); localStorage.setItem('suggested-skills', JSON.stringify(arr)); loadSuggestedSkills(); }
  }
  function loadSuggestedSkills() {
    const skills = JSON.parse(localStorage.getItem('suggested-skills') || '[]');
    const dl = $('#skills-datalist');
    dl.innerHTML = skills.map(s => `<option value="${s}">`).join('');
  }

  /* ---------- sections ---------- */
  const templates = {
    education: () => ({ school: '', degree: '', year: '' }),
    experience: () => ({ company: '', role: '', year: '', description: '' }),
    project: () => ({ title: '', description: '', link: '' })
  };
  function addSection(type) {
    state[type + 's'].push(templates[type]());
    renderSection(type);
    updatePreview();
    save();
  }
  function renderSection(type) {
    const container = $(`#${type}s-container`);
    container.innerHTML = '';
    state[type + 's'].forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `${type}-item sort-item`;
      div.draggable = true;
      div.innerHTML = `
        ${type === 'education' ? `
          <div class="form-row">
            <input class="school" placeholder="School" value="${item.school}">
            <input class="degree" placeholder="Degree" value="${item.degree}">
            <input class="year" placeholder="Year" value="${item.year}">
          </div>
        ` : ''}
        ${type === 'experience' ? `
          <div class="form-row">
            <input class="company" placeholder="Company" value="${item.company}">
            <input class="role" placeholder="Role" value="${item.role}">
            <input class="year" placeholder="Year" value="${item.year}">
          </div>
          <textarea class="description" placeholder="Description">${item.description}</textarea>
        ` : ''}
        ${type === 'project' ? `
          <div class="form-row">
            <input class="title" placeholder="Title" value="${item.title}">
            <input class="link" placeholder="https://..." value="${item.link}">
          </div>
          <textarea class="description" placeholder="Description">${item.description}</textarea>
        ` : ''}
        <button type="button" class="remove-btn" data-type="${type}" data-idx="${idx}">&times;</button>
      `;
      container.appendChild(div);
    });
    $$('.remove-btn').forEach(btn => btn.onclick = e => {
      const { type, idx } = e.target.dataset;
      state[type + 's'].splice(idx, 1);
      renderSection(type);
      updatePreview();
      save();
    });
    enableSortables(container);
  }

  /* ---------- drag sort ---------- */
  function enableSortables(container) {
    container = container instanceof Event ? container.target : container;
    if (!container.classList.contains('sortable')) return;
    new Sortable(container, {
      animation: 150,
      onEnd: e => {
        const arr = state[e.target.dataset.arr || e.target.id.split('-')[0]];
        const moved = arr.splice(e.oldIndex, 1)[0];
        arr.splice(e.newIndex, 0, moved);
        updatePreview();
        save();
      }
    });
  }

  /* ---------- preview ---------- */
  function updatePreview() {
    readFormToState();
    const tpl = templateSelect.value;
    preview.innerHTML = templatesCompiled[tpl](state);
  }
  const templatesCompiled = {
    classic: (s) => classicTpl(s),
    modern: (s) => modernTpl(s),
    minimal: (s) => minimalTpl(s)
  };
  function classicTpl(s) {
    return `
      <div class="portfolio-header">
        ${s.profileImage ? `<img src="${s.profileImage}" class="profile-image">` : '<div class="profile-image empty"><i class="fas fa-user"></i></div>'}
        <h1>${s.fullName || 'Your Name'}</h1>
        <h2>${s.professionalTitle || 'Title'}</h2>
      </div>
      ${s.bio ? `<div class="section-title">About</div><p>${s.bio}</p>` : ''}
      ${s.skills.length ? `<div class="section-title">Skills</div><div class="skills-list">${s.skills.map(sk => `<span class="skill-tag">${sk}</span>`).join('')}</div>` : ''}
      ${s.education.length ? `<div class="section-title">Education</div>${s.education.map(e => `<div class="timeline-item"><h3>${e.school}</h3><div class="date">${e.degree} | ${e.year}</div></div>`).join('')}` : ''}
      ${s.experience.length ? `<div class="section-title">Experience</div>${s.experience.map(e => `<div class="timeline-item"><h3>${e.role} @ ${e.company}</h3><div class="date">${e.year}</div><p>${e.description}</p></div>`).join('')}` : ''}
      ${s.projects.length ? `<div class="section-title">Projects</div><div class="projects-grid">${s.projects.map(p => `<div class="project-card"><h3>${p.title}</h3><p>${p.description}</p>${p.link ? `<a href="${p.link}" target="_blank" class="project-link">View →</a>` : ''}</div></div>`).join('')}` : ''}
      ${(s.contact.github || s.contact.linkedin || s.contact.email || s.contact.website) ? `<div class="section-title">Contact</div><div class="contact-list">${Object.entries(s.contact).filter(([k,v])=>v).map(([k,v])=>`<div class="contact-item"><i class="fab fa-${k==='email'?'envelope':k}"></i><a href="${k==='email'?'mailto:':''}${v}">${k}</a></div>`).join('')}</div>` : ''}
    `;
  }
  function modernTpl(s) {
    return `
      <div class="portfolio-header" style="display:flex;gap:1rem;align-items:center;">
        ${s.profileImage ? `<img src="${s.profileImage}" class="profile-image" style="width:80px;height:80px;">` : ''}
        <div>
          <h1 style="margin:0">${s.fullName}</h1>
          <h2 style="margin:0;font-size:1rem;color:var(--secondary)">${s.professionalTitle}</h2>
          <p style="margin:.25rem 0 0;font-size:.9rem;">${s.bio}</p>
        </div>
      </div>
      <hr>
      ${s.skills.length ? `<div class="skills-list" style="margin-bottom:1rem">${s.skills.map(sk=>`<span class="skill-tag">${sk}</span>`).join('')}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:1rem">
        <div>
          <div class="section-title">Experience</div>
          ${s.experience.map(e=>`<div><strong>${e.role}</strong> @ ${e.company}<br><small>${e.year}</small><br>${e.description}</div>`).join('<hr>')}
        </div>
        <div>
          <div class="section-title">Education</div>
          ${s.education.map(e=>`<div><strong>${e.degree}</strong> — ${e.school}<br><small>${e.year}</small></div>`).join('<hr>')}
          <div class="section-title" style="margin-top:1rem">Projects</div>
          ${s.projects.map(p=>`<div><strong>${p.title}</strong><br><small>${p.description}</small>${p.link ? `<br><a href="${p.link}" target="_blank">Link</a>` : ''}</div>`).join('<hr>')}
        </div>
      </div>
    `;
  }
  function minimalTpl(s) {
    return `
      <div class="portfolio-header" style="border-bottom:1px solid var(--gray);padding-bottom:1rem">
        <h1 style="margin:0">${s.fullName}</h1>
        <p style="margin:0;color:var(--secondary)">${s.professionalTitle}</p>
      </div>
      <div style="margin:1rem 0">${s.bio}</div>
      ${s.skills.length ? `<p><strong>Skills:</strong> ${s.skills.join(', ')}</p>` : ''}
      ${s.experience.length ? `<h3>Experience</h3><ul>${s.experience.map(e=>`<li><strong>${e.role}</strong> @ ${e.company} (${e.year})<br>${e.description}</li>`).join('')}</ul>` : ''}
      ${s.education.length ? `<h3>Education</h3><ul>${s.education.map(e=>`<li>${e.degree} — ${e.school} (${e.year})</li>`).join('')}</ul>` : ''}
      ${s.projects.length ? `<h3>Projects</h3><ul>${s.projects.map(p=>`<li><strong>${p.title}</strong> — ${p.description}${p.link ? ` <a href="${p.link}">Link</a>` : ''}</li>`).join('')}</ul>` : ''}
    `;
  }

  /* ---------- helpers ---------- */
  function readFormToState() {
    state.fullName = $('#full-name').value;
    state.professionalTitle = $('#professional-title').value;
    state.bio = $('#bio').value;
    state.contact = { github: $('#github').value, linkedin: $('#linkedin').value, email: $('#email').value, website: $('#website').value };
    $$('.education-item').forEach((el, idx) => {
      state.education[idx] = { school: $('.school', el).value, degree: $('.degree', el).value, year: $('.year', el).value };
    });
    $$('.experience-item').forEach((el, idx) => {
      state.experience[idx] = { company: $('.company', el).value, role: $('.role', el).value, year: $('.year', el).value, description: $('.description', el).value };
    });
    $$('.project-item').forEach((el, idx) => {
      state.projects[idx] = { title: $('.title', el).value, description: $('.description', el).value, link: $('.link', el).value };
    });
  }
  function populateForm() {
    $('#full-name').value = state.fullName;
    $('#professional-title').value = state.professionalTitle;
    $('#bio').value = state.bio;
    $('#github').value = state.contact.github;
    $('#linkedin').value = state.contact.linkedin;
    $('#email').value = state.contact.email;
    $('#website').value = state.contact.website;
    renderSkills();
    renderSection('education');
    renderSection('experience');
    renderSection('project');
    if (state.profileImage) updateImagePreview(state.profileImage);
  }

  /* ---------- image ---------- */
  function handleImageUrl() {
    state.profileImage = $('#profile-image-url').value;
    updateImagePreview(state.profileImage);
    save();
  }
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { state.profileImage = ev.target.result; updateImagePreview(state.profileImage); save(); };
    reader.readAsDataURL(file);
  }
  function updateImagePreview(src) {
    const box = $('#image-preview');
    box.classList.toggle('empty', !src);
    box.innerHTML = src ? `<img src="${src}">` : '<i class="fas fa-user"></i>';
  }

  /* ---------- storage ---------- */
  function save() { localStorage.setItem('portfolio', JSON.stringify(state)); }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'portfolio.json'; a.click(); URL.revokeObjectURL(url);
  }
  function importJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { state = JSON.parse(ev.target.result); populateForm(); updatePreview(); save(); };
    reader.readAsText(file);
  }
  function downloadHTML() {
    const tpl = templateSelect.value;
    const html = `<!doctype html><title>${state.fullName || 'Portfolio'}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<style>${document.querySelector('style').innerText}</style>
<body data-theme="${state.settings.theme}">${templatesCompiled[tpl](state)}</body>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${state.fullName || 'portfolio'}.html`; a.click();
  }
  function reset() {
    if (!confirm('Reset everything?')) return;
    localStorage.removeItem('portfolio');
    location.reload();
  }

  /* ---------- debounce ---------- */
  function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  /* ---------- sortable (tiny, no lib) ---------- */
  class Sortable {
    constructor(el, opts) {
      this.el = el;
      this.opts = opts;
      this.el.addEventListener('dragstart', e => { this.dragSrc = e.target; e.dataTransfer.effectAllowed = 'move'; });
      this.el.addEventListener('dragover', e => { e.preventDefault(); });
      this.el.addEventListener('drop', e => {
        e.preventDefault();
        if (e.target === this.dragSrc) return;
        const srcIdx = [...this.el.children].indexOf(this.dragSrc);
        const dstIdx = [...this.el.children].indexOf(e.target.closest('.sort-item') || e.target);
        if (this.opts.onEnd) this.opts.onEnd({ oldIndex: srcIdx, newIndex: dstIdx });
      });
    }
  }
  function enableSortables(container) {
    if (!container.classList.contains('sortable') && !container.classList.contains('sort-item')) return;
    const arr = container.id.split('-')[0];
    new Sortable(container, {
      onEnd: e => {
        const list = state[arr];
        const moved = list.splice(e.oldIndex, 1)[0];
        list.splice(e.newIndex, 0, moved);
        updatePreview();
        save();
      }
    });
  }
})();
