document.getElementById('portfolioForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const about = document.getElementById('about').value;
    const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
    const projects = document.getElementById('projects').value.split('\n').filter(project => project.trim() !== '');
    const github = document.getElementById('github').value;
    const linkedin = document.getElementById('linkedin').value;
    
    // Process projects
    const processedProjects = projects.map(project => {
        const [title, ...descriptionParts] = project.split(':');
        const description = descriptionParts.join(':').trim();
        return { title: title.trim(), description };
    });
    
    // Generate portfolio HTML
    const portfolioHTML = generatePortfolioHTML(name, about, skills, processedProjects, github, linkedin);
    
    // Display preview
    document.getElementById('portfolioPreview').innerHTML = portfolioHTML;
    
    // Display code output
    document.getElementById('codeOutput').textContent = `<!DOCTYPE html>\n<html>\n<head>\n<title>${name}'s Portfolio</title>\n<style>\n${getPortfolioCSS()}\n</style>\n</head>\n<body>\n${portfolioHTML}\n</body>\n</html>`;
});

function generatePortfolioHTML(name, about, skills, projects, github, linkedin) {
    let skillsHTML = '';
    if (skills.length > 0) {
        skillsHTML = `<ul>${skills.map(skill => `<li>${skill}</li>`).join('')}</ul>`;
    }
    
    let projectsHTML = '';
    if (projects.length > 0) {
        projectsHTML = projects.map(project => `
            <div class="project">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `).join('');
    }
    
    let socialLinksHTML = '';
    if (github || linkedin) {
        socialLinksHTML = '<div class="social-links">';
        if (github) socialLinksHTML += `<a href="${github}" target="_blank">GitHub</a>`;
        if (linkedin) socialLinksHTML += `<a href="${linkedin}" target="_blank">LinkedIn</a>`;
        socialLinksHTML += '</div>';
    }
    
    return `
        <h1>${name}</h1>
        <section class="about">
            <h2>About Me</h2>
            <p>${about}</p>
        </section>
        
        <section class="skills">
            <h2>Skills</h2>
            ${skillsHTML}
        </section>
        
        <section class="projects">
            <h2>Projects</h2>
            ${projectsHTML}
        </section>
        
        ${socialLinksHTML}
    `;
}

function getPortfolioCSS() {
    return `
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #3498db;
            margin-top: 30px;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
        
        ul li {
            display: inline-block;
            background-color: #f0f0f0;
            padding: 5px 10px;
            margin-right: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        
        .project {
            margin-bottom: 20px;
        }
        
        .project h3 {
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .social-links {
            margin-top: 30px;
        }
        
        .social-links a {
            margin-right: 15px;
            color: #3498db;
            text-decoration: none;
        }
        
        .social-links a:hover {
            text-decoration: underline;
        }
    `;
}
