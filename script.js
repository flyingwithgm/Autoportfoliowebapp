document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('portfolioForm');
    const themeToggle = document.getElementById('themeToggle');
    const downloadBtn = document.getElementById('downloadBtn');

    // Dark/Light Mode Toggle
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePortfolio();
    });

    // Download Portfolio
    downloadBtn.addEventListener('click', downloadPortfolio);

    function generatePortfolio() {
        // Get form values
        const name = document.getElementById('name').value;
        const career = document.getElementById('career').value;
        const about = document.getElementById('about').value;
        const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
        const projects = document.getElementById('projects').value.split('\n').filter(p => p.trim() !== '');
        const github = document.getElementById('github').value;
        const linkedin = document.getElementById('linkedin').value;

        // Set career-based colors
        let primaryColor, secondaryColor, accentColor;
        switch (career) {
            case 'tech':
                primaryColor = 'var(--tech-primary)';
                secondaryColor = 'var(--tech-secondary)';
                accentColor = 'var(--tech-accent)';
                break;
            case 'design':
                primaryColor = 'var(--design-primary)';
                secondaryColor = 'var(--design-secondary)';
                accentColor = 'var(--design-accent)';
                break;
            case 'business':
                primaryColor = 'var(--business-primary)';
                secondaryColor = 'var(--business-secondary)';
                accentColor = 'var(--business-accent)';
                break;
            case 'science':
                primaryColor = 'var(--science-primary)';
                secondaryColor = 'var(--science-secondary)';
                accentColor = 'var(--science-accent)';
                break;
            case 'art':
                primaryColor = 'var(--art-primary)';
                secondaryColor = 'var(--art-secondary)';
                accentColor = 'var(--art-accent)';
                break;
        }

        // Generate HTML
        const portfolioHTML = `
            <div class="portfolio" style="--primary: ${primaryColor}; --secondary: ${secondaryColor}; --accent: ${accentColor}">
                <header class="portfolio-header">
                    <h1 class="portfolio-name">${name}</h1>
                    <div class="portfolio-socials">
                        ${github ? `<a href="${github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                        ${linkedin ? `<a href="${linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
                    </div>
                </header>

                <section class="portfolio-about">
                    <h2><i class="fas fa-user"></i> About Me</h2>
                    <p>${about}</p>
                </section>

                <section class="portfolio-skills">
                    <h2><i class="fas fa-code"></i> Skills</h2>
                    <div class="skills-container">
                        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </section>

                <section class="portfolio-projects">
                    <h2><i class="fas fa-project-diagram"></i> Projects</h2>
                    <div class="projects-grid">
                        ${projects.map(project => {
                            const [title, ...descParts] = project.split('|');
                            const description = descParts.join('|').trim();
                            return `
                                <div class="project-card">
                                    <h3>${title}</h3>
                                    <p>${description}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </section>
            </div>
        `;

        // Display preview
        document.getElementById('portfolioPreview').innerHTML = portfolioHTML;
    }

    function downloadPortfolio() {
        // Generate full HTML file
        const htmlContent = `<!DOCTYPE html>
        <html>
        <head>
            <title>${document.getElementById('name').value}'s Portfolio</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                ${getComputedStyle(document.documentElement).cssText}
                /* Additional portfolio-specific styles */
                .portfolio { max-width: 900px; margin: 0 auto; padding: 2rem; }
                .skill-tag { background: var(--accent); padding: 0.5rem 1rem; border-radius: 50px; }
                .project-card { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; }
            </style>
        </head>
        <body class="${document.body.classList.contains('dark-mode') ? 'dark-mode' : ''}">
            ${document.getElementById('portfolioPreview').innerHTML}
        </body>
        </html>`;

        // Create download link
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.getElementById('name').value}-portfolio.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
