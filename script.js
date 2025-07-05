// Main App Controller
class PortfolioGenerator {
    constructor() {
        this.init();
        this.registerServiceWorker();
    }

    init() {
        // Initialize smooth scroll
        this.scroll = new LocomotiveScroll({
            el: document.querySelector('#smooth-wrapper'),
            smooth: true,
            smartphone: { smooth: true }
        });

        // Initialize animations
        this.initAnimations();
        this.initTemplateSelector();
        this.initFormBuilder();
        this.initExportHandlers();
    }

    initAnimations() {
        // Typing effect
        const words = ["60 seconds", "1 minute", "no time"];
        let i = 0;
        setInterval(() => {
            document.querySelector('.typing-effect').textContent = words[i];
            i = (i + 1) % words.length;
        }, 2000);

        // Particle canvas
        this.initParticles();
    }

    initParticles() {
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Particle system implementation
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width || 
                    this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = `rgba(67, 97, 238, ${this.size/3})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const particles = Array(100).fill().map(() => new Particle());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    initTemplateSelector() {
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                this.loadTemplate(template);
                
                // Animate selection
                gsap.to(card, {
                    scale: 0.95,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });
            });
        });
    }

    async loadTemplate(templateName) {
        try {
            const response = await fetch(`templates/${templateName}.html`);
            const html = await response.text();
            document.getElementById('portfolioOutput').innerHTML = html;
            this.initTemplateCustomizer();
        } catch (error) {
            console.error('Error loading template:', error);
        }
    }

    initTemplateCustomizer() {
        // Color picker implementation
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = '#4361ee';
        colorPicker.addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--primary', e.target.value);
        });

        // Add to UI
        const customizerPanel = document.createElement('div');
        customizerPanel.className = 'customizer-panel';
        customizerPanel.innerHTML = `
            <h3>Customize</h3>
            <label>Primary Color: <input type="color" value="#4361ee"></label>
            <!-- More customization options -->
        `;
        document.querySelector('.portfolio-preview').prepend(customizerPanel);
    }

    initExportHandlers() {
        document.getElementById('exportHtml').addEventListener('click', this.exportAsHtml);
        document.getElementById('exportPdf').addEventListener('click', this.exportAsPdf);
    }

    exportAsHtml() {
        // Generate full HTML document
        const html = `<!DOCTYPE html>
        <html>
        <head>
            <title>${document.querySelector('input[name="name"]').value}'s Portfolio</title>
            <style>${this.getCss()}</style>
        </head>
        <body>
            ${document.getElementById('portfolioOutput').innerHTML}
        </body>
        </html>`;

        // Create download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.html';
        a.click();
    }

    exportAsPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add portfolio content to PDF
        doc.html(document.getElementById('portfolioOutput'), {
            callback: function(doc) {
                doc.save('portfolio.pdf');
            },
            x: 10,
            y: 10,
            width: 190,
            windowWidth: document.getElementById('portfolioOutput').scrollWidth
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('SW registration failed: ', err));
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioGenerator();
});
