/**
AutoPortfolio Pro - Professional Portfolio Generator

A complete vanilla JavaScript solution for generating portfolio websites

Features:
- Real-time portfolio preview
- Multiple theme options (light, dark, custom)
- Download as HTML files
- JSON import/export
- Responsive design
- LocalStorage persistence
- No external dependencies

UPDATED: 2025-08-09 – Download button bug fixed, CSS handling robust, filename typo fixed
*/

document.addEventListener('DOMContentLoaded', function() {
// ======================
// DOM Element References
// ======================
const portfolioForm = document.getElementById('portfolio-form');
const previewContainer = document.getElementById('portfolio-preview');
const themeSwitcher = document.querySelector('.theme-switcher');
const layoutStyleSelect = document.getElementById('layout-style');
const jsonImportInput = document.getElementById('json-import');

// Form elements  
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
  
// Buttons  
const resetBtn = document.getElementById('reset-btn');  
const saveBtn = document.getElementById('save-btn');  
const exportJsonBtn = document.getElementById('export-json-btn');  
const downloadBtn = document.getElementById('download-btn');  
  
// ==========  
// App State  
// ==========  
let skills = [];  
let profileImage = null;  
  
// ================  
// Initialization  
// ================  
function init() {  
    loadFromLocalStorage();  
    setupEventListeners();  
    setupDragAndDrop();  
    setupSystemThemeListener();  
    updatePreview();  
      
    // Add default empty items if none exist  
    if (educationContainer.children.length === 0) addEducation();  
    if (experienceContainer.children.length === 0) addExperience();  
    if (projectsContainer.children.length === 0) addProject();  
      
    showWelcomeMessage();  
}  
  
// =====================  
// Event Listeners Setup  
// =====================  
function setupEventListeners() {  
    // Theme switching  
    themeSwitcher.addEventListener('click', handleThemeSwitch);  
      
    // Layout style change  
    layoutStyleSelect.addEventListener('change', updatePreview);  
      
    // Form inputs  
    portfolioForm.addEventListener('input', debounce(updatePreview, 300));  
      
    // Profile image handling  
    profileImageUrlInput.addEventListener('input', handleImageUrlInput);  
    profileImageUploadInput.addEventListener('change', handleImageUpload);  
      
    // Skills handling  
    addSkillBtn.addEventListener('click', addSkill);  
    skillsInput.addEventListener('keypress', function(e) {  
        if (e.key === 'Enter') {  
            e.preventDefault();  
            addSkill();  
        }  
    });  
      
    // Add sections  
    addEducationBtn.addEventListener('click', addEducation);  
    addExperienceBtn.addEventListener('click', addExperience);  
    addProjectBtn.addEventListener('click', addProject);  
      
    // Remove buttons (event delegation)  
    educationContainer.addEventListener('click', handleEducationRemove);  
    experienceContainer.addEventListener('click', handleExperienceRemove);  
    projectsContainer.addEventListener('click', handleProjectRemove);  
      
    // Action buttons  
    resetBtn.addEventListener('click', resetForm);  
    saveBtn.addEventListener('click', saveToLocalStorage);  
    exportJsonBtn.addEventListener('click', exportToJson);  
    downloadBtn.addEventListener('click', downloadPortfolio);  
      
    // Import JSON  
    jsonImportInput.addEventListener('change', importFromJson);  
      
    // Keyboard shortcuts  
    document.addEventListener('keydown', handleKeyboardShortcuts);  
}  
  
// =================  
// Core Functionality  
// =================  
  
function handleThemeSwitch(e) {  
    if (e.target.classList.contains('theme-btn')) {  
        const theme = e.target.dataset.theme;  
        document.documentElement.setAttribute('data-theme', theme);  
        localStorage.setItem('portfolio-theme', theme);  
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
    // Ctrl+S to save  
    if (e.ctrlKey && e.key === 's') {  
        e.preventDefault();  
        saveToLocalStorage();  
    }  
      
    // Ctrl+E to export  
    if (e.ctrlKey && e.key === 'e') {  
        e.preventDefault();  
        exportToJson();  
    }  
      
    // Ctrl+D to download  
    if (e.ctrlKey && e.key === 'd') {  
        e.preventDefault();  
        downloadPortfolio();  
    }  
}  
  
// ====================  
// Form Data Management  
// ====================  
  
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
            layoutStyle: layoutStyleSelect.value  
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
    // Basic info  
    fullNameInput.value = data.fullName || '';  
    professionalTitleInput.value = data.professionalTitle || '';  
    bioInput.value = data.bio || '';  
      
    // Profile image  
    if (data.profileImage) {  
        profileImage = data.profileImage;  
        if (data.profileImage.startsWith('data:')) {  
            profileImageUrlInput.value = '';  
        } else {  
            profileImageUrlInput.value = data.profileImage;  
        }  
        updateImagePreview();  
    }  
      
    // Skills  
    skills = data.skills || [];  
    renderSkills();  
      
    // Education  
    educationContainer.innerHTML = '';  
    (data.education || []).forEach(edu => {  
        addEducation();  
        const lastItem = educationContainer.lastElementChild;  
        lastItem.querySelector('.education-school').value = edu.school || '';  
        lastItem.querySelector('.education-degree').value = edu.degree || '';  
        lastItem.querySelector('.education-year').value = edu.year || '';  
    });  
      
    // Experience  
    experienceContainer.innerHTML = '';  
    (data.experience || []).forEach(exp => {  
        addExperience();  
        const lastItem = experienceContainer.lastElementChild;  
        lastItem.querySelector('.experience-company').value = exp.company || '';  
        lastItem.querySelector('.experience-role').value = exp.role || '';  
        lastItem.querySelector('.experience-year').value = exp.year || '';  
        lastItem.querySelector('.experience-description').value = exp.description || '';  
    });  
      
    // Projects  
    projectsContainer.innerHTML = '';  
    (data.projects || []).forEach(proj => {  
        addProject();  
        const lastItem = projectsContainer.lastElementChild;  
        lastItem.querySelector('.project-title').value = proj.title || '';  
        lastItem.querySelector('.project-description').value = proj.description || '';  
        lastItem.querySelector('.project-link').value = proj.link || '';  
    });  
      
    // Contact  
    githubInput.value = data.contact?.github || '';  
    linkedinInput.value = data.contact?.linkedin || '';  
    emailInput.value = data.contact?.email || '';  
    websiteInput.value = data.contact?.website || '';  
      
    // Settings  
    if (data.settings) {  
        document.documentElement.setAttribute('data-theme', data.settings.theme || 'light');  
        layoutStyleSelect.value = data.settings.layoutStyle || 'grid';  
    }  
}  
  
// =================  
// Skills Management  
// =================  
  
function addSkill() {  
    const skillText = skillsInput.value.trim();  
    if (skillText && !skills.includes(skillText)) {  
        skills.push(skillText);  
        rememberSkill(skillText);  
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
        tag.innerHTML = `  
            ${skill}  
            <button class="tag-remove" data-skill="${skill}">  
                <i class="fas fa-times"></i>  
            </button>  
        `;  
        skillsTagsContainer.appendChild(tag);  
          
        // Add event listener to remove button  
        tag.querySelector('.tag-remove').addEventListener('click', () => removeSkill(skill));  
    });  
}  
  
function rememberSkill(skill) {  
    const savedSkills = JSON.parse(localStorage.getItem('suggested-skills') || '[]');  
    if (!savedSkills.includes(skill)) {  
        savedSkills.push(skill);  
        localStorage.setItem('suggested-skills', JSON.stringify(savedSkills));  
    }  
}  
  
// ==================  
// Section Management  
// ==================  
  
function addEducation() {  
    const educationItem = document.createElement('div');  
    educationItem.className = 'education-item';  
    educationItem.innerHTML = `  
        <div class="form-row">  
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
        <button type="button" class="btn remove-btn remove-education"><i class="fas fa-trash"></i></button>  
    `;  
    educationContainer.appendChild(educationItem);  
}  
  
function addExperience() {  
    const experienceItem = document.createElement('div');  
    experienceItem.className = 'experience-item';  
    experienceItem.innerHTML = `  
        <div class="form-row">  
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
        <button type="button" class="btn remove-btn remove-experience"><i class="fas fa-trash"></i></button>  
    `;  
    experienceContainer.appendChild(experienceItem);  
}  
  
function addProject() {  
    const projectItem = document.createElement('div');  
    projectItem.className = 'project-item';  
    projectItem.innerHTML = `  
        <div class="form-row">  
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
        <button type="button" class="btn remove-btn remove-project"><i class="fas fa-trash"></i></button>  
    `;  
    projectsContainer.appendChild(projectItem);  
}  
  
// ===================  
// Preview Generation  
// ===================  
  
function updatePreview() {  
    const formData = getFormData();  
    const layoutStyle = layoutStyleSelect.value;  
      
    previewContainer.innerHTML = generatePortfolioHTML(formData, layoutStyle);  
}  
  
function generatePortfolioHTML(data, layoutStyle = 'grid') {  
    // Header section  
    let html = `  
        <div class="portfolio-header">  
            ${data.profileImage ?   
                `<div class="profile-image"><img src="${data.profileImage}" alt="${data.fullName || 'Profile Image'}"></div>` :   
                '<div class="profile-image"><i class="fas fa-user"></i></div>'  
            }  
            <h1>${data.fullName || 'Your Name'}</h1>  
            <h2>${data.professionalTitle || 'Professional Title'}</h2>  
        </div>  
    `;  
      
    // About section  
    if (data.bio) {  
        html += `  
            <div class="section-title">About Me</div>  
            <div class="about-section">  
                <p>${data.bio}</p>  
            </div>  
        `;  
    }  
      
    // Skills section  
    if (data.skills.length > 0) {  
        html += `  
            <div class="section-title">Skills</div>  
            <div class="skills-section">  
                <div class="skills-list">  
                    ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}  
                </div>  
            </div>  
        `;  
    }  
      
    // Education section  
    if (data.education.length > 0) {  
        html += `  
            <div class="section-title">Education</div>  
            <div class="education-section">  
                ${data.education.map(edu => `  
                    <div class="timeline-item">  
                        <h3>${edu.school || 'School Name'}</h3>  
                        <div class="date">${edu.degree || 'Degree'} | ${edu.year || 'Year'}</div>  
                    </div>  
                `).join('')}  
            </div>  
        `;  
    }  
      
    // Experience section  
    if (data.experience.length > 0) {  
        html += `  
            <div class="section-title">Work Experience</div>  
            <div class="experience-section">  
                ${data.experience.map(exp => `  
                    <div class="timeline-item">  
                        <h3>${exp.role || 'Role'} at ${exp.company || 'Company'}</h3>  
                        <div class="date">${exp.year || 'Year'}</div>  
                        <p>${exp.description || 'Description'}</p>  
                    </div>  
                `).join('')}  
            </div>  
        `;  
    }  
      
    // Projects section  
    if (data.projects.length > 0) {  
        html += `  
            <div class="section-title">Projects</div>  
            <div class="projects-section">  
        `;  
          
        if (layoutStyle === 'grid') {  
            html += `  
                <div class="projects-grid">  
                    ${data.projects.map(project => `  
                        <div class="project-card">  
                            <h3>${project.title || 'Project Title'}</h3>  
                            <p>${project.description || 'Project description'}</p>  
                            ${project.link ? `<a href="${ensureHttp(project.link)}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> View Project</a>` : ''}  
                        </div>  
                    `).join('')}  
                </div>  
            `;  
        } else if (layoutStyle === 'card') {  
            html += `  
                <div class="projects-card">  
                    ${data.projects.map(project => `  
                        <div class="project-card">  
                            <h3>${project.title || 'Project Title'}</h3>  
                            <p>${project.description || 'Project description'}</p>  
                            ${project.link ? `<a href="${ensureHttp(project.link)}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> View Project</a>` : ''}  
                        </div>  
                    `).join('')}  
                </div>  
            `;  
        } else { // list  
            html += `  
                <div class="projects-list">  
                    ${data.projects.map(project => `  
                        <div class="project-card">  
                            <h3>${project.title || 'Project Title'}</h3>  
                            <p>${project.description || 'Project description'}</p>  
                            ${project.link ? `<a href="${ensureHttp(project.link)}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> View Project</a>` : ''}  
                        </div>  
                    `).join('')}  
                </div>  
            `;  
        }  
          
        html += `</div>`;  
    }  
      
    // Contact section  
    if (data.contact.github || data.contact.linkedin || data.contact.email || data.contact.website) {  
        html += `  
            <div class="section-title">Contact</div>  
            <div class="contact-section">  
                <div class="contact-list">  
                    ${data.contact.github ? `  
                        <div class="contact-item">  
                            <i class="fab fa-github"></i>  
                            <a href="${ensureHttp(data.contact.github)}" target="_blank">GitHub</a>  
                        </div>  
                    ` : ''}  
                    ${data.contact.linkedin ? `  
                        <div class="contact-item">  
                            <i class="fab fa-linkedin"></i>  
                            <a href="${ensureHttp(data.contact.linkedin)}" target="_blank">LinkedIn</a>  
                        </div>  
                    ` : ''}  
                    ${data.contact.email ? `  
                        <div class="contact-item">  
                            <i class="fas fa-envelope"></i>  
                            <a href="mailto:${data.contact.email}">Email</a>  
                        </div>  
                    ` : ''}  
                    ${data.contact.website ? `  
                        <div class="contact-item">  
                            <i class="fas fa-globe"></i>  
                            <a href="${ensureHttp(data.contact.website)}" target="_blank">Website</a>  
                        </div>  
                    ` : ''}  
                </div>  
            </div>  
        `;  
    }  
      
    return html;  
}  
  
// =====================  
// Data Storage & Export  
// =====================  
  
function saveToLocalStorage() {  
    if (validateForm()) {  
        const formData = getFormData();  
        localStorage.setItem('portfolio-data', JSON.stringify(formData));  
        showAlert('Data saved successfully!', 'success');  
    } else {  
        showAlert('Please fill in all required fields', 'danger');  
    }  
}  
  
function loadFromLocalStorage() {  
    // Load theme  
    const savedTheme = localStorage.getItem('portfolio-theme');  
    if (savedTheme) {  
        document.documentElement.setAttribute('data-theme', savedTheme);  
    } else {  
        // Default to system preference  
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;  
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');  
    }  
      
    // Load form data  
    const savedData = localStorage.getItem('portfolio-data');  
    if (savedData) {  
        try {  
            const formData = JSON.parse(savedData);  
            populateForm(formData);  
        } catch (e) {  
            console.error('Error loading saved data:', e);  
        }  
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
      
    showAlert('JSON exported successfully!', 'success');  
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
            showAlert('JSON imported successfully!', 'success');  
        } catch (error) {  
            console.error('Error parsing JSON:', error);  
            showAlert('Error importing JSON. Please check the file format.', 'danger');  
        }  
    };  
    reader.readAsText(file);  
      
    // Reset the input to allow re-importing the same file  
    e.target.value = '';  
}  
  
