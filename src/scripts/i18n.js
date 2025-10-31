import { en } from '../locales/en.js';
import { uk } from '../locales/uk.js';
import { ru } from '../locales/ru.js';

class I18n {
    constructor() {
        this.translations = { en, uk, ru };
        this.currentLang = localStorage.getItem('language') || 'en';
        this.observers = [];
    }

    get t() {
        return this.translations[this.currentLang];
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.notifyObservers();
        }
    }

    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback(this.t));
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

export const i18n = new I18n();
