document.addEventListener('DOMContentLoaded', function() {
const portfolioForm = document.getElementById('portfolio-form');
const previewContainer = document.getElementById('portfolio-preview');
const themeSwitcher = document.querySelector('.theme-switcher');
const layoutStyleSelect = document.getElementById('layout-style');
const jsonImportInput = document.getElementById('json-import');
const resumeTemplateSelect = document.getElementById('resume-template');
const fullNameInput = document.getElementById('full-name');
const professionalTitleInput = document.getElementById('professional-title');
const bioInput = document.getElementById('bio');
const profileImageUrlInput = document.getElementById('profile-image-url');
const profileImageUploadInput = document.getElementById('profile-image-upload');
const imagePreview = document.getElementById('image-preview');
const skillsInput = document.getElementById('skills-input');
const addSkillBtn = document.getElementById('add-skill-btn');
const skillsTagsContainer = document.getElementById('skills-tags');
const educationContainer = document.getElementById('education-container');
const addEducationBtn = document.getElementById('add-education-btn');
const experienceContainer = document.getElementById('experience-container');
const addExperienceBtn = document.getElementById('add-experience-btn');
const projectsContainer = document.getElementById('projects-container');
const addProjectBtn = document.getElementById('add-project-btn');
const githubInput = document.getElementById('github');
const linkedinInput = document.getElementById('linkedin');
const emailInput = document.getElementById('email');
const websiteInput = document.getElementById('website');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const downloadBtn = document.getElementById('download-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const downloadDocxBtn = document.getElementById('download-docx-btn');
const downloadImgBtn = document.getElementById('download-img-btn');
const downloadMdBtn = document.getElementById('download-md-btn');
const primaryColorPicker = document.getElementById('primary-color-picker');
const secondaryColorPicker = document.getElementById('secondary-color-picker');
const fontFamilyPicker = document.getElementById('font-family-picker');
const fontSizePicker = document.getElementById('font-size-picker');
let skills = [];
let profileImage = null;
function init() {
    loadColorsFromLocalStorage();
    loadFontSettings();
    loadFromLocalStorage();
    setupEventListeners();
    setupDragAndDrop();
    setupSystemThemeListener();
    updatePreview();
    if (educationContainer.children.length === 0) addEducation();
    if (experienceContainer.children.length === 0) addExperience();
    if (projectsContainer.children.length === 0) addProject();
}
function setupEventListeners() {
    themeSwitcher.addEventListener('click', handleThemeSwitch);
    layoutStyleSelect.addEventListener('change', updatePreview);
    if (resumeTemplateSelect) {
        resumeTemplateSelect.addEventListener('change', updatePreview);
    }
    portfolioForm.addEventListener('input', debounce(updatePreview, 300));
    profileImageUrlInput.addEventListener('input', handleImageUrlInput);
    profileImageUploadInput.addEventListener('change', handleImageUpload);
    addSkillBtn.addEventListener('click', addSkill);
    skillsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    addEducationBtn.addEventListener('click', addEducation);
    addExperienceBtn.addEventListener('click', addExperience);
    addProjectBtn.addEventListener('click', addProject);
    educationContainer.addEventListener('click', handleEducationRemove);
    experienceContainer.addEventListener('click', handleExperienceRemove);
    projectsContainer.addEventListener('click', handleProjectRemove);
    resetBtn.addEventListener('click', resetForm);
    saveBtn.addEventListener('click', saveToLocalStorage);
    exportJsonBtn.addEventListener('click', exportToJson);
    downloadBtn.addEventListener('click', downloadPortfolio);
    downloadPdfBtn.addEventListener('click', downloadPortfolioPDF);
    downloadDocxBtn.addEventListener('click', downloadPortfolioDOCX);
    downloadImgBtn.addEventListener('click', downloadPortfolioImage);
    downloadMdBtn.addEventListener('click', downloadPortfolioMarkdown);
    jsonImportInput.addEventListener('change', importFromJson);
    document.addEventListener('keydown', handleKeyboardShortcuts);
    primaryColorPicker.addEventListener('input', e => {
        document.documentElement.style.setProperty('--primary-color', e.target.value);
        localStorage.setItem('portfolio-primary-color', e.target.value);
        updatePreview();
    });
    secondaryColorPicker.addEventListener('input', e => {
        document.documentElement.style.setProperty('--secondary-color', e.target.value);
        localStorage.setItem('portfolio-secondary-color', e.target.value);
        updatePreview();
    });
    fontFamilyPicker.addEventListener('change', e => {
        const font = e.target.value;
        document.body.style.fontFamily = font;
        previewContainer.style.fontFamily = font;
        document.head.insertAdjacentHTML('beforeend', `<link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;700&display=swap" rel="stylesheet">`);
        localStorage.setItem('portfolio-font-family', font);
        updatePreview();
    });
    fontSizePicker.addEventListener('input', e => {
        const size = e.target.value + 'px';
        document.body.style.fontSize = size;
        previewContainer.style.fontSize = size;
        localStorage.setItem('portfolio-font-size', size);
        updatePreview();
    });
}
function handleThemeSwitch(e) {
    if (e.target.classList.contains('theme-btn')) {
        const theme = e.target.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        updatePreview();
    }
}
function handleImageUrlInput() {
    if (profileImageUrlInput.value) {
        profileImage = profileImageUrlInput.value;
        updateImagePreview();
        updatePreview();
    }
}
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            profileImage = event.target.result;
            profileImageUrlInput.value = '';
            updateImagePreview();
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}
function handleEducationRemove(e) {
    if (e.target.classList.contains('remove-education')) {
        e.target.closest('.education-item').remove();
        updatePreview();
    }
}
function handleExperienceRemove(e) {
    if (e.target.classList.contains('remove-experience')) {
        e.target.closest('.experience-item').remove();
        updatePreview();
    }
}
function handleProjectRemove(e) {
    if (e.target.classList.contains('remove-project')) {
        e.target.closest('.project-item').remove();
        updatePreview();
    }
}
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
    }
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportToJson();
    }
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        downloadPortfolio();
    }
}
function getFormData() {
    return {
        fullName: fullNameInput.value,
        professionalTitle: professionalTitleInput.value,
        bio: bioInput.value,
        profileImage: profileImage,
        skills: [...skills],
        education: getEducationData(),
        experience: getExperienceData(),
        projects: getProjectsData(),
        contact: {
            github: githubInput.value,
            linkedin: linkedinInput.value,
            email: emailInput.value,
            website: websiteInput.value
        },
        settings: {
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            layoutStyle: layoutStyleSelect.value,
            resumeTemplate: resumeTemplateSelect ? resumeTemplateSelect.value : 'single-column',
            primaryColor: primaryColorPicker.value,
            secondaryColor: secondaryColorPicker.value,
            fontFamily: fontFamilyPicker.value,
            fontSize: fontSizePicker.value + 'px'
        }
    };
}
function getEducationData() {
    return Array.from(document.querySelectorAll('.education-item')).map(item => ({
        school: item.querySelector('.education-school').value,
        degree: item.querySelector('.education-degree').value,
        year: item.querySelector('.education-year').value
    }));
}
function getExperienceData() {
    return Array.from(document.querySelectorAll('.experience-item')).map(item => ({
        company: item.querySelector('.experience-company').value,
        role: item.querySelector('.experience-role').value,
        year: item.querySelector('.experience-year').value,
        description: item.querySelector('.experience-description').value
    }));
}
function getProjectsData() {
    return Array.from(document.querySelectorAll('.project-item')).map(item => ({
        title: item.querySelector('.project-title').value,
        description: item.querySelector('.project-description').value,
        link: item.querySelector('.project-link').value
    }));
}
function populateForm(data) {
    fullNameInput.value = data.fullName || '';
    professionalTitleInput.value = data.professionalTitle || '';
    bioInput.value = data.bio || '';
    if (data.profileImage) {
        profileImage = data.profileImage;
        if (data.profileImage.startsWith('data:')) {
            profileImageUrlInput.value = '';
        } else {
            profileImageUrlInput.value = data.profileImage;
        }
        updateImagePreview();
    }
    skills = data.skills || [];
    renderSkills();
    educationContainer.innerHTML = '';
    (data.education || []).forEach(edu => {
        addEducation();
        const lastItem = educationContainer.lastElementChild;
        lastItem.querySelector('.education-school').value = edu.school || '';
        lastItem.querySelector('.education-degree').value = edu.degree || '';
        lastItem.querySelector('.education-year').value = edu.year || '';
    });
    experienceContainer.innerHTML = '';
    (data.experience || []).forEach(exp => {
        addExperience();
        const lastItem = experienceContainer.lastElementChild;
        lastItem.querySelector('.experience-company').value = exp.company || '';
        lastItem.querySelector('.experience-role').value = exp.role || '';
        lastItem.querySelector('.experience-year').value = exp.year || '';
        lastItem.querySelector('.experience-description').value = exp.description || '';
    });
    projectsContainer.innerHTML = '';
    (data.projects || []).forEach(proj => {
        addProject();
        const lastItem = projectsContainer.lastElementChild;
        lastItem.querySelector('.project-title').value = proj.title || '';
        lastItem.querySelector('.project-description').value = proj.description || '';
        lastItem.querySelector('.project-link').value = proj.link || '';
    });
    githubInput.value = data.contact?.github || '';
    linkedinInput.value = data.contact?.linkedin || '';
    emailInput.value = data.contact?.email || '';
    websiteInput.value = data.contact?.website || '';
    if (data.settings) {
        document.documentElement.setAttribute('data-theme', data.settings.theme || 'light');
        layoutStyleSelect.value = data.settings.layoutStyle || 'grid';
        if (resumeTemplateSelect && data.settings.resumeTemplate) {
            resumeTemplateSelect.value = data.settings.resumeTemplate;
        }
        if (data.settings.primaryColor) {
            primaryColorPicker.value = data.settings.primaryColor;
            document.documentElement.style.setProperty('--primary-color', data.settings.primaryColor);
        }
        if (data.settings.secondaryColor) {
            secondaryColorPicker.value = data.settings.secondaryColor;
            document.documentElement.style.setProperty('--secondary-color', data.settings.secondaryColor);
        }
        if (data.settings.fontFamily) {
            fontFamilyPicker.value = data.settings.fontFamily;
            document.body.style.fontFamily = data.settings.fontFamily;
            previewContainer.style.fontFamily = data.settings.fontFamily;
        }
        if (data.settings.fontSize) {
            fontSizePicker.value = parseInt(data.settings.fontSize);
            document.body.style.fontSize = data.settings.fontSize;
            previewContainer.style.fontSize = data.settings.fontSize;
        }
    }
}
function addSkill() {
    const skillText = skillsInput.value.trim();
    if (skillText && !skills.includes(skillText)) {
        skills.push(skillText);
        renderSkills();
        skillsInput.value = '';
        updatePreview();
    }
}
function removeSkill(skill) {
    skills = skills.filter(s => s !== skill);
    renderSkills();
    updatePreview();
}
function renderSkills() {
    skillsTagsContainer.innerHTML = '';
    skills.forEach(skill => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML =
            `${skill}
            <button class="tag-remove" data-skill="${skill}">
                <i class="fas fa-times"></i>
            </button>`;
        skillsTagsContainer.appendChild(tag);
        tag.querySelector('.tag-remove').addEventListener('click', () => removeSkill(skill));
    });
}
function addEducation() {
    const educationItem = document.createElement('div');
    educationItem.className = 'education-item';
    educationItem.innerHTML =
        `<div class="form-row">
            <div class="form-control">
                <label>School*</label>
                <input type="text" class="education-school" required>
            </div>
            <div class="form-control">
                <label>Degree*</label>
                <input type="text" class="education-degree" required>
            </div>
            <div class="form-control">
                <label>Year*</label>
                <input type="text" class="education-year" required>
            </div>
        </div>
        <button type="button" class="btn remove-btn remove-education"><i class="fas fa-trash"></i></button>`;
    educationContainer.appendChild(educationItem);
}
function addExperience() {
    const experienceItem = document.createElement('div');
    experienceItem.className = 'experience-item';
    experienceItem.innerHTML =
        `<div class="form-row">
            <div class="form-control">
                <label>Company*</label>
                <input type="text" class="experience-company" required>
            </div>
            <div class="form-control">
                <label>Role*</label>
                <input type="text" class="experience-role" required>
            </div>
            <div class="form-control">
                <label>Year*</label>
                <input type="text" class="experience-year" required>
            </div>
        </div>
        <div class="form-control">
            <label>Description*</label>
            <textarea class="experience-description" rows="2" required></textarea>
        </div>
        <button type="button" class="btn remove-btn remove-experience"><i class="fas fa-trash"></i></button>`;
    experienceContainer.appendChild(experienceItem);
}
function addProject() {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.innerHTML =
        `<div class="form-row">
            <div class="form-control">
                <label>Title*</label>
                <input type="text" class="project-title" required>
            </div>
            <div class="form-control">
                <label>GitHub/Demo Link</label>
                <input type="text" class="project-link" placeholder="https://">
            </div>
        </div>
        <div class="form-control">
            <label>Description*</label>
            <textarea class="project-description" rows="2" required></textarea>
        </div>
        <button type="button" class="btn remove-btn remove-project"><i class="fas fa-trash"></i></button>`;
    projectsContainer.appendChild(projectItem);
}
function updatePreview() {
    const formData = getFormData();
    const layoutStyle = layoutStyleSelect.value;
    const resumeTemplate = formData.settings.resumeTemplate || 'single-column';
    previewContainer.innerHTML = generatePortfolioHTML(formData, layoutStyle, resumeTemplate);
    previewContainer.style.fontFamily = fontFamilyPicker.value;
    previewContainer.style.fontSize = fontSizePicker.value + 'px';
}
function generatePortfolioHTML(data, layoutStyle = 'grid', templateType = 'single-column') {
    switch (templateType) {
        case 'single-column':
            return generateSingleColumnTemplate(data);
        case 'two-column':
            return generateTwoColumnTemplate(data);
        case 'header-footer':
            return generateHeaderFooterTemplate(data);
        case 'split-page':
            return generateSplitPageTemplate(data);
        case 'grid':
            return generateGridTemplate(data);
        default:
            return generateSingleColumnTemplate(data);
    }
}
// ...all generate*Template functions like before...
function generateSingleColumnTemplate(data) { /* ...Your previous template code here... */ return ""; }
function generateTwoColumnTemplate(data) { return ""; }
function generateHeaderFooterTemplate(data) { return ""; }
function generateSplitPageTemplate(data) { return ""; }
function generateGridTemplate(data) { return ""; }
function saveToLocalStorage() {
    if (validateForm()) {
        const formData = getFormData();
        localStorage.setItem('portfolio-data', JSON.stringify(formData));
    }
}
function loadFromLocalStorage() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    const savedData = localStorage.getItem('portfolio-data');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            populateForm(formData);
        } catch (e) {}
    }
}
function exportToJson() {
    const formData = getFormData();
    const jsonStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function importFromJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const formData = JSON.parse(event.target.result);
            populateForm(formData);
            updatePreview();
        } catch (error) {}
    };
    reader.readAsText(file);
    e.target.value = '';
}
function downloadPortfolio() {
    if (!validateForm()) return;
    const formData    = getFormData();
    const layoutStyle = layoutStyleSelect.value;
    const resumeTemplate = resumeTemplateSelect ? resumeTemplateSelect.value : 'single-column';
    const portfolioHTML = generatePortfolioHTML(formData, layoutStyle, resumeTemplate);
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${formData.fullName || 'My Portfolio'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
        --primary-color: ${formData.settings.primaryColor};
        --secondary-color: ${formData.settings.secondaryColor};
      }
      body{padding:2rem;max-width:1200px;margin:0 auto;font-family:${formData.settings.fontFamily};font-size:${formData.settings.fontSize};}
    </style>
    <link rel="stylesheet" href="style.css">
</head>
<body>
${portfolioHTML}
</body>
</html>`;
    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href     = url;
    a.download = `${formData.fullName || 'portfolio'}.html`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadPortfolioPDF() {
    if (!validateForm()) return;
    html2pdf().set({
        margin: 0.5,
        filename: `${fullNameInput.value || 'portfolio'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(document.getElementById('portfolio-preview')).save();
}
function downloadPortfolioDOCX() {
    const doc = new window.docx.Document({
        sections: [{
            properties: {},
            children: [
                new window.docx.Paragraph({
                    text: fullNameInput.value,
                    heading: window.docx.HeadingLevel.TITLE,
                }),
                new window.docx.Paragraph({
                    text: professionalTitleInput.value,
                    heading: window.docx.HeadingLevel.HEADING_1,
                }),
                new window.docx.Paragraph({
                    text: bioInput.value,
                }),
            ]
        }]
    });
    window.docx.Packer.toBlob(doc).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${fullNameInput.value || 'portfolio'}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}
function downloadPortfolioImage() {
    html2canvas(previewContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = `${fullNameInput.value || 'portfolio'}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
function downloadPortfolioMarkdown() {
    const md = `# ${fullNameInput.value}\n\n## ${professionalTitleInput.value}\n\n${bioInput.value}\n\n## Skills\n${skills.join(', ')}\n\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullNameInput.value || 'portfolio'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
        portfolioForm.reset();
        skills = [];
        profileImage = null;
        educationContainer.innerHTML = '';
        experienceContainer.innerHTML = '';
        projectsContainer.innerHTML = '';
        skillsTagsContainer.innerHTML = '';
        imagePreview.innerHTML = '<i class="fas fa-user"></i>';
        imagePreview.classList.add('empty');
        addEducation();
        addExperience();
        addProject();
        updatePreview();
    }
}
function validateForm() {
    let isValid = true;
    if (!fullNameInput.value.trim()) isValid = false;
    if (!professionalTitleInput.value.trim()) isValid = false;
    if (!bioInput.value.trim()) isValid = false;
    document.querySelectorAll('.education-item').forEach(item => {
        if (!item.querySelector('.education-school').value.trim() ||
            !item.querySelector('.education-degree').value.trim() ||
            !item.querySelector('.education-year').value.trim()) {
            isValid = false;
        }
    });
    document.querySelectorAll('.experience-item').forEach(item => {
        if (!item.querySelector('.experience-company').value.trim() ||
            !item.querySelector('.experience-role').value.trim() ||
            !item.querySelector('.experience-year').value.trim() ||
            !item.querySelector('.experience-description').value.trim()) {
            isValid = false;
        }
    });
    document.querySelectorAll('.project-item').forEach(item => {
        if (!item.querySelector('.project-title').value.trim() ||
            !item.querySelector('.project-description').value.trim()) {
            isValid = false;
        }
    });
    return isValid;
}
function updateImagePreview() {
    imagePreview.innerHTML = '';
    if (profileImage) {
        const img = document.createElement('img');
        img.src = profileImage;
        imagePreview.appendChild(img);
        imagePreview.classList.remove('empty');
    } else {
        imagePreview.innerHTML = '<i class="fas fa-user"></i>';
        imagePreview.classList.add('empty');
    }
}
function setupDragAndDrop() {
    const dropArea = imagePreview;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    function highlight() {
        dropArea.classList.add('highlight');
    }
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    dropArea.addEventListener('drop', handleDrop, false);
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    function handleFiles(files) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profileImage = event.target.result;
                profileImageUrlInput.value = '';
                profileImageUploadInput.files = files;
                updateImagePreview();
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    }
}
function debounce(func, wait, immediate = false) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function loadColorsFromLocalStorage() {
    const primary = localStorage.getItem('portfolio-primary-color');
    const secondary = localStorage.getItem('portfolio-secondary-color');
    if (primary) {
        document.documentElement.style.setProperty('--primary-color', primary);
        if (primaryColorPicker) primaryColorPicker.value = primary;
    }
    if (secondary) {
        document.documentElement.style.setProperty('--secondary-color', secondary);
        if (secondaryColorPicker) secondaryColorPicker.value = secondary;
    }
}
function loadFontSettings() {
    const font = localStorage.getItem('portfolio-font-family') || 'Poppins';
    const size = localStorage.getItem('portfolio-font-size') || '16px';
    fontFamilyPicker.value = font;
    fontSizePicker.value = parseInt(size);
    document.body.style.fontFamily = font;
    document.body.style.fontSize = size;
    previewContainer.style.fontFamily = font;
    previewContainer.style.fontSize = size;
    document.head.insertAdjacentHTML('beforeend', `<link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;700&display=swap" rel="stylesheet">`);
}
function setupSystemThemeListener() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('portfolio-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}
init();
});
