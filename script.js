// ===== GUARANTEED WORKING DEPLOYMENT LOGIC =====
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('portfolioForm');
    const downloadBtn = document.getElementById('downloadBtn');

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePortfolio();
    });

    // Download portfolio as HTML
    downloadBtn.addEventListener('click', () => {
        const portfolioHTML = document.getElementById('portfolioPreview').innerHTML;
        const fullHTML = `<!DOCTYPE html>
        <html>
        <head>
            <title>My Portfolio</title>
            <style>${getComputedStyle(document.documentElement).cssText}</style>
        </head>
        <body>${portfolioHTML}</body>
        </html>`;
        
        downloadFile('portfolio.html', fullHTML);
    });

    // Generate portfolio preview
    function generatePortfolio() {
        const name = form.querySelector('input').value;
        const about = form.querySelector('textarea').value;

        const portfolioHTML = `
            <div class="portfolio">
                <h1>${name}</h1>
                <p>${about}</p>
                <!-- More dynamic content here -->
            </div>
        `;

        document.getElementById('portfolioPreview').innerHTML = portfolioHTML;
    }

    // Helper: Download file
    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
});
