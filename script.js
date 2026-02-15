document.addEventListener('DOMContentLoaded', function() {
    // ... (previous variable declarations remain mostly the same, but change form ID reference)
    const resumeForm = document.getElementById('resume-form'); // Changed from portfolio-form
    const previewContainer = document.getElementById('resume-preview'); // Changed from portfolio-preview
    // ... (other variable declarations remain the same)
    const aiAssistantBtn = document.getElementById('ai-assistant-btn');
    const linkedinImportBtn = document.getElementById('linkedin-import-btn');
    const atsScoreValue = document.getElementById('ats-score-value');
    const aiAssistantModal = document.getElementById('ai-assistant-modal');
    const closeModal = document.querySelector('.close');
    const aiSuggestionList = document.getElementById('ai-suggestion-list');

    // Add new containers for certifications and languages
    const certificationsContainer = document.getElementById('certifications-container');
    const addCertificationBtn = document.getElementById('add-certification-btn');
    const languagesContainer = document.getElementById('languages-container');
    const addLanguageBtn = document.getElementById('add-language-btn');

    let skills = [];
    let profileImage = null;
    let certifications = [];
    let languages = [];

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
        if (certificationsContainer.children.length === 0) addCertification(); // Add default certification
        if (languagesContainer.children.length === 0) addLanguage(); // Add default language
    }

    function setupEventListeners() {
        // ... (previous event listeners remain)
        aiAssistantBtn.addEventListener('click', openAiAssistant);
        linkedinImportBtn.addEventListener('click', triggerLinkedinImport);
        closeModal.addEventListener('click', closeAiAssistantModal);
        window.addEventListener('click', (e) => {
            if (e.target === aiAssistantModal) {
                closeAiAssistantModal();
            }
        });

        // Add event listeners for certifications and languages
        addCertificationBtn.addEventListener('click', addCertification);
        addLanguageBtn.addEventListener('click', addLanguage);
        certificationsContainer.addEventListener('click', handleCertificationRemove);
        languagesContainer.addEventListener('click', handleLanguageRemove);
    }

    // --- NEW FUNCTIONALITY ---

    function openAiAssistant() {
        // Generate AI suggestions based on current resume data
        const formData = getFormData();
        const suggestions = generateAISuggestions(formData);
        aiSuggestionList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
        aiAssistantModal.style.display = 'block';
    }

    function closeAiAssistantModal() {
        aiAssistantModal.style.display = 'none';
    }

    function generateAISuggestions(formData) {
        const suggestions = [];
        
        // Example suggestions based on resume content
        if (formData.experience.some(exp => exp.description.toLowerCase().includes('responsible for'))) {
            suggestions.push("Replace 'Responsible for' phrases with strong action verbs like 'Managed', 'Developed', 'Implemented'.");
        }
        if (formData.skills.length < 5) {
            suggestions.push("Consider adding more skills to enhance your resume's keyword density for ATS systems.");
        }
        if (formData.summary && formData.summary.length < 100) {
            suggestions.push("Expand your summary to 3-5 sentences to provide more context about your background.");
        }
        if (!formData.summary || formData.summary.length < 50) {
            suggestions.push("A strong professional summary can make your resume stand out. Try to write 3-5 sentences highlighting your key achievements.");
        }
        if (formData.experience.length < 3) {
            suggestions.push("If possible, add more relevant work experiences to strengthen your application.");
        }
        
        if (suggestions.length === 0) {
            suggestions.push("Your resume looks great! Keep up the good work.");
        }
        
        return suggestions;
    }

    function triggerLinkedinImport() {
        // Trigger the hidden file input
        document.getElementById('linkedin-import').click();
    }

    function importFromLinkedin(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                // Placeholder: Parse LinkedIn CSV/JSON data
                // In a real implementation, you'd parse the LinkedIn data format
                // For now, simulate with mock data based on file extension
                let parsedData = {};
                if (file.name.endsWith('.json')) {
                    parsedData = JSON.parse(event.target.result);
                } else if (file.name.endsWith('.csv')) {
                    // Simple CSV parsing (would need more robust logic in practice)
                    const csvText = event.target.result;
                    // This is a simplified example - real parsing would be more complex
                    parsedData = {
                        fullName: "John Doe", // Extracted from CSV
                        professionalTitle: "Software Engineer",
                        bio: "Experienced software engineer...",
                        experience: [
                            {company: "Tech Corp", role: "Senior Dev", year: "2020-2024", description: "Led development..."},
                            {company: "Startup Inc", role: "Junior Dev", year: "2018-2020", description: "Developed web apps..."}
                        ],
                        education: [
                            {school: "University of Tech", degree: "BSc Computer Science", year: "2014-2018"}
                        ],
                        skills: ["JavaScript", "Python", "React", "Node.js"]
                    };
                }

                // Populate the form with imported data
                if (parsedData.fullName) fullNameInput.value = parsedData.fullName;
                if (parsedData.professionalTitle) professionalTitleInput.value = parsedData.professionalTitle;
                if (parsedData.bio) bioInput.value = parsedData.bio;
                if (parsedData.skills) {
                    skills = parsedData.skills;
                    renderSkills();
                }
                if (parsedData.experience) {
                    experienceContainer.innerHTML = '';
                    parsedData.experience.forEach(exp => {
                        addExperience();
                        const lastItem = experienceContainer.lastElementChild;
                        lastItem.querySelector('.experience-company').value = exp.company || '';
                        lastItem.querySelector('.experience-role').value = exp.role || '';
                        lastItem.querySelector('.experience-year').value = exp.year || '';
                        lastItem.querySelector('.experience-description').value = exp.description || '';
                    });
                }
                if (parsedData.education) {
                    educationContainer.innerHTML = '';
                    parsedData.education.forEach(edu => {
                        addEducation();
                        const lastItem = educationContainer.lastElementChild;
                        lastItem.querySelector('.education-school').value = edu.school || '';
                        lastItem.querySelector('.education-degree').value = edu.degree || '';
                        lastItem.querySelector('.education-year').value = edu.year || '';
                    });
                }
                updatePreview();
                alert("LinkedIn data imported successfully!");
            } catch (error) {
                console.error("Error importing LinkedIn data: ", error);
                alert("Failed to import LinkedIn data. Please check the file format.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset the input so the same file can be selected again
    }

    function calculateATSScore(formData) {
        let score = 50; // Start with a baseline
        
        // Increase score for positive factors
        if (formData.skills.length >= 8) score += 10;
        if (formData.experience.length >= 3) score += 10;
        if (formData.education.length >= 1) score += 5;
        if (formData.summary && formData.summary.length > 50) score += 5;
        if (formData.certifications && formData.certifications.length > 0) score += 5;
        
        // Decrease score for negative factors
        if (formData.skills.length < 5) score -= 10;
        if (formData.experience.length < 2) score -= 10;
        if (!formData.summary || formData.summary.length < 30) score -= 5;
        
        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, score));
    }

    // --- UPDATED FUNCTIONS ---

    function getFormData() {
        return {
            fullName: fullNameInput.value,
            jobTitle: professionalTitleInput.value, // Renamed
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value,
            profileImage: profileImage,
            skills: [...skills],
            experience: getExperienceData(),
            education: getEducationData(),
            certifications: getCertificationsData(), // Added
            languages: getLanguagesData(), // Added
            settings: {
                theme: document.documentElement.getAttribute('data-theme') || 'light',
                resumeTemplate: resumeTemplateSelect ? resumeTemplateSelect.value : 'modern',
                primaryColor: primaryColorPicker.value,
                fontFamily: fontFamilyPicker.value,
                fontSize: fontSizePicker.value + 'px'
            }
        };
    }

    function getCertificationsData() {
        return Array.from(document.querySelectorAll('.certification-item')).map(item => ({
            name: item.querySelector('.certification-name').value,
            issuer: item.querySelector('.certification-issuer').value,
            year: item.querySelector('.certification-year').value
        }));
    }

    function getLanguagesData() {
        return Array.from(document.querySelectorAll('.language-item')).map(item => ({
            name: item.querySelector('.language-name').value,
            proficiency: item.querySelector('.language-proficiency').value
        }));
    }

    function addCertification() {
        const certItem = document.createElement('div');
        certItem.className = 'certification-item';
        certItem.innerHTML =
            `<div class="form-row">
                <div class="form-control">
                    <label>Name*</label>
                    <input type="text" class="certification-name" required>
                </div>
                <div class="form-control">
                    <label>Issuer*</label>
                    <input type="text" class="certification-issuer" required>
                </div>
                <div class="form-control">
                    <label>Year*</label>
                    <input type="text" class="certification-year" required>
                </div>
            </div>
            <button type="button" class="btn remove-btn remove-certification"><i class="fas fa-trash"></i></button>`;
        certificationsContainer.appendChild(certItem);
    }

    function addLanguage() {
        const langItem = document.createElement('div');
        langItem.className = 'language-item';
        langItem.innerHTML =
            `<div class="form-row">
                <div class="form-control">
                    <label>Language*</label>
                    <input type="text" class="language-name" required>
                </div>
                <div class="form-control">
                    <label>Proficiency*</label>
                    <select class="language-proficiency" required>
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                    </select>
                </div>
            </div>
            <button type="button" class="btn remove-btn remove-language"><i class="fas fa-trash"></i></button>`;
        languagesContainer.appendChild(langItem);
    }

    function handleCertificationRemove(e) {
        if (e.target.classList.contains('remove-certification')) {
            e.target.closest('.certification-item').remove();
            updatePreview();
        }
    }

    function handleLanguageRemove(e) {
        if (e.target.classList.contains('remove-language')) {
            e.target.closest('.language-item').remove();
            updatePreview();
        }
    }

    // ... (updatePreview and template generation functions need to be updated too)
    function updatePreview() {
        const formData = getFormData();
        const resumeTemplate = formData.settings.resumeTemplate || 'modern';
        previewContainer.innerHTML = generateResumeHTML(formData, resumeTemplate);
        previewContainer.style.fontFamily = fontFamilyPicker.value;
        previewContainer.style.fontSize = fontSizePicker.value + 'px';

        // Calculate and update ATS score
        const score = calculateATSScore(formData);
        atsScoreValue.textContent = `${score}%`;
        atsScoreValue.className = score > 70 ? 'high' : score > 50 ? 'medium' : 'low';
    }

    // ... (update all template generation functions to include certifications and languages)
    function generateModernTemplate(data) {
        let html = `
            <div class="resume-template modern">
                <div class="header">
                    <div class="contact-info">
                        <h1>${data.fullName || 'Your Name'}</h1>
                        <h2>${data.jobTitle || 'Your Title'}</h2>
                        <p>${data.location ? data.location + ' | ' : ''}${data.phone ? data.phone + ' | ' : ''}<a href="mailto:${data.email}">${data.email}</a></p>
                        ${data.linkedin ? `<p><a href="${data.linkedin}" target="_blank">${data.linkedin}</a></p>` : ''}
                    </div>
                    ${data.profileImage ? `<img src="${data.profileImage}" alt="Profile Photo" class="profile-photo">` : ''}
                </div>
                
                <div class="main-content">
                    ${data.summary ? `
                        <section class="summary">
                            <h3>Professional Summary</h3>
                            <p>${data.summary}</p>
                        </section>
                    ` : ''}
                    
                    ${data.skills.length > 0 ? `
                        <section class="skills">
                            <h3>Core Competencies</h3>
                            <div class="skills-list">
                                ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </section>
                    ` : ''}
                    
                    ${data.experience.length > 0 ? `
                        <section class="experience">
                            <h3>Work Experience</h3>
                            ${data.experience.map(exp => `
                                <div class="experience-item">
                                    <div class="job-title">${exp.role} at ${exp.company}</div>
                                    <div class="duration">${exp.year}</div>
                                    <p>${exp.description}</p>
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}
                    
                    ${data.education.length > 0 ? `
                        <section class="education">
                            <h3>Education</h3>
                            ${data.education.map(edu => `
                                <div class="education-item">
                                    <div class="degree">${edu.degree}</div>
                                    <div class="institution">${edu.school}, ${edu.year}</div>
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}
                    
                    ${data.certifications.length > 0 ? `
                        <section class="certifications">
                            <h3>Certifications & Awards</h3>
                            ${data.certifications.map(cert => `
                                <div class="certification-item">
                                    <div class="cert-name">${cert.name}</div>
                                    <div class="cert-issuer">${cert.issuer}, ${cert.year}</div>
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}
                    
                    ${data.languages.length > 0 ? `
                        <section class="languages">
                            <h3>Languages</h3>
                            ${data.languages.map(lang => `
                                <div class="language-item">
                                    <strong>${lang.name}:</strong> ${lang.proficiency}
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}
                </div>
            </div>
        `;
        return html;
    }

    function generateResumeHTML(data, templateType = 'modern') {
        switch (templateType) {
            case 'modern':
                return generateModernTemplate(data);
            case 'classic':
                return generateClassicTemplate(data);
            case 'creative':
                return generateCreativeTemplate(data);
            case 'executive':
                return generateExecutiveTemplate(data);
            case 'chronological':
                return generateChronologicalTemplate(data);
            default:
                return generateModernTemplate(data);
        }
    }

    // Placeholder for other template functions (similar structure)
    function generateClassicTemplate(data) { /* ... */ return "<p>Classic Template</p>"; }
    function generateCreativeTemplate(data) { /* ... */ return "<p>Creative Template</p>"; }
    function generateExecutiveTemplate(data) { /* ... */ return "<p>Executive Template</p>"; }
    function generateChronologicalTemplate(data) { /* ... */ return "<p>Chronological Template</p>"; }

    // ... (rest of the functions remain mostly the same, updating references as needed)

    // Add the LinkedIn import event listener to the hidden input
    document.getElementById('linkedin-import').addEventListener('change', importFromLinkedin);

    init();
});
