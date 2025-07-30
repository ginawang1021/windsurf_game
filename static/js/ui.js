// UI Controls
import { BACKGROUND_COLORS } from './config.js';

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

function loadBackgroundColor() {
    const bgColor = localStorage.getItem('backgroundColor') || 'default';
    document.documentElement.setAttribute('data-bg-theme', bgColor === 'default' ? '' : bgColor);
    document.getElementById('background-color-select').value = bgColor;
}

function saveBackgroundColor(bgColor) {
    localStorage.setItem('backgroundColor', bgColor);
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const backgroundColorSelect = document.getElementById('background-color-select');

    // Load dark mode preference
    loadDarkMode();

    // Load background color preference
    loadBackgroundColor();

    // Toggle settings panel
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();  // Prevent click from propagating to document
        settingsPanel.classList.toggle('visible');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('visible')) {
            settingsPanel.classList.remove('visible');
        }
    });

    // Prevent game controls when interacting with settings
    settingsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
        saveDarkMode(isDarkMode);
    });

    // Handle background color selection
    backgroundColorSelect.addEventListener('change', (e) => {
        const bgColor = e.target.value;
        document.documentElement.setAttribute('data-bg-theme', bgColor === 'default' ? '' : bgColor);
        saveBackgroundColor(bgColor);
    });
}
