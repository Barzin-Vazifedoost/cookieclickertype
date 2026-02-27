/*
 * Star Collector - An Incremental Game
 * CS 1XD3 Lab 5.2: The JS Pair Assignment
 * Authors: Erin Sobers, Barzin Vazifedoost
 * Date: February 27 2026
 * Description: Game logic for Star Collector. Uses model/view separation:
 *   - Model: state variables track game data
 *   - View: DOM elements display the model to the user
 * All event handlers use addEventListener inside a load event listener.
 */

window.addEventListener("load", function () {

    let score = 0;           
    let totalStars = 0;     
    let clickPower = 1;       
    let upgradesBought = 0;   
    let autoClickTimer = null; 
    let autoClickSpeed = 0;   
    let satelliteLevel = 0;  

    // Upgrade definitions
    // Each upgrade tracks its own cost which increases after purchase
    let upgrades = [
        {
            id: "telescope",
            name: "Telescope",
            description: "+1 click power",
            art: "  /--\\\n  |  |\n  |  |\n  \\__/",
            baseCost: 10,
            cost: 10,
            costMultiplier: 1.15,
            type: "click",
            power: 1
        },
        {
            id: "starmap",
            name: "Star Map",
            description: "+5 click power",
            art: " [====]\n [ :: ]\n [____]",
            baseCost: 50,
            cost: 50,
            costMultiplier: 1.25,
            type: "click",
            power: 5
        },
        {
            id: "spaceprobe",
            name: "Space Probe",
            description: "+25 click power",
            art: "  \_!_\n |___|\n  / \\",
            baseCost: 250,
            cost: 250,
            costMultiplier: 1.35,
            type: "click",
            power: 25
        },
        {
            id: "observatory",
            name: "Observatory",
            description: "+100 click power",
            art: "   _ \n  / \\\n | - |\n/_____\\",
            baseCost: 1000,
            cost: 1000,
            costMultiplier: 1.40,
            type: "click",
            power: 100
        },
        {
            id: "galactic-atlas",
            name: "Galactic Atlas",
            description: "+500 click power",
            art: " ( @ ) \n  /|\\ \n /_|_\\\n/__|__\\",
            baseCost: 5000,
            cost: 5000,
            costMultiplier: 1.50,
            type: "click",
            power: 500
        },
        {
            id: "star-ship",
            name: "Star Ship",
            description: "+2,500 click power",
            art: "   /\\\n  |--|\n /|__|\\\n/_|__|_\\\n",
            baseCost: 25000,
            cost: 25000,
            costMultiplier: 1.65,
            type: "click",
            power: 2500
        },
        {
            id: "satellite",
            name: "Satellite",
            description: "Auto-collects stars (gets faster!)",
            art: "  _|_  \n-[_I_]-\n  / \\  ",
            baseCost: 100,
            cost: 100,
            costMultiplier: 1.80,
            type: "auto",
        }
    ];

    // Reward definitions
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
            id: "supernova",
            name: "Supernova",
            description: "Collect 100,000 total stars",
            icon: "\u{1F4A5}",
            earned: false,
            check: function () { return totalStars >= 100000; }
        },
        {
            id: "galactic-emperor",
            name: "Galactic Emperor",
            description: "Collect 1,000,000 total stars",
            icon: "\u{1F451}",
            earned: false,
            check: function () { return totalStars >= 1000000; }
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
            id: "collector",
            name: "Collector",
            description: "Buy 25 upgrades total",
            icon: "\u{1F4E6}",
            earned: false,
            check: function () { return upgradesBought >= 25; }
        },
        {
            id: "tycoon",
            name: "Tycoon",
            description: "Buy 50 upgrades total",
            icon: "\u{1F4B8}",
            earned: false,
            check: function () { return upgradesBought >= 50; }
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
            id: "click-master",
            name: "Click Master",
            description: "Reach 100+ click power",
            icon: "\u{26A1}",
            earned: false,
            check: function () { return clickPower >= 100; }
        },
        {
            id: "automated",
            name: "Automated",
            description: "Purchase your first Satellite",
            icon: "\u{1F6F0}",
            earned: false,
            check: function () { return satelliteLevel >= 1; }
        },
    ];

    let milestones = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000, 1000000000000];

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

    /**
    * Updates all scoreboard displays to reflect the current model state.
    * Called after any action that changes score, clickPower, or autoClickSpeed.
    */
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

    /**
    * Updates the progress bar toward the next star milestone.
    * Reads totalStars and finds the nearest upcoming milestone to display progress.
    */
    function updateProgressBar() {
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

    /**
    * Renders all upgrade buttons into the upgrade list from the upgrades array. 
    * Clears and rebuilds the list each call to reflect current costs and affordability.
    */
    function renderUpgrades() {
        upgradeList.innerHTML = "";

        for (let i = 0; i < upgrades.length; i++) {
            let upgrade = upgrades[i];
            let btn = document.createElement("button");
            btn.className = "upgrade-btn";
            btn.id = "upgrade-" + upgrade.id;

            let info = upgrade.description;
            if (upgrade.type === "auto" && satelliteLevel > 0) {
                info = "Speeds up auto-collect!";
            }

            btn.innerHTML =
                "<pre class='upgrade-art'>" + upgrade.art + "</pre>" +
                "<strong>" + upgrade.name + "</strong>" +
                "<span class='upgrade-desc'>" + info + "</span>" +
                "<span class='upgrade-cost'>Cost: " + Math.floor(upgrade.cost) + " stars</span>";

            if (score < Math.floor(upgrade.cost)) {
                btn.classList.add("disabled");
            }

            (function (index) {
                btn.addEventListener("click", function () {
                    purchaseUpgrade(index);
                });
            })(i);

            upgradeList.appendChild(btn);
        }
    }

    /**
    * Renders all reward badges into the rewards list from the rewards array.
    * Earned rewards show their icon; unearned rewards show a lock icon.
    */
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

    /**
    * Displays a congratulations popup for a newly earned reward.
    * The popup disappears automatically after 3 seconds.
    *
    * @param {String} rewardName - The name of the reward that was earned.
    */
    function showCongrats(rewardName) {
        congratsPopup.textContent = "Congratulations! You earned: " + rewardName + "!";
        congratsPopup.classList.remove("hidden");
        congratsPopup.classList.add("show");

        setTimeout(function () {
            congratsPopup.classList.remove("show");
            congratsPopup.classList.add("hidden");
        }, 3000);
    }

    /**
    * Displays a brief animated feedback message near the star button.
    * Uses the current clickPower value to show how many stars were gained.
    */
    function showClickFeedback() {
        clickFeedback.textContent = "+" + clickPower;
        clickFeedback.classList.remove("fade");
        void clickFeedback.offsetWidth;
        clickFeedback.classList.add("fade");
    }

    /**
    * Handles a player click on the star button.
    * Adds clickPower to score and totalStars, then updates the view and checks rewards.
    */
    function handleStarClick() {
        score += clickPower;
        totalStars += clickPower;

        updateScoreboard();
        renderUpgrades();
        showClickFeedback();
        checkRewards();
    }

    /**
    * Handles purchasing an upgrade at the given index in the upgrades array.
    * Deducts the cost, applies the upgrade effect, increases future cost, and updates the view.
    *
    * @param {Number} index - The index of the upgrade in the upgrades array.
    */
    function purchaseUpgrade(index) {
        let upgrade = upgrades[index];
        let cost = Math.floor(upgrade.cost);

        if (score < cost) {
            return;
        }

        score -= cost;

        if (upgrade.type === "click") {
            clickPower += upgrade.power;
        } else if (upgrade.type === "auto") {
            satelliteLevel++;
            let newSpeed = Math.max(5, 2000 / Math.pow(satelliteLevel, 0.97));

            if (autoClickTimer !== null) {
                clearInterval(autoClickTimer);
            }

            autoClickSpeed = newSpeed;

            autoClickTimer = setInterval(function () {
                score += clickPower;
                totalStars += clickPower;
                updateScoreboard();
                checkRewards();
            }, autoClickSpeed);
        }

        upgrade.cost = upgrade.cost * upgrade.costMultiplier;
        upgradesBought++;

        updateScoreboard();
        renderUpgrades();
        checkRewards();
    }

    /**
    * Checks all rewards to see if any have been newly earned.
    * Triggers a congratulations popup and re-renders rewards for any newly earned ones.
    */
    function checkRewards() {
        for (let i = 0; i < rewards.length; i++) {
            if (!rewards[i].earned && rewards[i].check()) {
                rewards[i].earned = true;
                showCongrats(rewards[i].name);
                renderRewards();
            }
        }
    }

    starButton.addEventListener("click", handleStarClick);

    helpBtn.addEventListener("click", function () {
        helpOverlay.classList.remove("hidden");
    });

    helpCloseBtn.addEventListener("click", function () {
        helpOverlay.classList.add("hidden");
    });

    helpOverlay.addEventListener("click", function (event) {
        if (event.target === helpOverlay) {
            helpOverlay.classList.add("hidden");
        }
    });

    updateScoreboard();
    renderUpgrades();
    renderRewards();

});