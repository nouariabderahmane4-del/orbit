export class UIManager {
    constructor() {
        // --- 1. Grabbing HTML Elements ---
        // I need to store these elements in variables so I don't have to keep searching the DOM later
        this.panel = document.getElementById('info-panel');
        this.nameEl = document.getElementById('planet-name');
        this.descEl = document.getElementById('planet-desc');
        this.tempEl = document.getElementById('planet-temp');
        this.gravityEl = document.getElementById('planet-gravity');
        this.massEl = document.getElementById('planet-mass');

        // --- 2. Search Elements ---
        this.searchInput = document.getElementById('search-input');

        // This is a placeholder. I will fill this with a function from main.js later.
        this.onSearchCallback = null;

        // --- 3. Listen for Enter Key ---
        this.searchInput.addEventListener('keydown', (e) => {
            // Check if the key pressed was "Enter"
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
        });
    }

    // This method lets main.js pass a function to me. 
    // When the user searches, I'll call this function.
    setSearchCallback(callback) {
        this.onSearchCallback = callback;
    }

    handleSearch(query) {
        // If the box is empty or I don't have a callback function, stop here.
        if (!query || !this.onSearchCallback) return;

        // Clean up the text: remove spaces on ends, make it lowercase so "EARTH" matches "earth"
        const cleanQuery = query.trim().toLowerCase();

        // Run the function that main.js gave me
        this.onSearchCallback(cleanQuery);

        // Reset the box to empty
        this.searchInput.value = '';
        // Unfocus the box so the mobile keyboard goes away
        this.searchInput.blur();
    }

    showPlanetInfo(planetData) {
        // 1. Update the text on the screen
        this.nameEl.textContent = planetData.name;
        // Use a default string if description is missing
        this.descEl.textContent = planetData.description || "No description available.";

        // Sometimes 'details' might be undefined, so check first to avoid errors
        if (planetData.details) {
            this.tempEl.textContent = planetData.details.temp;
            this.gravityEl.textContent = planetData.details.gravity;
            this.massEl.textContent = planetData.details.mass;
        } else {
            this.tempEl.textContent = "N/A";
            this.gravityEl.textContent = "N/A";
            this.massEl.textContent = "N/A";
        }

        // 2. Add the CSS class that makes the panel slide in
        this.panel.classList.add('active');
    }

    hidePlanetInfo() {
        // Remove the class so the panel slides back out
        this.panel.classList.remove('active');
    }
}