// =====================  
// Portfolio Download   ←  FIXED 2025-08-09  
// =====================  
function downloadPortfolio() {  
    if (!validateForm()) {  
        showAlert('Please fill in all required fields before downloading', 'danger');  
        return;  
    }  

    const formData    = getFormData();  
    const layoutStyle = layoutStyleSelect.value;  
    const portfolioHTML = generatePortfolioHTML(formData, layoutStyle);  

    // If you want to include custom style, you can fetch and inline it here.
    // For now, only the external style.css and FontAwesome are linked.
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>${formData.fullName || 'My Portfolio'}</title>  
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">  
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">  
    <link rel="stylesheet" href="style.css">
    <style>
        body{padding:2rem;max-width:1200px;margin:0 auto;}
    </style>
</head>  
<body>  
    <div class="portfolio-preview">${portfolioHTML}</div>  
</body>  
</html>`;  

    const blob = new Blob([htmlDoc], { type: 'text/html' });  
    const url  = URL.createObjectURL(blob);  

    // Classic download  
    const a = document.createElement('a');  
    a.href     = url;  
    a.download = `${formData.fullName || 'portfolio'}.html`; // ← fixed typo here
    a.style.display = 'none';  
    document.body.appendChild(a);  
    a.click();  
    document.body.removeChild(a);  

    // iOS / Safari fallback  
    if (!window.navigator.msSaveOrOpenBlob && /iPad|iPhone|iPod/.test(navigator.userAgent)) {  
        window.open(url, '_blank');  
    }  

    setTimeout(() => URL.revokeObjectURL(url), 1000);  
    showAlert('Portfolio downloaded successfully!', 'success');  
}  
  
// ==============  
// Form Handling  
// ==============  
  
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
          
        // Add default empty items  
        addEducation();  
        addExperience();  
        addProject();  
          
        updatePreview();  
        showAlert('Form reset successfully!', 'success');  
    }  
}  
  
function validateForm() {  
    let isValid = true;  
      
    // Validate required fields  
    if (!fullNameInput.value.trim()) {  
        markInvalid(fullNameInput);  
        isValid = false;  
    }  
      
    if (!professionalTitleInput.value.trim()) {  
        markInvalid(professionalTitleInput);  
        isValid = false;  
    }  
      
    if (!bioInput.value.trim()) {  
        markInvalid(bioInput);  
        isValid = false;  
    }  
      
    // Validate education items  
    document.querySelectorAll('.education-item').forEach(item => {  
        if (!item.querySelector('.education-school').value.trim() ||   
            !item.querySelector('.education-degree').value.trim() ||   
            !item.querySelector('.education-year').value.trim()) {  
            markInvalid(item);  
            isValid = false;  
        }  
    });  
      
    // Validate experience items  
    document.querySelectorAll('.experience-item').forEach(item => {  
        if (!item.querySelector('.experience-company').value.trim() ||   
            !item.querySelector('.experience-role').value.trim() ||   
            !item.querySelector('.experience-year').value.trim() ||   
            !item.querySelector('.experience-description').value.trim()) {  
            markInvalid(item);  
            isValid = false;  
        }  
    });  
      
    // Validate project items  
    document.querySelectorAll('.project-item').forEach(item => {  
        if (!item.querySelector('.project-title').value.trim() ||   
            !item.querySelector('.project-description').value.trim()) {  
            markInvalid(item);  
            isValid = false;  
        }  
    });  
      
    return isValid;  
}  
  
function markInvalid(element) {  
    element.classList.add('invalid');  
    setTimeout(() => element.classList.remove('invalid'), 2000);  
}  
  
// ===================  
// Image Handling  
// ===================  
  
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
        } else {  
            showAlert('Please select an image file', 'danger');  
        }  
    }  
}  
  
// ===================  
// Utility Functions  
// ===================  
  
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
  
function ensureHttp(url) {  
    if (!url) return '';  
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;  
}  
  
function showAlert(message, type = 'info') {  
    const alert = document.createElement('div');  
    alert.className = `alert alert-${type}`;  
    alert.textContent = message;  
    alert.style.position = 'fixed';  
    alert.style.bottom = '20px';  
    alert.style.right = '20px';  
    alert.style.padding = '10px 20px';  
    alert.style.borderRadius = '5px';  
    alert.style.backgroundColor =   
        type === 'success' ? '#28a745' :   
        type === 'danger' ? '#dc3545' :   
        type === 'warning' ? '#ffc107' : '#17a2b8';  
    alert.style.color = 'white';  
    alert.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';  
    alert.style.zIndex = '1000';  
    alert.style.animation = 'fadeIn 0.3s';  
      
    document.body.appendChild(alert);  
      
    setTimeout(() => {  
        alert.style.animation = 'fadeOut 0.3s';  
        setTimeout(() => {  
            document.body.removeChild(alert);  
        }, 300);  
    }, 3000);  
}  
  
function setupSystemThemeListener() {  
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {  
        if (!localStorage.getItem('portfolio-theme')) {  
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');  
        }  
    });  
}  
  
function showWelcomeMessage() {  
    setTimeout(() => {  
        showAlert('Welcome to AutoPortfolio Pro! Start filling out your information to generate your portfolio.', 'info');  
    }, 1000);  
}  
  
// =============  
// Initialize App  
// =============  
init();

});
