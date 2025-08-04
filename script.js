(() => {
  // Utility functions
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const debounce = (fn, wait) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  // State management
  let state = JSON.parse(localStorage.getItem('portfolio')) || {
    fullName: '', professionalTitle: '', bio: '', profileImage: '',
    skills: [], education: [], experience: [], projects: [],
    contact: { github: '', linkedin: '', email: '', website: '' },
    settings: { theme: 'light', template: 'classic' }
  };

  // DOM elements
  const preview = $('#portfolio-preview');
  const templateSelect = $('#layout-style');

  // Initialize app
  init();
  
  function init() {
    validateLocalStorage();
    populateForm();
    attachEvents();
    updatePreview();
    loadSuggestedSkills();
    applyTheme(state.settings.theme);
    ensureDefaults();
    initSocialSharing();
  }

  // Theme functions
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

  // Event handlers
  function attachEvents() {
    // Form input handling
    $('#portfolio-form').addEventListener('input', debounce(updatePreview, 200));
    $('#portfolio-form').addEventListener('submit', (e) => e.preventDefault());
    
    // Theme buttons
    $$('.theme-btn').forEach(btn => btn.onclick = e => {
      const theme = e.currentTarget.dataset.theme;
      if (theme === 'custom') $('#custom-theme-panel').classList.toggle('hidden');
      else { $('#custom-theme-panel').classList.add('hidden'); applyTheme(theme); }
    });
    $('#apply-custom').onclick = applyCustomTheme;

    // Skills management
    $('#add-skill-btn').onclick = addSkill;
    $('#skills-input').addEventListener('keydown', e => { 
      if (e.key === 'Enter') { e.preventDefault(); addSkill(); } 
    });
    $('#skills-tags').addEventListener('click', e => { 
      if (e.target.classList.contains('tag-remove')) removeSkill(+e.target.dataset.idx); 
    });

    // Section management
    $('#add-education-btn').onclick = () => addSection('education');
    $('#add-experience-btn').onclick = () => addSection('experience');
    $('#add-project-btn').onclick = () => addSection('project');

    // Remove buttons (delegated)
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

    // Image handling
    $('#profile-image-upload').addEventListener('change', handleUpload);
    $('#profile-image-url').addEventListener('input', handleImageUrl);

    // Action buttons
    $('#reset-btn').onclick = reset;
    $('#save-btn').onclick = save;
    $('#export-json-btn').onclick = exportJSON;
    $('#import-json-btn').onclick = () => $('#json-import').click();
    $('#download-btn').onclick = downloadHTML;
    $('#pdf-btn').onclick = generatePDF;
    $('#print-btn').onclick = () => window.print();
    $('#json-import').addEventListener('change', importJSON);
    
    // Layout change
    templateSelect.addEventListener('change', updatePreview);
    
    // Form validation
    $('#full-name').addEventListener('blur', validateRequiredField);
    $('#professional-title').addEventListener('blur', validateRequiredField);
    $('#bio').addEventListener('blur', validateRequiredField);
  }

  // Social sharing
  function initSocialSharing() {
    $('#share-btn').onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: `${state.fullName || 'My'} Portfolio`,
          text: `Check out ${state.fullName || 'my'} professional portfolio`,
          url: window.location.href
        }).catch(err => trackError(err, { context: 'Sharing failed' }));
      } else {
        // Fallback for browsers without Web Share API
        const url = `mailto:?subject=${encodeURIComponent(state.fullName + "'s Portfolio")}&body=${encodeURIComponent('Check out this portfolio: ' + window.location.href)}`;
        window.open(url, '_blank');
      }
    };
  }

  // Skills functions
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
      `<span class="tag">${sk}<button class="tag-remove" data-idx="${i}" aria-label="Remove skill"><i class="fas fa-times"></i></button></span>`
    ).join('');
  }
  
  function rememberSkill(skill) {
    const list = JSON.parse(localStorage.getItem('suggested-skills') || '[]');
    if (!list.includes(skill)) { 
      list.push(skill); 
      localStorage.setItem('suggested-skills', JSON.stringify(list)); 
      loadSuggestedSkills(); 
    }
  }
  
  function loadSuggestedSkills() {
    $('#skills-datalist').innerHTML = JSON.parse(localStorage.getItem('suggested-skills') || '[]')
      .map(s => `<option value="${s}">`).join('');
  }

  // Section management
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
            <input class="education-school" placeholder="School" value="${item.school}" aria-label="School name">
            <input class="education-degree" placeholder="Degree" value="${item.degree}" aria-label="Degree">
            <input class="education-year" placeholder="Year" value="${item.year}" aria-label="Year">
          </div>
        ` : ''}
        ${type === 'experience' ? `
          <div class="form-row">
            <input class="experience-company" placeholder="Company" value="${item.company}" aria-label="Company name">
            <input class="experience-role" placeholder="Role" value="${item.role}" aria-label="Role">
            <input class="experience-year" placeholder="Year" value="${item.year}" aria-label="Year">
          </div>
          <textarea class="experience-description" placeholder="Description" aria-label="Job description">${item.description}</textarea>
        ` : ''}
        ${type === 'project' ? `
          <div class="form-row">
            <input class="project-title" placeholder="Title" value="${item.title}" aria-label="Project title">
            <input class="project-link" placeholder="https://..." value="${item.link}" type="url" aria-label="Project URL">
          </div>
          <textarea class="project-description" placeholder="Description" aria-label="Project description">${item.description}</textarea>
        ` : ''}
        <button type="button" class="btn remove-btn remove-${type}" data-idx="${i}" aria-label="Remove ${type}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  }
  
  function ensureDefaults() {
    if (state.education.length === 0) addSection('education');
    if (state.experience.length === 0) addSection('experience');
    if (state.projects.length === 0) addSection('project');
  }

  // Preview generation
  function updatePreview() {
    if (validateForm()) {
      readFormToState();
      const tpl = templateSelect.value;
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        // Create off-DOM fragment for rendering
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templates[tpl](state);
        
        // Lazy load images
        tempDiv.querySelectorAll('img').forEach(img => {
          img.loading = 'lazy';
          img.decoding = 'async';
        });
        
        fragment.appendChild(tempDiv);
        preview.innerHTML = '';
        preview.appendChild(fragment);
      });
    }
  }
  
  const templates = {
    classic: s => `
      <div class="portfolio-header">
        ${s.profileImage ? `<img src="${s.profileImage}" class="profile-image" alt="Profile picture" loading="lazy">` : 
          '<div class="profile-image empty"><i class="fas fa-user"></i></div>'}
        <h1>${s.fullName || 'Your Name'}</h1>
        <h2>${s.professionalTitle || 'Professional Title'}</h2>
      </div>
      ${s.bio ? `<div class="section-title">About Me</div><p>${s.bio}</p>` : ''}
      ${s.skills.length ? `<div class="section-title">Skills</div><div class="skills-list">${
        s.skills.map(sk => `<span class="skill-tag">${sk}</span>`).join('')}</div>` : ''}
      ${s.education.length ? `<div class="section-title">Education</div>${
        s.education.map(e => `<div class="timeline-item"><h3>${e.school}</h3><div class="date">${e.degree} | ${e.year}</div></div>`).join('')}` : ''}
      ${s.experience.length ? `<div class="section-title">Work Experience</div>${
        s.experience.map(e => `<div class="timeline-item"><h3>${e.role} at ${e.company}</h3><div class="date">${e.year}</div><p>${e.description}</p></div>`).join('')}` : ''}
      ${s.projects.length ? `<div class="section-title">Projects</div><div class="projects-grid">${
        s.projects.map(p => `<div class="project-card"><h3>${p.title}</h3><p>${p.description}</p>${
          p.link ? `<a href="${p.link}" class="project-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> View Project</a>` : ''}</div>`).join('')}</div>` : ''}
      ${(s.contact.github || s.contact.linkedin || s.contact.email || s.contact.website) ? 
        `<div class="section-title">Contact</div><div class="contact-list">${
          Object.entries(s.contact).filter(([,v]) => v).map(([k,v]) => 
            `<div class="contact-item"><i class="fab fa-${k==='email'?'envelope':k}"></i><a href="${
              k==='email'?'mailto':''}${v}" target="_blank" rel="noopener noreferrer">${
              k.charAt(0).toUpperCase() + k.slice(1)}</a></div>`).join('')}</div>` : ''}
    `,
    modern: s => `
      <div style="display:flex;gap:1rem;align-items:center;border-bottom:1px solid var(--gray-medium);padding-bottom:1rem">
        ${s.profileImage ? `<img src="${s.profileImage}" class="profile-image" style="width:80px;height:80px" alt="Profile picture" loading="lazy">` : ''}
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
          <h3 style="margin-top:1rem">Projects</h3>${s.projects.map(p=>`<div><strong>${p.title}</strong><br><small>${p.description}</small>${p.link ? `<br><a href="${p.link}" target="_blank" rel="noopener noreferrer">Link</a>` : ''}</div>`).join('<hr>')}
        </div>
      </div>
    `,
    minimal: s => `
      <h1 style="border-bottom:1px solid var(--gray-medium);padding-bottom:.5rem">${s.fullName}</h1>
      <p style="margin:.5rem 0">${s.professionalTitle} — ${s.bio}</p>
      ${s.skills.length ? `<p><strong>Skills:</strong> ${s.skills.join(', ')}</p>` : ''}
      <h3>Experience</h3><ul>${s.experience.map(e=>`<li><strong>${e.role}</strong> @ ${e.company} (${e.year})<br>${e.description}</li>`).join('')}</ul>
      <h3>Education</h3><ul>${s.education.map(e=>`<li>${e.degree} — ${e.school} (${e.year})</li>`).join('')}</ul>
      <h3>Projects</h3><ul>${s.projects.map(p=>`<li><strong>${p.title}</strong> — ${p.description}${p.link ? ` <a href="${p.link}" target="_blank" rel="noopener noreferrer">Link</a>` : ''}</li>`).join('')}</ul>
    `
  };

  // Form ↔ State synchronization
  function readFormToState() {
    state.fullName = $('#full-name').value;
    state.professionalTitle = $('#professional-title').value;
    state.bio = $('#bio').value;
    state.contact = { 
      github: $('#github').value, 
      linkedin: $('#linkedin').value, 
      email: $('#email').value, 
      website: $('#website').value 
    };
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

  // Image handling
  function handleImageUrl() {
    const url = $('#profile-image-url').value;
    if (url) {
      // Basic URL validation
      try {
        new URL(url);
        state.profileImage = url;
        updateImagePreview(url);
        save();
      } catch (e) {
        console.error('Invalid URL');
        updateImagePreview('');
      }
    } else {
      state.profileImage = '';
      updateImagePreview('');
      save();
    }
  }
  
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or GIF image');
      return;
    }
    
    if (file.size > maxSize) {
      alert('Image must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = ev => { 
      state.profileImage = ev.target.result; 
      updateImagePreview(state.profileImage); 
      save(); 
    };
    reader.onerror = () => {
      alert('Error reading image file');
      updateImagePreview('');
    };
    reader.readAsDataURL(file);
  }
  
  function updateImagePreview(src) {
    const box = $('#image-preview');
    box.innerHTML = '<div class="loading-spinner"></div>';
    box.classList.remove('empty', 'error');

    if (!src) {
      box.classList.add('empty');
      box.innerHTML = '<i class="fas fa-user"></i>';
      return;
    }

    const img = new Image();
    img.onload = () => {
      box.innerHTML = `<img src="${src}" alt="Profile preview">`;
    };
    img.onerror = () => {
      box.classList.add('error');
      box.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error loading image';
    };
    img.src = src;
  }

  // Storage helpers
  function save() { 
    if (!validateForm()) return;
    
    readFormToState();
    localStorage.setItem('portfolio', JSON.stringify(state));
    
    // Show save indicator
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.textContent = 'Saved!';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.classList.add('fade-out');
      setTimeout(() => indicator.remove(), 500);
    }, 1000);
  }
  
  function exportJSON() {
    if (!validateForm()) return;
    
    readFormToState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `${state.fullName || 'portfolio'}.json`; 
    a.click();
  }
  
  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = ev => { 
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported && typeof imported === 'object') {
          state = imported;
          populateForm(); 
          updatePreview(); 
          save();
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (err) {
        alert('Error importing JSON: ' + err.message);
        trackError(err, { context: 'JSON import failed' });
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
  }
  
  function downloadHTML() {
    if (!validateForm()) return;
    
    readFormToState();
    const tpl = templateSelect.value;
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.fullName || 'Portfolio'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    ${[...document.styleSheets].map(sheet => {
      try {
        return [...sheet.cssRules].map(rule => rule.cssText).join('\n');
      } catch (e) {
        return '';
      }
    }).join('\n')}
  </style>
</head>
<body data-theme="${state.settings.theme}">
${templates[tpl](state)}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = `${state.fullName || 'portfolio'}.html`; 
    a.click();
  }
  
  function generatePDF() {
    if (!validateForm()) return;
    
    readFormToState();
    const opt = {
      margin: 10,
      filename: `${state.fullName || 'portfolio'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Create a temporary div with print-optimized content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = templates['classic'](state);
    tempDiv.classList.add('print-optimized');
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      .print-optimized {
        font-size: 12pt;
        line-height: 1.5;
      }
      .print-optimized a::after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
      }
      @page { margin: 2cm; }
    `;
    tempDiv.appendChild(style);
    
    document.body.appendChild(tempDiv);
    html2pdf().from(tempDiv).set(opt).save();
    document.body.removeChild(tempDiv);
  }
  
  function reset() {
    if (!confirm('Are you sure you want to reset everything? This cannot be undone.')) return;
    localStorage.removeItem('portfolio');
    location.reload();
  }

  // Validation
  function validateForm() {
    let isValid = true;
    
    // Required fields
    if (!$('#full-name').value.trim()) {
      showError('name-error', 'Full name is required');
      isValid = false;
    } else {
      hideError('name-error');
    }
    
    if (!$('#professional-title').value.trim()) {
      showError('title-error', 'Professional title is required');
      isValid = false;
    } else {
      hideError('title-error');
    }
    
    if (!$('#bio').value.trim()) {
      showError('bio-error', 'Bio is required');
      isValid = false;
    } else {
      hideError('bio-error');
    }
    
    return isValid;
  }
  
  function validateRequiredField(e) {
    const field = e.target;
    const errorId = field.id + '-error';
    
    if (!field.value.trim()) {
      showError(errorId, 'This field is required');
    } else {
      hideError(errorId);
    }
  }
  
  function showError(id, message) {
    const errorEl = $(`#${id}`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      errorEl.setAttribute('role', 'alert');
    }
  }
  
  function hideError(id) {
    const errorEl = $(`#${id}`);
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.removeAttribute('role');
    }
  }
  
  function validateLocalStorage() {
    try {
      const stored = localStorage.getItem('portfolio');
      if (stored) JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem('portfolio');
      state = {
        fullName: '', professionalTitle: '', bio: '', profileImage: '',
        skills: [], education: [], experience: [], projects: [],
        contact: { github: '', linkedin: '', email: '', website: '' },
        settings: { theme: 'light', template: 'classic' }
      };
      trackError(e, { context: 'LocalStorage validation failed' });
    }
  }

  // Error tracking
  function trackError(error, context = {}) {
    if (typeof ga !== 'undefined') {
      ga('send', 'exception', {
        exDescription: error.message,
        exFatal: false,
        ...context
      });
    }
    console.error('Error:', error, 'Context:', context);
  }
})();
