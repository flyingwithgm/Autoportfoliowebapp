/* AutoPortfolio Pro – final vanilla JS */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const debounce = (fn, wait) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  let state = JSON.parse(localStorage.getItem('portfolio')) || {
    fullName: '', professionalTitle: '', bio: '', profileImage: '',
    skills: [], education: [], experience: [], projects: [],
    contact: { github: '', linkedin: '', email: '', website: '' },
    settings: { theme: 'light', template: 'classic' }
  };

  const preview = $('#portfolio-preview');
  const templateSelect = $('#layout-style');

  init();
  function init() {
    populateForm();
    attachEvents();
    updatePreview();
    loadSuggestedSkills();
    applyTheme(state.settings.theme);
    ensureDefaults();
  }

  /* theme */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.settings.theme = theme;
    save();
  }
  function applyCustomTheme() {
    const primary = $('#custom-primary').value;
    const bg = $('#custom-bg').value;
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--white', bg);
    state.settings.theme = 'custom';
    save();
  }

  /* events */
  function attachEvents() {
    $('#portfolio-form').addEventListener('input', debounce(updatePreview, 200));
    templateSelect.addEventListener('change', updatePreview);

    /* theme buttons */
    $$('.theme-btn').forEach(btn => btn.onclick = e => {
      const theme = e.currentTarget.dataset.theme;
      if (theme === 'custom') $('#custom-theme-panel').classList.toggle('hidden');
      else { $('#custom-theme-panel').classList.add('hidden'); applyTheme(theme); }
    });
    $('#apply-custom').onclick = applyCustomTheme;

    /* skills */
    $('#add-skill-btn').onclick = addSkill;
    $('#skills-input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });
    $('#skills-tags').addEventListener('click', e => { if (e.target.classList.contains('tag-remove')) removeSkill(+e.target.dataset.idx); });

    /* add sections */
    $('#add-education-btn').onclick = () => addSection('education');
    $('#add-experience-btn').onclick = () => addSection('experience');
    $('#add-project-btn').onclick = () => addSection('project');

    /* remove buttons (delegated) */
    $$('#education-container, #experience-container, #projects-container').forEach(container => {
      container.addEventListener('click', e => {
        const btn = e.target.closest('.remove-btn');
        if (!btn) return;
        const type = btn.classList.contains('remove-education') ? 'education' :
                     btn.classList.contains('remove-experience') ? 'experience' : 'project';
        const idx = +btn.dataset.idx;
        state[type + 's'].splice(idx, 1);
        renderSection(type);
        updatePreview();
        save();
      });
    });

    /* image + action buttons */
    $('#profile-image-upload').addEventListener('change', handleUpload);
    $('#profile-image-url').addEventListener('input', handleImageUrl);
    $('#reset-btn').onclick = reset;
    $('#save-btn').onclick = save;
    $('#export-json-btn').onclick = exportJSON;
    $('#download-btn').onclick = downloadHTML;
    $('#print-btn').onclick = () => window.print();
    $('#json-import').addEventListener('change', importJSON);
  }

  /* skills */
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
  function removeSkill(idx) {
    state.skills.splice(idx, 1);
    renderSkills();
    updatePreview();
    save();
  }
  function renderSkills() {
    $('#skills-tags').innerHTML = state.skills.map((sk, i) =>
      `<span class="tag">${sk}<button class="tag-remove" data-idx="${i}"><i class="fas fa-times"></i></button></span>`
    ).join('');
  }
  function rememberSkill(skill) {
    const list = JSON.parse(localStorage.getItem('suggested-skills') || '[]');
    if (!list.includes(skill)) { list.push(skill); localStorage.setItem('suggested-skills', JSON.stringify(list)); loadSuggestedSkills(); }
  }
  function loadSuggestedSkills() {
    $('#skills-datalist').innerHTML = JSON.parse(localStorage.getItem('suggested-skills') || '[]').map(s => `<option value="${s}">`).join('');
  }

  /* sections */
  function addSection(type) {
    const item = type === 'education' ? { school: '', degree: '', year: '' } :
                 type === 'experience' ? { company: '', role: '', year: '', description: '' } :
                 { title: '', description: '', link: '' };
    state[type + 's'].push(item);
    renderSection(type);
    updatePreview();
    save();
  }
  function renderSection(type) {
    const container = $(`#${type}s-container`);
    container.innerHTML = state[type + 's'].map((item, i) => `
      <div class="${type}-item">
        ${type === 'education' ? `
          <div class="form-row">
            <input class="education-school" placeholder="School" value="${item.school}">
            <input class="education-degree" placeholder="Degree" value="${item.degree}">
            <input class="education-year" placeholder="Year" value="${item.year}">
          </div>
        ` : ''}
        ${type === 'experience' ? `
          <div class="form-row">
            <input class="experience-company" placeholder="Company" value="${item.company}">
            <input class="experience-role" placeholder="Role" value="${item.role}">
            <input class="experience-year" placeholder="Year" value="${item.year}">
          </div>
          <textarea class="experience-description" placeholder="Description">${item.description}</textarea>
        ` : ''}
        ${type === 'project' ? `
          <div class="form-row">
            <input class="project-title" placeholder="Title" value="${item.title}">
            <input class="project-link" placeholder="https://..." value="${item.link}">
          </div>
          <textarea class="project-description" placeholder="Description">${item.description}</textarea>
        ` : ''}
        <button type="button" class="btn remove-btn remove-${type}" data-idx="${i}"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');
  }
  function ensureDefaults() {
    if (state.education.length === 0) addSection('education');
    if (state.experience.length === 0) addSection('experience');
    if (state.projects.length === 0) addSection('project');
  }

  /* preview */
  function updatePreview() {
    readFormToState();
    const tpl = templateSelect.value;
    preview.innerHTML = templates[tpl](state);
  }
  const templates = {
    classic: s => `
      <div class="portfolio-header">
        ${s.profileImage ? `<img src="${s.profileImage}" class="profile-image">` : '<div class="profile-image empty"><i class="fas fa-user"></i></div>'}
        <h1>${s.fullName || 'Your Name'}</h1>
        <h2>${s.professionalTitle || 'Professional Title'}</h2>
      </div>
      ${s.bio ? `<div class="section-title">About Me</div><p>${s.bio}</p>` : ''}
      ${s.skills.length ? `<div class="section-title">Skills</div><div class="skills-list">${s.skills.map(sk => `<span class="skill-tag">${sk}</span>`).join('')}</div>` : ''}
      ${s.education.length ? `<div class="section-title">Education</div>${s.education.map(e => `<div class="timeline-item"><h3>${e.school}</h3><div class="date">${e.degree} | ${e.year}</div></div>`).join('')}` : ''}
      ${s.experience.length ? `<div class="section-title">Work Experience</div>${s.experience.map(e => `<div class="timeline-item"><h3>${e.role} at ${e.company}</h3><div class="date">${e.year}</div><p>${e.description}</p></div>`).join('')}` : ''}
      ${s.projects.length ? `<div class="section-title">Projects</div><div class="projects-grid">${s.projects.map(p => `<div class="project-card"><h3>${p.title}</h3><p>${p.description}</p>${p.link ? `<a href="${p.link}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> View Project</a>` : ''}</div>`).join('')}</div>` : ''}
      ${(s.contact.github || s.contact.linkedin || s.contact.email || s.contact.website) ? `<div class="section-title">Contact</div><div class="contact-list">${Object.entries(s.contact).filter(([,v])=>v).map(([k,v])=>`<div class="contact-item"><i class="fab fa-${k==='email'?'envelope':k}"></i><a href="${k==='email'?'mailto':''}${v}" target="_blank">${k.charAt(0).toUpperCase() + k.slice(1)}</a></div>`).join('')}</div>` : ''}
    `,
    modern: s => `
      <div style="display:flex;gap:1rem;align-items:center;border-bottom:1px solid var(--gray-medium);padding-bottom:1rem">
        ${s.profileImage ? `<img src="${s.profileImage}" class="profile-image" style="width:80px;height:80px">` : ''}
        <div>
          <h1 style="margin:0">${s.fullName || 'Name'}</h1>
          <p style="margin:0;color:var(--secondary-color)">${s.professionalTitle || 'Title'}</p>
          <p style="margin:.5rem 0 0;font-size:.9rem">${s.bio}</p>
        </div>
      </div>
      ${s.skills.length ? `<p style="margin-top:1rem"><strong>Skills:</strong> ${s.skills.join(', ')}</p>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:1rem">
        <div>
          <h3>Experience</h3>${s.experience.map(e=>`<div><strong>${e.role}</strong> @ ${e.company}<br><small>${e.year}</small><br>${e.description}</div>`).join('<hr>')}
        </div>
        <div>
          <h3>Education</h3>${s.education.map(e=>`<div><strong>${e.degree}</strong> — ${e.school}<br><small>${e.year}</small></div>`).join('<hr>')}
          <h3 style="margin-top:1rem">Projects</h3>${s.projects.map(p=>`<div><strong>${p.title}</strong><br><small>${p.description}</small>${p.link ? `<br><a href="${p.link}" target="_blank">Link</a>` : ''}</div>`).join('<hr>')}
        </div>
      </div>
    `,
    minimal: s => `
      <h1 style="border-bottom:1px solid var(--gray-medium);padding-bottom:.5rem">${s.fullName}</h1>
      <p style="margin:.5rem 0">${s.professionalTitle} — ${s.bio}</p>
      ${s.skills.length ? `<p><strong>Skills:</strong> ${s.skills.join(', ')}</p>` : ''}
      <h3>Experience</h3><ul>${s.experience.map(e=>`<li><strong>${e.role}</strong> @ ${e.company} (${e.year})<br>${e.description}</li>`).join('')}</ul>
      <h3>Education</h3><ul>${s.education.map(e=>`<li>${e.degree} — ${e.school} (${e.year})</li>`).join('')}</ul>
      <h3>Projects</h3><ul>${s.projects.map(p=>`<li><strong>${p.title}</strong> — ${p.description}${p.link ? ` <a href="${p.link}">Link</a>` : ''}</li>`).join('')}</ul>
    `
  };

  /* form ↔ state */
  function readFormToState() {
    state.fullName = $('#full-name').value;
    state.professionalTitle = $('#professional-title').value;
    state.bio = $('#bio').value;
    state.contact = { github: $('#github').value, linkedin: $('#linkedin').value, email: $('#email').value, website: $('#website').value };
    state.education = $$('.education-item').map(el => ({
      school: $('.education-school', el).value,
      degree: $('.education-degree', el).value,
      year: $('.education-year', el).value
    }));
    state.experience = $$('.experience-item').map(el => ({
      company: $('.experience-company', el).value,
      role: $('.experience-role', el).value,
      year: $('.experience-year', el).value,
      description: $('.experience-description', el).value
    }));
    state.projects = $$('.project-item').map(el => ({
      title: $('.project-title', el).value,
      description: $('.project-description', el).value,
      link: $('.project-link', el).value
    }));
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

  /* image */
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

  /* storage helpers */
  function save() { localStorage.setItem('portfolio', JSON.stringify(state)); }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'portfolio.json'; a.click();
  }
  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
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
<body data-theme="${state.settings.theme}">${templates[tpl](state)}</body>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${state.fullName || 'portfolio'}.html`; a.click();
  }
  function reset() {
    if (!confirm('Reset everything?')) return;
    localStorage.removeItem('portfolio');
    location.reload();
  }
})();
