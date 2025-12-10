export class UIManager {
    constructor() {
        // --- 1. HUD Elements ---
        this.panel = document.getElementById('info-panel');
        this.nameEl = document.getElementById('planet-name');
        this.descEl = document.getElementById('planet-desc');
        this.tempEl = document.getElementById('planet-temp');
        this.gravityEl = document.getElementById('planet-gravity');
        this.massEl = document.getElementById('planet-mass');

        // --- 2. Search Elements ---
        this.searchInput = document.getElementById('search-input');

        // This variable will hold the function from main.js
        this.onSearchCallback = null;

        // --- 3. Event Listener ---
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
        });
    }

    // Connects the UI to the Logic
    setSearchCallback(callback) {
        this.onSearchCallback = callback;
    }

    handleSearch(query) {
        if (!query || !this.onSearchCallback) return;

        // Normalize input: remove extra spaces, convert to lowercase
        const cleanQuery = query.trim().toLowerCase();

        // Trigger the callback
        this.onSearchCallback(cleanQuery);

        // Clear the input and defocus to hide mobile keyboards
        this.searchInput.value = '';
        this.searchInput.blur();
    }

    showPlanetInfo(planetData) {
        // 1. Update Content
        this.nameEl.textContent = planetData.name;
        this.descEl.textContent = planetData.description || "No description available.";

        // Safety check for details
        if (planetData.details) {
            this.tempEl.textContent = planetData.details.temp;
            this.gravityEl.textContent = planetData.details.gravity;
            this.massEl.textContent = planetData.details.mass;
        } else {
            this.tempEl.textContent = "N/A";
            this.gravityEl.textContent = "N/A";
            this.massEl.textContent = "N/A";
        }

        // 2. Slide In
        this.panel.classList.add('active');
    }

    hidePlanetInfo() {
        // Slide Out
        this.panel.classList.remove('active');
    }
}