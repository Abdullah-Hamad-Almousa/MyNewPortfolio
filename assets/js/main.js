document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // --- Neural Network Background ---
    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Fail gracefully

    let particles = [];
    const particleCount = 60;
    const connectionDistance = 150;

    const mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
        }
        update() {
            // Mouse repulsion logic
            if (mouse.x !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 123, 255, 0.8)';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#007bff';
            ctx.fill();
            ctx.shadowBlur = 0; // Reset for performance
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function animate() {
        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - dist / connectionDistance;
                        ctx.strokeStyle = `rgba(255, 77, 77, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        } catch (e) {
            console.error("Animation frame failed:", e);
        }
        requestAnimationFrame(animate);
    }
    animate();

    // --- Hero Background Transparency on Scroll ---
    const heroBg = document.querySelector('.hero-bg');
    const heroOverlay = document.querySelector('.hero-overlay');

    window.addEventListener('scroll', () => {
        const scrollPercent = Math.min(window.scrollY / 500, 1);
        if (heroBg) heroBg.style.opacity = 1 - scrollPercent;
        if (heroOverlay) {
            heroOverlay.style.background = `linear-gradient(to bottom, 
                rgba(5, 5, 5, ${0.4 + scrollPercent * 0.6}) 0%,
                rgba(5, 5, 5, ${0.8 + scrollPercent * 0.2}) 70%,
                rgba(5, 5, 5, 1) 100%)`;
        }
    });

    // --- Typewriter Effect ---
    function initTypewriter(element, text, speed = 100, delay = 0, loop = false) {
        if (!element) return;
        let i = 0;
        let isDeleting = false;
        element.innerHTML = '';

        setTimeout(() => {
            function type() {
                if (!isDeleting) {
                    element.innerHTML = text.substring(0, i + 1);
                    i++;
                    if (i === text.length) {
                        if (loop) {
                            isDeleting = true;
                            setTimeout(type, 2000); // Wait before deleting
                            return;
                        }
                        return;
                    }
                } else {
                    element.innerHTML = text.substring(0, i - 1);
                    i--;
                    if (i === 0) {
                        isDeleting = false;
                    }
                }

                let nextSpeed = isDeleting ? speed / 2 : speed;
                setTimeout(type, nextSpeed);
            }
            type();
        }, delay);
    }

    // Logo Typewriter (All pages)
    const logoElement = document.querySelector('.logo');
    initTypewriter(logoElement, "Abdullah Almousa", 100, 0, true);

    // Hero Name Typewriter (Home page only)
    const heroNameElement = document.getElementById('typewriter-name');
    if (heroNameElement) {
        initTypewriter(heroNameElement, "Abdullah Almousa", 150, 500, true);
    }

    // --- GSAP Animations ---
    try {
        // Force refresh after all assets load
        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });

        // Section Title Animation
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Individual Fade Up Animations
        gsap.utils.toArray('[data-gsap="fade-up"]').forEach(el => {
            gsap.fromTo(el,
                { y: 60, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    clearProps: 'all'
                }
            );
        });

        // Individual Fade Horizontal Animations
        gsap.utils.toArray('[data-gsap="fade-right"]').forEach(el => {
            gsap.fromTo(el,
                { x: -100, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    },
                    x: 0,
                    opacity: 1,
                    duration: 1.4,
                    ease: 'power3.out',
                    clearProps: 'all'
                }
            );
        });

        gsap.utils.toArray('[data-gsap="fade-left"]').forEach(el => {
            gsap.fromTo(el,
                { x: 100, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    },
                    x: 0,
                    opacity: 1,
                    duration: 1.4,
                    ease: 'power3.out',
                    clearProps: 'all'
                }
            );
        });
    } catch (e) {
        console.warn("GSAP Animations failed to load:", e);
    }

    // --- Radar Chart ---
    try {
        const chartElement = document.getElementById('skillsChart');
        if (chartElement && typeof Chart !== 'undefined') {
            const skillsCtx = chartElement.getContext('2d');
            new Chart(skillsCtx, {
                type: 'radar',
                data: {
                    labels: [
                        'EDA',
                        'Algorithms',
                        'Predictive Modeling',
                        'Classification',
                        'CV (OpenCV)',
                        'NLP',
                        'Deep Learning (TF/PT)',
                        'Data Visualization'
                    ],
                    datasets: [{
                        label: 'Core Skills (Primary)',
                        data: [95, 90, 85, 88, 92, 80, 85, 90],
                        fill: true,
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        borderColor: '#007bff',
                        pointBackgroundColor: '#007bff',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#007bff'
                    }, {
                        label: 'Tools & Innovation (Secondary)',
                        data: [85, 95, 80, 85, 95, 75, 90, 85],
                        fill: true,
                        backgroundColor: 'rgba(255, 77, 77, 0.2)',
                        borderColor: '#ff4d4d',
                        pointBackgroundColor: '#ff4d4d',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#ff4d4d'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            pointLabels: {
                                color: '#f0f0f0',
                                font: {
                                    size: 12,
                                    family: 'Inter'
                                }
                            },
                            ticks: {
                                display: false,
                                stepSize: 20
                            },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.warn("Radar Chart failed to load:", e);
    }
    // --- Contact Form Handling ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const btnNone = document.getElementById('btnNone');
    const orgInput = document.getElementById('orgInput');

    if (btnNone && orgInput) {
        btnNone.addEventListener('click', () => {
            orgInput.value = 'None';
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Submitting form to:", contactForm.action);

            formStatus.textContent = 'Sending...';
            formStatus.style.color = '#fff';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                console.log("Response status:", response.status);

                if (response.ok) {
                    formStatus.textContent = 'Message sent successfully!';
                    formStatus.style.color = '#00ff00';
                    contactForm.reset();
                    console.log("Form successfully submitted to Formspree.");
                } else {
                    const data = await response.json();
                    console.error("Formspree error response:", data);
                    if (data.errors) {
                        formStatus.textContent = data.errors.map(error => error.message).join(", ");
                    } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form';
                    }
                    formStatus.style.color = '#ff4d4d';
                }
            } catch (error) {
                console.error("Fetch error:", error);
                formStatus.textContent = 'Oops! There was a problem submitting your form';
                formStatus.style.color = '#ff4d4d';
            }
        });
    }

    // --- Presence Indicator Logic ---
    function updatePresence() {
        const presenceIndicator = document.getElementById('presenceIndicator');
        if (!presenceIndicator) return;

        const dot = presenceIndicator.querySelector('.status-dot');
        const text = presenceIndicator.querySelector('.status-text');

        try {
            // Check time in UTC+3 (Riyadh/Saudi Arabia time)
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Riyadh',
                hour: 'numeric',
                hour12: false
            });
            const hour = parseInt(formatter.format(new Date()));

            // User's active time is 1 AM to 9 AM UTC+03:00
            const isActive = hour >= 13 && hour < 22;

            if (isActive) {
                dot.classList.add('active');
                text.textContent = 'Active Now (Working)';
            } else {
                dot.classList.remove('active');
                text.textContent = 'Away (Resting / Off-hours)';
            }
        } catch (e) {
            console.warn("Presence check failed:", e);
        }
    }
    updatePresence();

    // --- Navbar Scroll Effect ---
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.background = 'rgba(5, 5, 5, 0.95)';
        } else {
            navbar.style.padding = '20px 0';
            navbar.style.background = 'rgba(5, 5, 5, 0.8)';
        }
    });
});
