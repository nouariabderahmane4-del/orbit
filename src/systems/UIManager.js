export class UIManager {
    constructor() {
        this.panel = document.getElementById('info-panel');
        this.nameEl = document.getElementById('planet-name');
        this.descEl = document.getElementById('planet-desc');
        this.tempEl = document.getElementById('planet-temp');
        this.gravityEl = document.getElementById('planet-gravity');
        this.massEl = document.getElementById('planet-mass');
    }

    showPlanetInfo(planetData) {
        // 1. Update Content
        this.nameEl.textContent = planetData.name;
        this.descEl.textContent = planetData.description;

        // Safety check: ensure details exist (The Sun might not have them in your data yet)
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