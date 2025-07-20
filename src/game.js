// Ghost Dodge Game - Converted to Scene-based structure
import Phaser from "phaser";
import avatarImage from "./assets/Avatar.png";
import ghostImage from "./assets/Ghost.png";

// Create a new scene
let gameScene = new Phaser.Scene('Game');

// Initialize custom parameters
gameScene.init = function () {
  this.playerSpeed = 300;
  this.ghostTimer = 0;
  this.spawnRate = 1500;
  this.speedMultiplier = 1;
  this.score = 0;
  this.gameStarted = false;
  this.gameOver = false;
};

// Load assets
gameScene.preload = function () {
  console.log("Starting to load images...");
  
  this.load.image("player", avatarImage);
  this.load.image("ghost", ghostImage);
  
  this.load.on('filecomplete-image-player', function () {
    console.log('Player (Avatar) image loaded successfully!');
  });
  
  this.load.on('filecomplete-image-ghost', function () {
    console.log('Ghost image loaded successfully!');
  });
  
  this.load.on('loaderror', function (file) {
    console.error('Error loading file:', file.src);
  });
};

// Create the scene
gameScene.create = function () {
  this.cursors = this.input.keyboard.createCursorKeys();
  this.ghosts = this.physics.add.group();

  // Get screen dimensions
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  // Start screen
  this.startScreen = this.add.text(centerX, centerY - 100, "GHOST DODGE!\nPress START", {
    fontSize: "32px",
    fill: "#fff",
    align: "center"
  }).setOrigin(0.5);

  this.startButton = this.add.text(centerX, centerY, "START", {
    fontSize: "28px",
    fill: "#0f0",
    backgroundColor: "#222",
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setInteractive();

  this.startButton.on("pointerdown", () => {
    this.startGame();
  });
};

// Start game function
gameScene.startGame = function () {
  this.startScreen.setVisible(false);
  this.startButton.setVisible(false);
  this.gameStarted = true;

  // Get screen dimensions
  const centerX = this.cameras.main.width / 2;
  const screenHeight = this.cameras.main.height;

  this.player = this.physics.add.sprite(centerX, screenHeight - 50, "player");
  this.player.setCollideWorldBounds(true);
  this.player.setScale(0.25);

  this.scoreText = this.add.text(10, 10, "Score: 0", { fontSize: "20px", fill: "#fff" });

  this.physics.add.overlap(this.player, this.ghosts, this.hitGhost, null, this);
};

// Update function
gameScene.update = function (time, delta) {
  if (!this.gameStarted || this.gameOver) return;

  // Player movement
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-this.playerSpeed);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(this.playerSpeed);
  } else {
    this.player.setVelocityX(0);
  }

  // Spawn ghosts
  this.ghostTimer += delta;
  if (this.ghostTimer > this.spawnRate) {
    this.spawnGhost();
    this.ghostTimer = 0;

    if (this.spawnRate > 500) this.spawnRate -= 50;
    this.speedMultiplier += 0.05;
  }

  // Check ghosts off screen
  this.ghosts.getChildren().forEach((ghost) => {
    if (ghost.active && ghost.y > this.cameras.main.height) {
      ghost.destroy();
      this.score += 5;
      this.scoreText.setText("Score: " + this.score);
    }
  });
};

// Spawn a ghost
gameScene.spawnGhost = function () {
  const screenWidth = this.cameras.main.width;
  const x = Phaser.Math.Between(50, screenWidth - 50);
  const ghost = this.ghosts.create(x, -50, "ghost");
  ghost.setVelocityY(100 * this.speedMultiplier);
  ghost.setScale(0.15);
  ghost.setCollideWorldBounds(false);
};

// Handle collision with ghost
gameScene.hitGhost = function () {
  this.gameOver = true;
  this.physics.pause();
  this.player.setTint(0xff0000);

  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  this.add.text(centerX, centerY - 100, "GAME OVER", {
    fontSize: "48px",
    fill: "#f00"
  }).setOrigin(0.5);

  const restartButton = this.add.text(centerX, centerY, "RESTART", {
    fontSize: "28px",
    fill: "#0f0",
    backgroundColor: "#222",
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setInteractive();

  restartButton.on("pointerdown", () => {
    this.scene.restart();
  });
};

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#111",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: gameScene,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Create game instance
new Phaser.Game(config);
