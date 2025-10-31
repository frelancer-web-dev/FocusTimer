import { i18n } from './i18n.js';
import { themeManager } from './theme.js';

class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60;
        this.timeLeft = this.workDuration;
        this.isRunning = false;
        this.intervalId = null;
        this.sessionsCompleted = parseInt(localStorage.getItem('sessionsCompleted')) || 0;
        this.totalMinutes = parseInt(localStorage.getItem('totalMinutes')) || 0;

        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerLabel = document.getElementById('timerLabel');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressCircle = document.getElementById('progressCircle');
        this.sessionsElement = document.getElementById('sessionsCompleted');
        this.minutesElement = document.getElementById('totalMinutes');

        this.radius = 130;
        this.circumference = 2 * Math.PI * this.radius;
        this.progressCircle.style.strokeDasharray = this.circumference;
        this.progressCircle.style.strokeDashoffset = this.circumference;

        this.finishSound = new Audio('./src/assets/finish.mp3');

        this.init();
        this.createParticles();
        this.initLanguageSelector();
        this.initThemeSelector();
    }

    init() {
        this.updateDisplay();
        this.updateStats();
        this.updateLanguage();

        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        i18n.subscribe((t) => this.updateLanguage());
        themeManager.subscribe((theme) => this.onThemeChange(theme));
    }

    initLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        const currentLang = i18n.getCurrentLanguage();

        langButtons.forEach(btn => {
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                i18n.setLanguage(btn.dataset.lang);
            });
        });
    }

    initThemeSelector() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        const currentTheme = themeManager.getCurrentTheme();

        themeButtons.forEach(btn => {
            if (btn.dataset.theme === currentTheme) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                themeManager.setTheme(btn.dataset.theme);
            });
        });
    }

    onThemeChange(theme) {
        console.log(`Theme changed to: ${theme}`);
    }

    updateLanguage() {
        const t = i18n.t;
        
        document.querySelector('h1').textContent = t.title;
        document.querySelector('meta[name="description"]').content = t.meta.description;
        document.title = `${t.title} – Pomodoro`;

        this.startBtn.textContent = t.buttons.start;
        this.pauseBtn.textContent = t.buttons.pause;
        this.resetBtn.textContent = t.buttons.reset;

        if (!this.isRunning) {
            if (this.timeLeft === this.workDuration) {
                this.timerLabel.textContent = t.timer.ready;
            } else {
                this.timerLabel.textContent = t.timer.paused;
            }
        }

        document.querySelectorAll('[data-i18n="stats.sessions"]')[0].textContent = t.stats.sessions;
        document.querySelectorAll('[data-i18n="stats.minutes"]')[0].textContent = t.stats.minutes;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        this.timerLabel.textContent = i18n.t.timer.active;

        this.intervalId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();

            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.timerLabel.textContent = i18n.t.timer.paused;
    }

    reset() {
        this.pause();
        this.timeLeft = this.workDuration;
        this.updateDisplay();
        this.updateProgress();
        this.timerLabel.textContent = i18n.t.timer.ready;
    }

    complete() {
        this.pause();
        this.sessionsCompleted++;
        this.totalMinutes += 25;
        localStorage.setItem('sessionsCompleted', this.sessionsCompleted);
        localStorage.setItem('totalMinutes', this.totalMinutes);
        this.updateStats();
        this.playSound();
        this.showCelebration();
        this.timerLabel.textContent = i18n.t.timer.completed;
        this.timeLeft = this.workDuration;
        setTimeout(() => this.reset(), 3000);
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const progress = (this.workDuration - this.timeLeft) / this.workDuration;
        const offset = this.circumference - (progress * this.circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }

    updateStats() {
        this.sessionsElement.textContent = this.sessionsCompleted;
        this.minutesElement.textContent = this.totalMinutes;
    }

    playSound() {
        this.finishSound.currentTime = 0;
        this.finishSound.play().catch(() => {});
    }

    showCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.textContent = '🎉';
        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 1000);
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }
}

new PomodoroTimer();
