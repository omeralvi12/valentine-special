class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isJumping = false;
    this.playerSpeed = 0;
    this.finished = false;
    this.level2Started = false;
    this.levelTransitioning = false;
    this.heartsCollected = 0;
    this.obstaclesHit = 0;
    this.currentMusic = null;
  }

  preload() {
    this.load.image('heart', 'assets/images/heart.png');
    this.load.image('wife', 'assets/images/wife.png');
    this.load.image('wife_jump', 'assets/images/wife_jump.png');
    this.load.image('confetti_pink', 'assets/images/confetti_pink.png');
    this.load.image('parkGround', 'assets/images/park_ground.png');
    this.load.image('cloud', 'assets/images/cloud.png');
    this.load.image('bush', 'assets/images/bush.png');
    this.load.image('bench', 'assets/images/bench.png');
    this.load.image('cactus', 'assets/images/cactus.png');
    this.load.image('snake', 'assets/images/snake.png');
    this.load.image('darkcloud', 'assets/images/darkcloud.png');
    this.load.image('couple', 'assets/images/couple.png');
    this.load.image('sun', 'assets/images/sun.png');
    this.load.image('intro_couple', 'assets/images/intro_couple.png');
    this.load.audio('music_intro', 'assets/audio/music_intro.mp3');
    this.load.audio('music_level1', 'assets/audio/music_level1.mp3');
    this.load.audio('music_level2', 'assets/audio/music_level2.mp3');
    this.load.audio('music_level3', 'assets/audio/music_level3.mp3');
    this.load.audio('heart_pop', 'assets/audio/heart_pop.mp3');
    this.load.audio('obstacle_hit', 'assets/audio/obstacle_hit.mp3');
  }

  create() {
    this.createGameOverlay();
    this.createWorld();
    this.createSky(0xFFE6F0, 0xFFE6F0, 0xE8F6E3, 0xE8F6E3);
    this.createClouds('cloud');
    this.createGroud();
    this.createDecorations();
    this.createPlayer();
    this.createHearts();
    this.createConfetti();
    this.createCamera();
    this.createScoreUI();
    this.setupInput();
    this.showIntroScreen();
  }

  showIntroScreen() {
    this.playerSpeed = 0;
    this.introContainer = this.add.container(0,0).setDepth(999).setScrollFactor(0);
    const bg = this.add.rectangle( this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0xffe3ec );
    const couple = this.add.image( this.scale.width/2, 240, 'intro_couple');
    couple.setScale(0.8);

    const title = this.add.text( this.scale.width/2, 60, "Hi Babesie ❤️", { fontSize: "24px", color: "#e63946", fontStyle: "bold", align: "center", wordWrap: { width: this.scale.width - 40 } } ).setOrigin(0.5);

    const message = this.add.text(
      this.scale.width/2,
      420,
      `This isn't just a game...

      It's our story.
      Every heart is a memory.
      Every obstacle is something we overcame together.

      Ready to walk through it with me?`,
      {
        fontSize: "16px",
        align: "center",
        wordWrap: { width: this.scale.width - 60 },
        color: "#333"
      }
    ).setOrigin(0.5);

    const startBtn = this.add.text( this.scale.width/2, 540, "Tap to Begin ❤️", { fontSize: "20px",color: "#ffffff", backgroundColor: "#ff6b81",padding: { x: 20, y: 10 }}).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: startBtn, scale: 1.05, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    startBtn.on("pointerdown", () => {
      this.tweens.add({
        targets: this.introContainer,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          this.introContainer.destroy();
          this.startLevel1();
        }
      });
    });

    this.introContainer.add([ bg, couple, title, message, startBtn ]);
  }
  
  createGameOverlay() {
    this.overlayLayer = this.add.container();
    this.overlayLayer.setDepth(40);
  }

  createWorld() {
    this.physics.world.setBounds(0, 0, 12000, 640);
    this.ground = this.add.rectangle(2500, 600, 5000, 80, 0xffc8dd);
    this.physics.add.existing(this.ground, true);
    this.ground.setVisible(false);
  }

  createSky(topLeft, topRight, bottomLeft, bottomRight) {
    this.sky = this.add.graphics();
    this.sky.fillGradientStyle( topLeft, topRight, bottomLeft, bottomRight, 1 );
    this.sky.fillRect(0, 0, 360, 640);
    this.sky.setDepth(-10);
    this.sky.setScrollFactor(0);
  }

  createClouds(type) {
    this.cloudType = type;
    if (this.clouds) this.clouds.clear(true,true);
    this.clouds = this.add.group();

    for (let i = 0; i < 6; i++) {
      const cloud = this.add.image( Phaser.Math.Between(-200, 600), type === 'darkcloud' ? Phaser.Math.Between(120, 260) : Phaser.Math.Between(50, 200), type );
      cloud.setScrollFactor(1);
      cloud.setDepth(-5);
      cloud.setScale(Phaser.Math.FloatBetween(0.7, 1.1));
      cloud.setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
      cloud.speed = type === 'darkcloud' ? Phaser.Math.FloatBetween(0.05, 0.09) : Phaser.Math.FloatBetween(0.25, 0.35);

      this.clouds.add(cloud);
    }
  }

  createGroud() {
    const groundBottom = 640;
    this.parkGround = this.add.tileSprite( 0, groundBottom, 12000, 160, 'parkGround' );
    this.parkGround.setOrigin(0, 1);
    this.parkGround.setDepth(0);
  }

  createDecorations() {
    this.decorations = this.add.group();

    for (let x = 300; x < 12000; x += 400) {
      const key = Phaser.Math.Between(0,1) ? 'bush' : 'bench';
      const decor = this.add.image(x, 600, key);
      decor.setOrigin(0.5, 1);
      decor.setDepth(0.8);
      decor.setScale(Phaser.Math.FloatBetween(0.9, 1.1));
      this.decorations.add(decor);
    }
  }

  createPlayer() {
    this.player = this.physics.add.sprite(100, 520, 'wife');
    this.player.setScale(1);
    this.player.setGravityY(900);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(  this.player.width * 0.1, this.player.height * 0.65, true);
    this.player.body.setOffset(  this.player.width * 0.325, this.player.height * 0.3);
    this.player.setDepth(1);
    this.shadow = this.add.ellipse( this.player.x, 600, 80, 20, 0x000000, 0.4 );
    this.shadow.setDepth(0.5);
  }

  createHearts() {
    this.hearts = this.physics.add.group();

    for (let x = 400; x < 12000; x += 400) {
      const heart = this.physics.add.sprite(x, 560 - 180, 'heart');
      heart.setScale(1);
      heart.body.setAllowGravity(false);
      this.hearts.add(heart);
    }

    this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);
  }

  createGroundHearts() {
    this.groundHearts = this.physics.add.group();
  
    for (let x = this.player.x + 200; x < this.player.x + 3000; x += 250) {
      const heart = this.physics.add.sprite( x, 590, 'heart' );
      heart.setScale(0.9);
      heart.body.setAllowGravity(false);
      heart.floatOffset = Phaser.Math.FloatBetween(0.5, 1.5);
  
      this.groundHearts.add(heart);
    }
  
    this.physics.add.overlap( this.player, this.groundHearts, this.collectHeart, null, this );
  }

  createConfetti() {
    this.confettiEmitter = this.add.particles(0, 0, [ 'confetti_pink' ], {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 900,
      gravityY: 600,
      quantity: 20,
      emitting: false
    });
  }

  createCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, 12000, 640);
  }

  createScoreUI() {
    this.scoreText = this.add.text( 10, 10, "❤️ Love: 0   🌵 Problems: 0", { fontSize: "13px", color: "#ffffff", stroke: "#000000", strokeThickness: 3 }).setScrollFactor(0).setOrigin(0,0).setDepth(200);
  }

  setupInput() {
    this.input.on('pointerdown', this.jump, this);
  }

  startLevel1() {
    this.playMusic('music_level1');
    this.resetPlayerState();
    this.currentLevel = 1;
    this.showLevelTransitionScreen( "✨ Chapter 1 — First Steps Together", () => { 
      this.playerSpeed = 200;
      this.showLevelText("✨ Chapter 1 — First Steps Together");
    } );
  }

  startLevel2() {
    this.playMusic('music_level2');
    this.resetPlayerState();
    this.clearOverlays();
    this.clouds.clear(true, true);
    this.sky.clear(true, true);
    this.currentLevel = 2;
    this.playerSpeed = 240;
    this.cameras.main.flash(300, 120, 120, 140);

    this.createClouds('darkcloud');
    this.createObstacles();
    this.createLevel2Effects();
  }

  createLevel2Effects() {
    this.createSky(0x4b5d73, 0x4b5d73, 0x2c3e55, 0x2c3e55);
    this.gloomSky = this.createPartialScreenOverlay(0x2c3e55, 0, -9);
    this.gloomSky.setScrollFactor(0).setDepth(-9);
    this.tweens.add({ targets: this.gloomSky, alpha: 0.45, duration: 3500, ease: 'Sine.easeInOut' });

    this.tweens.add({ targets: this.sky, alpha: 0.6, duration: 3000});

    this.gloomOverlay = this.createFullScreenOverlay(0x3b4f7a, 0, 40);
    this.tweens.add({ targets: this.gloomOverlay, alpha: 0.6, duration: 2500, ease: 'Sine.easeInOut' });
    this.overlayLayer.add(this.gloomOverlay);

    this.darkOverlay = this.createFullScreenOverlay(0x000000, 0, 39);
    this.tweens.add({ targets: this.darkOverlay, alpha: 0.35, duration: 2500 });
    this.overlayLayer.add(this.darkOverlay);

    this.showLevelText("💖 Chapter 2 — Growing Stronger");
  }

  startLevel3() {
    this.playMusic('music_level3');
    this.resetPlayerState();
    this.clearOverlays();
    this.currentLevel = 3;
    this.clouds.clear(true, true);
    this.sky.clear(true, true);
    this.obstacles.clear(true, true);
    this.createLevel3Effects();
  }

  createLevel3Effects() {
    this.createGroundHearts();

    this.createSky(0xffb6b9, 0xffb6b9, 0xffe5a3, 0xffe5a3);
    this.tweens.add({ targets: this, playerSpeed: 280, duration: 2000, ease: 'Sine.easeOut' });
    this.sunsetOverlay = this.createPartialScreenOverlay(0xff9aa2, 0.4, 50);
    this.tweens.add({ targets: this.sunsetOverlay, alpha: 0.25, duration: 4000, ease: 'Sine.easeInOut' });
    this.overlayLayer.add(this.sunsetOverlay);

    this.sunGlow = this.createPartialScreenOverlay(0xffd27f, 0, 49);
    this.tweens.add({ targets: this.sunGlow, alpha: 0.15, duration: 5000, ease: 'Sine.easeInOut' });
    this.overlayLayer.add(this.sunGlow);

    this.sun = this.add.image( this.scale.width - 80, 80, 'sun' );
    this.sun.setScrollFactor(0);
    this.sun.setDepth(-8);
    this.tweens.add({ targets: this.sun, scale: 1.05, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.showLevelText("🌸 Chapter 3 — Forever Ahead");
  }

  update() {
    if (!this.player || !this.player.active) return;

    this.player.setVelocityX(this.playerSpeed);
    this.shadow.x = this.player.x;
    this.shadow.y = 600;

    const heightFactor = Phaser.Math.Clamp( (600 - this.player.y) / 200, 0, 1 );
    this.shadow.setScale(1 - heightFactor * 0.5);
    this.shadow.setAlpha(0.25 - heightFactor * 0.15);

    this.clouds.children.iterate(cloud => {
      if (!cloud) return;

      cloud.x -= cloud.speed;
      const leftEdge = this.cameras.main.scrollX;

      if (cloud.x < leftEdge - 200) {
        cloud.x = leftEdge + this.scale.width + 200;
        cloud.isStorm = (this.cloudType === 'darkcloud');
        const floatAmount = cloud.isStorm ? 0 : 0.05;
        cloud.y += Math.sin(this.time.now * 0.001 + cloud.x) * floatAmount;
      }
    });

    if (this.groundHearts) {
      this.groundHearts.children.iterate(heart => {
        if (!heart) return;
        heart.y += Math.sin(this.time.now * 0.003 + heart.x) * heart.floatOffset;
      });
    }

    this.handleLanding();
    this.checkLevelProgress();
    this.checkEndOfLevel();
  }

  checkLevelProgress() {
    if (this.currentLevel === 1 && this.player.x > 3000 && !this.levelTransitioning) {
      this.levelTransitioning = true;
      this.showLevelTransitionScreen(
          "💖 Chapter 2 — Growing Stronger",
          () => this.startLevel2()
      );
    }

    if (this.currentLevel === 2 && this.player.x > 6000 && !this.levelTransitioning) {
      this.levelTransitioning = true;
      this.showLevelTransitionScreen(
          "🌸 Chapter 3 — Forever Ahead",
          () => this.startLevel3()
      );
    }
  }

  showLevelTransitionScreen(message, onContinue) {
    const cam = this.cameras.main;
    this.playerSpeed = 0;
    const container = this.add.container(0,0).setDepth(300);

    const bg = this.add.rectangle( cam.centerX, cam.centerY, cam.width, cam.height, 0x000000, 0 ).setScrollFactor(0);
    const glow = this.add.rectangle( cam.centerX, cam.centerY, cam.width, cam.height, 0xff9aa2, 0 ).setScrollFactor(0);

    const hearts = this.add.particles(0,0,'heart',{
        x: { min: 0, max: cam.width },
        y: cam.height + 20,
        speedY: { min: -40, max: -80 },
        speedX: { min: -10, max: 10 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 5000,
        quantity: 1,
        frequency: 400
    }).setScrollFactor(0);

    const text = this.add.text( cam.centerX, cam.centerY - 60, message, { fontSize: '24px', color:'#ffffff', align:'center', stroke:'#ffb6c1', strokeThickness:6, wordWrap: { width: this.scale.width - 40 } } ).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    const button = this.add.rectangle(cam.centerX,cam.centerY + 60,180,55,0xffffff).setScrollFactor(0).setInteractive().setScale(0);
    const buttonText = this.add.text( cam.centerX, cam.centerY + 60, "Continue ❤️", { fontSize:'18px', color:'#ff4d6d' } ).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    container.add([bg, glow, hearts, text, button, buttonText]);
    this.tweens.add({ targets: bg, alpha: 0.75, duration: 800 });
    this.tweens.add({ targets: glow, alpha: 0.12, duration: 2000, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: text, alpha: 1, y: cam.centerY - 80, duration: 900, ease:'Back.easeOut' });
    this.tweens.add({ targets: button, scale: 1, duration: 600, delay: 400, ease:'Back.easeOut' });
    this.tweens.add({ targets: buttonText, alpha: 1, duration: 500, delay: 600 });

    button.on('pointerover', () => {
      this.tweens.add({ targets: button, scale:1.05, duration:150 });
    });

    button.on('pointerout', () => {
      this.tweens.add({ targets: button, scale:1, duration:150 });
    });

    button.on('pointerdown', () => {
      hearts.destroy();
      container.destroy();
      cam.zoomTo(1, 1000);
      this.levelTransitioning = false;
      onContinue();
    });

    this.playMusic('music_intro');
  }

  showLevelText(message) {
    const text = this.add.text( 
      this.scale.width / 2, 
      120, 
      message, 
      { fontSize: '16px', color: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 4, wordWrap: { width: this.scale.width - 40 } }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);

    text.setStroke('#ffb6c1', 6);

    this.tweens.add({ targets: text, alpha: 1, y: 100, duration: 600, ease: 'Sine.easeOut', yoyo: true, hold: 1500,
      onComplete: () => text.destroy()
    });
  }

  createObstacles() {
    if (!this.obstacles) {
      this.obstacles = this.physics.add.group();
    }

    const startX = this.player.x + 200;

    const obstacleTypes = ['cactus', 'snake'];
    for (let x = startX; x < startX + 3000; x += 900) {

      const key = Phaser.Utils.Array.GetRandom(obstacleTypes);
      const obstacle = this.physics.add.sprite(x, 680, key);
      obstacle.setScale(1);
      obstacle.setOrigin(0.5, 1);
      obstacle.setScrollFactor(1);
      obstacle.body.setAllowGravity(false);
      obstacle.body.setImmovable(true);
      obstacle.setDepth(0.7);
      obstacle.body.setSize( obstacle.width * 0.1, obstacle.height * 0.6, true );
      obstacle.body.setOffset( obstacle.width * 0.3, obstacle.height * 0.4);
      this.obstacles.add(obstacle);
    }

    this.physics.add.overlap( this.player, this.obstacles, this.hitObstacle, null, this );
  }

  hitObstacle(player, obstacle) {
    if (this.levelTransitioning) return;
    if (player.x > obstacle.x) return;
    if (player.y > obstacle.y) return;
    if (this.isRecovering) return;

    this.sound.play('obstacle_hit', {
      volume: 0.5,
      rate: Phaser.Math.FloatBetween(0.95, 1.05)
    });

    this.isRecovering = true;
    this.obstaclesHit++;
    this.updateScoreUI();
    this.cameras.main.shake(200, 0.005);
    this.player.setVelocityX(-60);
    this.player.x -= 10;
    this.tweens.add({ targets: player, scaleY: 0.9, duration: 80, yoyo: true});
    this.tweens.add({ targets: obstacle, scaleX: obstacle.scaleX * 1.1, scaleY: obstacle.scaleY * 0.9, duration: 100, yoyo: true });
    this.tweens.add({ targets: player, alpha: 0.3, duration: 80, yoyo: true, repeat: 2 });
    this.tweens.add({ targets: this.scoreText, angle: 5, duration: 60, yoyo: true, repeat: 2 });

    this.time.delayedCall(400, () => {
      this.player.setVelocityX(this.playerSpeed);
      this.isRecovering = false;
    });
  }

  jump() {
    if (!this.isJumping && (this.player.body.blocked.down || this.player.body.touching.down)) {
      this.isJumping = true;
      this.player.setTexture('wife_jump');
      this.player.setVelocityY(-500);
    }
  }

  handleLanding() {
    if (this.isJumping && (this.player.body.blocked.down || this.player.body.touching.down)  && this.player.body.velocity.y >= 0) {
      this.isJumping = false;
      this.player.setTexture('wife');
    }
  }

  collectHeart(player, heart) {
    this.sound.play('heart_pop', {
      volume: 0.6
    });

    if (this.currentLevel === 1) {
      this.heartsCollected += 2;

    } else if (this.currentLevel === 2) {
      this.heartsCollected += 4;

    } else if (this.currentLevel === 3) {
      this.heartsCollected += 8;

    }

    this.updateScoreUI();
    heart.disableBody(true, true);
    this.confettiEmitter.setPosition(heart.x, heart.y);
    this.confettiEmitter.explode(20);
    this.tweens.add({ targets: heart, scale: 0, duration: 200, onComplete: () => heart.destroy() });
    this.tweens.add({ targets: this.scoreText, scaleX: 1.2, scaleY: 1.2, duration: 120, yoyo: true, ease: "Back.easeOut" });
  }

  checkEndOfLevel() {
    if (this.player.x > 9000 && !this.finished) {
      this.showFinalScreen();
      this.finished = true;
    }
  }

  showFinalScreen() {
    this.playMusic('music_intro');
    this.input.off('pointerdown', this.jump, this);
    this.playerSpeed = 0;
    if (this.player) this.player.destroy();
    if (this.shadow) this.shadow.destroy();
    if (this.decorations) this.decorations.clear(true, true);
    if (this.clouds) this.clouds.clear(true, true);
    if (this.hearts) this.hearts.clear(true, true);
    if (this.obstacles) this.obstacles.clear(true, true);

    this.add.rectangle(180, 320, 360, 640, 0xffffff, 0.95).setScrollFactor(0);
    this.add.text( 180, 260, 'No matter how fast life runs...\nI choose you ❤️', { fontSize: '18px', color: '#000', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
    this.add.text( 180, 340, 'Will you be my Valentine?', { fontSize: '22px', color: '#e63946' } ).setOrigin(0.5).setScrollFactor(0);

    this.addYesButtonOnFinalScreen();
    this.addNobuttonOnFinalScreen();
  }

  addYesButtonOnFinalScreen() {
    const yesBtn = this.add.rectangle(130, 420, 100, 50, 0xff8fab).setScrollFactor(0).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(130, 420, "YES ❤️", { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0);
    yesBtn.on("pointerdown", () => {
      this.showLoveScene();
    });
    yesBtn.on("pointerover", () => yesBtn.setScale(1.1));
    yesBtn.on("pointerout", () => yesBtn.setScale(1));
  }

  addNobuttonOnFinalScreen() {
    const noContainer = this.add.container(230, 420).setScrollFactor(0).setSize(100,50).setInteractive();
    const noBtn = this.add.rectangle(0, 0, 100, 50, 0x6c757d).setInteractive({ useHandCursor: true });
    const noText = this.add.text(0, 0, "NO 😅", { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5);
    noContainer.add([noBtn, noText]);
    noContainer.on("pointerover", () => {
      const margin = 80;
      const newX = Phaser.Math.Between( margin, this.scale.width - margin );
      const newY = Phaser.Math.Between( margin, this.scale.height - margin );
      this.tweens.add({ targets: noContainer, x: newX, y: newY, duration: 250, ease: "Back.easeOut" });
    });
  }

  createFullScreenOverlay(color, alpha, depth) {
    const cam = this.cameras.main;
    return this.add.rectangle(
      cam.centerX,
      cam.centerY,
      cam.width,
      cam.height,
      color,
      alpha
    ).setScrollFactor(0).setDepth(depth);
  }

  showLoveScene() {
    this.children.removeAll();
    const container = this.add.container(0,0).setScrollFactor(0).setDepth(9999);
    const bg = this.add.rectangle( this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0xffd6e0 ).setScrollFactor(0);
    const couple = this.add.image( this.scale.width/2, this.scale.height/2, 'couple' );
    couple.setScale(0.8);
    couple.setAlpha(0);
  
    this.tweens.add({ targets: couple, alpha: 1, scale: 1, duration: 1200, ease: "Back.easeOut" });
    const title = this.add.text( this.scale.width/2, 80, "She said YES ❤️", { fontSize: "26px", color: "#e63946", fontStyle: "bold" } ).setOrigin(0.5);

    const subText = this.add.text(
      this.scale.width / 2,
      160,
      "No matter how many hurdles life throws at us…\nmy love for you only grows stronger with every step we take together ❤️",
      {
        fontSize: "16px",
        color: "#555555",
        align: "center",
        wordWrap: { width: this.scale.width - 40 }
      }
    ).setOrigin(0.5).setScrollFactor(0);

    const hearts = this.add.particles(0,0,'heart',{
      x: this.scale.width/2,
      y: this.scale.height/2,
      speed: { min: 50, max: 150 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.4, end: 0 },
      lifespan: 2000,
      quantity: 2,
      frequency: 120
    });

    const finalScore = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 200,
      "❤️ Love: ∞  🌵 Problems: 0",
      {
        fontSize: "16px",
        color: "#e63946",
        fontStyle: "bold",
        align: "center",
        stroke: "#ffffff",
        strokeThickness: 5,
        padding: {
          x: 20,
          y: 10
        }
      }
    ).setOrigin(0.5);

    container.add([bg, couple, title, subText, finalScore, hearts]);
    this.children.bringToTop(container);
  }
  
  clearOverlays() {
    if (this.overlayLayer) {
      this.overlayLayer.removeAll(true);
    }
  }

  createPartialScreenOverlay(color, alpha, depth) {
    return this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      color,
      alpha
    ).setScrollFactor(0).setDepth(depth);
  }

  resetPlayerState() {
    if (!this.player) return;

    this.isRecovering = false;
    this.player.setAlpha(1);
    this.player.setScale(1);
    this.player.setTexture('wife');
    this.player.setVelocityX(this.playerSpeed);
    this.player.setVelocityY(0);
    this.isJumping = false;
    this.tweens.killTweensOf(this.player);
  }

  updateScoreUI() {
    if (!this.scoreText) return;
    this.scoreText.setText(
      `❤️ Love: ${this.heartsCollected}   🌵 Problems: ${this.obstaclesHit}`
    );
  }

  playMusic(key) {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
    }
    this.currentMusic = this.sound.add(key, { loop: true, volume: 0.5 });
    this.currentMusic.play();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#fde2e4',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: GameScene
};

new Phaser.Game(config);
