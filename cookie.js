let user_click_power = 1;
let score = 0;

const canvas = document.getElementById("myCanvas");
const button = document.getElementById("Button");
const ctx = canvas.getContext("2d");



// Define circle properties
const circleX = 100;
const circleY = 100;
const radius = 50;
const color = "brown";

const upgrades = {
    upgrade1: {
        name: "Upgrade #1",
        cost: 10,
        power: 1
    },
    upgrade2: {
        name: "Upgrade #2",
        cost: 50,
        power: 5 
    },
    upgrade3: {
        name: "Upgrade #3",
        cost: 200,
        power: 20
    },
    upgrade4: {
        name: "Upgrade #4",
        cost: 1000,
        power: 100
    }


    
}

function drawScoreText() {
    // Draw just the score text
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}


function drawClickPower() {
    // Draw just the click power text
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Click Power: ${user_click_power}`, 8, 40);
}

function drawScore() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawUpgradeButton1();
    drawUpgradeButton2();

    
    // Redraw the circle
    ctx.fillStyle = color;
    ctx.fill(circlePath);
    

    drawScoreText();

    drawClickPower();
}

function drawUpgradeButton1() {
    const buttonX = 200;
    const buttonY = 50;
    const buttonWidth = 100;
    const buttonHeight = 50;

    // Draw the upgrade button
    ctx.fillStyle = "lightblue";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Draw the upgrade text
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(upgrades.upgrade1.name, buttonX + 10, buttonY + 20);
    ctx.fillText(`Cost: ${upgrades.upgrade1.cost}`, buttonX + 10, buttonY + 40);

}

function drawUpgradeButton2() {
    const buttonX = 200;
    const buttonY = 150;
    const buttonWidth = 100;
    const buttonHeight = 50;

    // Draw the upgrade button
    ctx.fillStyle = "lightblue";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Draw the upgrade text
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(upgrades.upgrade2.name, buttonX + 10, buttonY + 20);
    ctx.fillText(`Cost: ${upgrades.upgrade2.cost}`, buttonX + 10, buttonY + 40);
}



// Use Path2D for easier path management and click detection
const circlePath = new Path2D();
const upgrade1Path = new Path2D();
const upgrade2Path = new Path2D();
circlePath.arc(circleX, circleY, radius, 0, 2 * Math.PI); // Draw a full circle
upgrade1Path.rect(200, 50, 100, 50); // Define the path for upgrade button 1
upgrade2Path.rect(200, 150, 100, 50); // Define the path for upgrade button 2

// Draw the circle on the canvas and initial score
ctx.fillStyle = color;
ctx.fill(circlePath);
drawScore(); // Display initial score
drawUpgradeButton1();
drawUpgradeButton2();

// Add click event listener to the canvas
canvas.addEventListener("click", function(event) {
    // Get mouse coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (ctx.isPointInPath(upgrade1Path, mouseX, mouseY)) {
        console.log("Upgrade 1 triggered"); // Update the score display on the canvas
        if (score >= upgrades.upgrade1.cost) {
            score -= upgrades.upgrade1.cost;
            user_click_power += upgrades.upgrade1.power; // Increase click power by the upgrade's power
            drawScore(); // Update the score display on the canvas
        } else {
            console.log("Not enough score for Upgrade 1");
        }
        
    }

    if (ctx.isPointInPath(upgrade2Path, mouseX, mouseY)) {
        console.log("Upgrade 2 triggered"); // Update the score display on the canvas
        if (score >= upgrades.upgrade2.cost) {
            score -= upgrades.upgrade2.cost;
            user_click_power += upgrades.upgrade2.power; // Increase click power by the upgrade's power
            drawScore(); // Update the score display on the canvas
        } else {
            console.log("Not enough score for Upgrade 2");
        }
    }

    if (ctx.isPointInPath(circlePath, mouseX, mouseY)) {
        score+=user_click_power; // Increment score by user_click_power
        console.log(score);
        drawScore(); // Update the score display on the canvas
    }
});



