/*
 * Star Collector - An Incremental Game
 * CS 1XD3 Lab 5.2: The JS Pair Assignment
 * Authors: [Your Names Here]
 * Date: February 2026
 * Description: Game logic for Star Collector. Uses model/view separation:
 *   - Model: state variables track game data
 *   - View: DOM elements display the model to the user
 * All event handlers use addEventListener inside a load event listener.
 */

window.addEventListener("load", function () {

    // ===========================
    // MODEL - Game State Variables
    // ===========================

    let score = 0;            // current stars the player has
    let totalStars = 0;       // lifetime stars earned (for rewards)
    let clickPower = 1;       // stars gained per click
    let upgradesBought = 0;   // total upgrades purchased
    let autoClickTimer = null; // reference to the auto-click interval
    let autoClickSpeed = 0;   // current auto-click interval in ms (0 = off)
    let satelliteLevel = 0;   // how many times satellite has been purchased

    // Upgrade definitions (model)
    // Each upgrade tracks its own cost which increases after purchase
    let upgrades = [
        {
            id: "telescope",
            name: "Telescope",
            description: "+1 click power",
            baseCost: 10,
            cost: 10,
            costMultiplier: 1.0012,
            type: "click",
            power: 1
        },
        {
            id: "starmap",
            name: "Star Map",
            description: "+5 click power",
            baseCost: 50,
            cost: 50,
            costMultiplier: 1.0012,
            type: "click",
            power: 5
        },
        {
            id: "spaceprobe",
            name: "Space Probe",
            description: "+25 click power",
            baseCost: 250,
            cost: 250,
            costMultiplier: 1.0012,
            type: "click",
            power: 25
        },
        {
            id: "satellite",
            name: "Satellite",
            description: "Auto-collects stars (gets faster!)",
            baseCost: 100,
            cost: 100,
            costMultiplier: 1.0012,
            type: "auto",
            // Auto-click intervals in ms for each purchase level
            speeds: [2000, 1500, 1000, 700, 500, 350, 250]
        }
    ];

    // Reward definitions (model)
    // earned flag tracks whether each reward has been achieved
    let rewards = [
        {
            id: "first-light",
            name: "First Light",
            description: "Collect 100 total stars",
            icon: "\u2B50",
            earned: false,
            check: function () { return totalStars >= 100; }
        },
        {
            id: "stargazer",
            name: "Stargazer",
            description: "Collect 1,000 total stars",
            icon: "\u{1F31F}",
            earned: false,
            check: function () { return totalStars >= 1000; }
        },
        {
            id: "nebula-hunter",
            name: "Nebula Hunter",
            description: "Collect 10,000 total stars",
            icon: "\u{1F30C}",
            earned: false,
            check: function () { return totalStars >= 10000; }
        },
        {
            id: "first-purchase",
            name: "First Purchase",
            description: "Buy your first upgrade",
            icon: "\u{1F6D2}",
            earned: false,
            check: function () { return upgradesBought >= 1; }
        },
        {
            id: "astronomer",
            name: "Astronomer",
            description: "Buy 10 upgrades total",
            icon: "\u{1F52D}",
            earned: false,
            check: function () { return upgradesBought >= 10; }
        },
        {
            id: "galaxy-brain",
            name: "Galaxy Brain",
            description: "Reach 50+ click power",
            icon: "\u{1F9E0}",
            earned: false,
            check: function () { return clickPower >= 50; }
        },
        {
            id: "automated",
            name: "Automated",
            description: "Purchase your first Satellite",
            icon: "\u{1F6F0}",
            earned: false,
            check: function () { return satelliteLevel >= 1; }
        }
    ];

    // Milestone thresholds for the progress bar
    let milestones = [100, 1000, 10000, 100000, 1000000];

    // ===========================
    // VIEW - DOM Element References
    // ===========================

    let scoreDisplay = document.getElementById("score-display");

    let clickPowerDisplay = document.getElementById("click-power-display");

    let upgradesCountDisplay = document.getElementById("upgrades-count-display");

    let autoSpeedDisplay = document.getElementById("auto-speed-display");

    let progressFill = document.getElementById("progress-fill");

    let progressText = document.getElementById("progress-text");

    let upgradeList = document.getElementById("upgrade-list");

    let rewardsList = document.getElementById("rewards-list");

    let starButton = document.getElementById("star-button");

    let clickFeedback = document.getElementById("click-feedback");

    let helpBtn = document.getElementById("help-btn");

    let helpOverlay = document.getElementById("help-overlay");

    let helpCloseBtn = document.getElementById("help-close-btn");

    let congratsPopup = document.getElementById("congrats-popup");

    // ===========================
    // VIEW - Render Functions
    // ===========================

    /** Updates all scoreboard displays from model variables */
    function updateScoreboard() {
        scoreDisplay.textContent = score.toLocaleString();
        clickPowerDisplay.textContent = clickPower.toLocaleString();
        upgradesCountDisplay.textContent = upgradesBought;

        if (autoClickSpeed > 0) {
            autoSpeedDisplay.textContent = (autoClickSpeed / 1000).toFixed(1) + "s";
        } else {
            autoSpeedDisplay.textContent = "Off";
        }

        updateProgressBar();
    }

    /** Updates the progress bar toward the next milestone */
    function updateProgressBar() {
        // Find the next milestone the player hasn't reached
        let nextMilestone = milestones[milestones.length - 1];
        let prevMilestone = 0;
        for (let i = 0; i < milestones.length; i++) {
            if (totalStars < milestones[i]) {
                nextMilestone = milestones[i];
                prevMilestone = i > 0 ? milestones[i - 1] : 0;
                break;
            }
        }

        let progressInRange = totalStars - prevMilestone;
        let rangeSize = nextMilestone - prevMilestone;
        let percentage = Math.min((progressInRange / rangeSize) * 100, 100);

        progressFill.style.width = percentage + "%";
        progressText.textContent = totalStars.toLocaleString() + " / " + nextMilestone.toLocaleString();
    }

    /** Renders all upgrade buttons from the upgrades model array */
    function renderUpgrades() {
        // Clear existing buttons
        upgradeList.innerHTML = "";

        for (let i = 0; i < upgrades.length; i++) {
            let upgrade = upgrades[i];
            let btn = document.createElement("button");
            btn.className = "upgrade-btn";
            btn.id = "upgrade-" + upgrade.id;

            // Show different info for auto vs click upgrades
            let info = upgrade.description;
            if (upgrade.type === "auto" && satelliteLevel > 0) {
                info = "Speeds up auto-collect!";
            }

            btn.innerHTML =
                "<strong>" + upgrade.name + "</strong>" +
                "<span class='upgrade-desc'>" + info + "</span>" +
                "<span class='upgrade-cost'>Cost: " + Math.floor(upgrade.cost) + " stars</span>";

            // Disable if player can't afford it
            if (score < Math.floor(upgrade.cost)) {
                btn.classList.add("disabled");
            }

            // Use a closure to capture the current index
            (function (index) {
                btn.addEventListener("click", function () {
                    purchaseUpgrade(index);
                });
            })(i);

            upgradeList.appendChild(btn);
        }
    }

    /** Renders all rewards (earned ones show their icon, unearned show a lock) */
    function renderRewards() {
        rewardsList.innerHTML = "";

        for (let i = 0; i < rewards.length; i++) {
            let reward = rewards[i];
            let badge = document.createElement("div");
            badge.className = "reward-badge";

            if (reward.earned) {
                badge.classList.add("earned");
                badge.innerHTML =
                    "<span class='reward-icon'>" + reward.icon + "</span>" +
                    "<span class='reward-name'>" + reward.name + "</span>";
            } else {
                badge.innerHTML =
                    "<span class='reward-icon locked'>\u{1F512}</span>" +
                    "<span class='reward-name'>" + reward.name + "</span>";
            }

            badge.title = reward.description;
            rewardsList.appendChild(badge);
        }
    }

    /** Shows a congratulations popup that disappears after 3 seconds */
    function showCongrats(rewardName) {
        congratsPopup.textContent = "Congratulations! You earned: " + rewardName + "!";
        congratsPopup.classList.remove("hidden");
        congratsPopup.classList.add("show");

        setTimeout(function () {
            congratsPopup.classList.remove("show");
            congratsPopup.classList.add("hidden");
        }, 3000);
    }

    /** Shows a brief +N feedback near the star when clicked */
    function showClickFeedback() {
        clickFeedback.textContent = "+" + clickPower;
        clickFeedback.classList.remove("fade");
        // Force reflow so the animation restarts
        void clickFeedback.offsetWidth;
        clickFeedback.classList.add("fade");
    }

    // ===========================
    // CONTROLLER - Game Logic
    // ===========================

    /** Handles a click on the star - updates model then view */
    function handleStarClick() {
        // Update model
        score += clickPower;
        totalStars += clickPower;

        // Update view
        updateScoreboard();
        renderUpgrades();
        showClickFeedback();

        // Check for newly earned rewards
        checkRewards();
    }

    /** Handles purchasing an upgrade by index */
    function purchaseUpgrade(index) {
        let upgrade = upgrades[index];
        let cost = Math.floor(upgrade.cost);

        // Check if player can afford it
        if (score < cost) {
            return;
        }

        // Deduct cost from model
        score -= cost;

        // Apply upgrade effect to model
        if (upgrade.type === "click") {
            clickPower += upgrade.power;
        } else if (upgrade.type === "auto") {
            satelliteLevel++;
            // Determine speed based on satellite level
            let speedIndex = Math.min(satelliteLevel - 1, upgrade.speeds.length - 1);
            let newSpeed = upgrade.speeds[speedIndex];

            // Clear existing timer (only one auto-click timer allowed)
            if (autoClickTimer !== null) {
                clearInterval(autoClickTimer);
            }

            autoClickSpeed = newSpeed;

            // Start new auto-click timer
            autoClickTimer = setInterval(function () {
                // Auto-click applies current click power
                score += clickPower;
                totalStars += clickPower;
                updateScoreboard();
                renderUpgrades();
                checkRewards();
            }, autoClickSpeed);
        }

        // Increase the cost for next purchase
        upgrade.cost = upgrade.cost * upgrade.costMultiplier;
        upgradesBought++;

        // Update view
        updateScoreboard();
        renderUpgrades();
        checkRewards();
    }

    /** Checks all rewards and triggers any newly earned ones */
    function checkRewards() {
        for (let i = 0; i < rewards.length; i++) {
            if (!rewards[i].earned && rewards[i].check()) {
                rewards[i].earned = true;
                showCongrats(rewards[i].name);
                renderRewards();
            }
        }
    }

    // ===========================
    // EVENT LISTENERS
    // ===========================

    starButton.addEventListener("click", handleStarClick);

    helpBtn.addEventListener("click", function () {
        helpOverlay.classList.remove("hidden");
    });

    helpCloseBtn.addEventListener("click", function () {
        helpOverlay.classList.add("hidden");
    });

    // Close help if clicking outside the help content
    helpOverlay.addEventListener("click", function (event) {
        if (event.target === helpOverlay) {
            helpOverlay.classList.add("hidden");
        }
    });

    // ===========================
    // INITIAL RENDER
    // ===========================

    updateScoreboard();
    renderUpgrades();
    renderRewards();

});
