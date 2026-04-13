/* ============================================
   ReadBright — Visual Effects Engine
   Particles, Confetti, Stars, Sparkles
   ============================================ */

const Effects = {
    // --- Background floating particles ---
    createBgParticles(container, count = 15) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'bg-particle';
            const size = Math.random() * 6 + 3;
            const colors = ['#00BFA5', '#4FC3F7', '#6B46C0', '#FFB300', '#FF7043'];
            p.style.cssText = `
                width: ${size}px; height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                animation-duration: ${Math.random() * 15 + 10}s;
                animation-delay: ${Math.random() * 10}s;
            `;
            container.appendChild(p);
        }
    },

    // --- Confetti burst ---
    confetti(count = 60) {
        const container = document.getElementById('particles-container');
        const colors = ['#FFD700', '#00BFA5', '#6B46C0', '#FF7043', '#4FC3F7', '#FFB300', '#E53935', '#4CAF50'];
        for (let i = 0; i < count; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            const size = Math.random() * 8 + 6;
            c.style.cssText = `
                width: ${size}px; height: ${size * 0.6}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -20px;
                animation-duration: ${Math.random() * 2 + 2}s;
                animation-delay: ${Math.random() * 1}s;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            `;
            container.appendChild(c);
            setTimeout(() => c.remove(), 4500);
        }
    },

    // --- Star pop at position ---
    starPop(x, y) {
        const container = document.getElementById('particles-container');
        const star = document.createElement('div');
        star.className = 'star-particle';
        star.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        star.style.cssText = `left: ${x}px; top: ${y}px;`;
        container.appendChild(star);
        setTimeout(() => star.remove(), 1600);
    },

    // --- Multi-star burst ---
    starBurst(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const ox = x + (Math.random() - 0.5) * 60;
                const oy = y + (Math.random() - 0.5) * 40;
                this.starPop(ox, oy);
            }, i * 100);
        }
    },

    // --- Sparkle at element ---
    sparkleAt(element) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle';
            s.style.cssText = `
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation-delay: ${Math.random() * 0.3}s;
            `;
            document.getElementById('particles-container').appendChild(s);
            setTimeout(() => s.remove(), 1200);
        }
    },

    // --- Encouragement bubble ---
    showEncouragement(msg) {
        const existing = document.querySelector('.encourage-bubble');
        if (existing) existing.remove();
        
        const bubble = document.createElement('div');
        bubble.className = 'encourage-bubble';
        bubble.textContent = msg || getEncouragement();
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2200);
    },

    // --- Screen transition ---
    transitionScreen(newScreen, container) {
        const current = container.querySelector('.screen.active');
        if (current) {
            current.classList.add('exit');
            current.classList.remove('active');
            setTimeout(() => current.remove(), 600);
        }
        container.appendChild(newScreen);
        // Force reflow
        newScreen.offsetHeight;
        requestAnimationFrame(() => {
            newScreen.classList.add('active');
        });
    },

    // --- Clear all particles ---
    clearParticles() {
        const container = document.getElementById('particles-container');
        container.innerHTML = '';
    },

    // --- Reward animation ---
    celebrationSequence() {
        this.confetti(80);
        setTimeout(() => this.confetti(50), 800);
        setTimeout(() => this.confetti(30), 1600);
    }
};
