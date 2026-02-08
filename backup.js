class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
      this.isJumping = false;
      this.playerSpeed = 200;
      this.finished = false;
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
    }
  
    create() {
      this.createSky();
      this.createClouds();
      this.createWorld();
      this.createGroud();
      this.createDecorations();
      this.createPlayer();
      this.createHearts();
      this.createConfetti();
      this.createCamera();
      this.setupInput();
    }
  
    update() {
      this.player.setVelocityX(this.playerSpeed);
      this.shadow.x = this.player.x;
  
      const heightFactor = Phaser.Math.Clamp( (600 - this.player.y) / 200, 0, 1 );
      this.shadow.setScale(1 - heightFactor * 0.5);
      this.shadow.setAlpha(0.25 - heightFactor * 0.15);
  
      this.clouds.children.iterate(cloud => {
        if (!cloud) return;
  
        cloud.x -= cloud.speed;
        const leftEdge = this.cameras.main.scrollX;
      
        if (cloud.x < leftEdge - 200) {
          cloud.x = leftEdge + this.scale.width + 200;
          cloud.y += Math.sin(this.time.now * 0.001 + cloud.x) * 0.05;
        }
      });
      this.handleLanding();
      this.checkEndOfLevel();
    }
  
    createWorld() {
      this.physics.world.setBounds(0, 0, 5000, 640);
      this.ground = this.add.rectangle(2500, 600, 5000, 80, 0xffc8dd);
      this.physics.add.existing(this.ground, true);
      this.ground.setVisible(false);
    }
  
    createSky() {
      const graphics = this.add.graphics();
  
      graphics.fillGradientStyle(
        0xFFE6F0, // top-left
        0xFFE6F0, // top-right
        0xE8F6E3, // bottom-left
        0xE8F6E3, // bottom-right
        1
      );
  
      graphics.fillRect(0, 0, 360, 640);
      graphics.setDepth(-10);
      graphics.setScrollFactor(0);
    }
  
    createGroud() {
      const groundBottom = 640;
      this.parkGround = this.add.tileSprite(
        0,                // x
        groundBottom,     // y
        5000,             // width of world
        160,              // height (adjust later)
        'parkGround'
      );
  
      this.parkGround.setOrigin(0, 1);
      this.parkGround.setDepth(0);
    }
  
    createClouds() {
      this.clouds = this.add.group();
  
      for (let i = 0; i < 6; i++) {
        const cloud = this.add.image(
          Phaser.Math.Between(-200, 600),
          Phaser.Math.Between(50, 200),
          'cloud'
        );
    
        cloud.setScrollFactor(1); // slower than world = depth illusion
        cloud.setDepth(-5);
        cloud.setScale(Phaser.Math.FloatBetween(0.7, 1.1));
        cloud.setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
        cloud.speed = 0.3;
        this.clouds.add(cloud);
      }
    }
  
    createDecorations() {
      this.decorations = this.add.group();
  
      for (let x = 300; x < 5000; x += 400) {
        const key = Phaser.Math.Between(0,1) ? 'bush' : 'bench';
        const decor = this.add.image(x, 600, key);
        decor.setOrigin(0.5, 1); // sit on ground
        decor.setDepth(0.8);     // between ground and player
        decor.setScale(Phaser.Math.FloatBetween(0.9, 1.1));
        this.decorations.add(decor);
      }
    }
  
    createPlayer() {
      this.player = this.physics.add.sprite(100, 520, 'wife');
      this.player.setScale(1);
      this.player.setGravityY(900);
      this.player.setCollideWorldBounds(true);
      this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.75);
      this.player.body.setOffset(this.player.width * 0.3, this.player.height * 0.2);
      this.player.setDepth(1);
      this.shadow = this.add.ellipse( this.player.x, 600, 80, 20, 0x000000, 0.4 );
      this.shadow.setDepth(0.5);
    }
  
    createHearts() {
      this.hearts = this.physics.add.group();
      for (let x = 400; x < 4800; x += 400) {
        const heart = this.physics.add.sprite(x, 560 - 180, 'heart');
        heart.setScale(1);
        heart.body.setAllowGravity(false);
        this.hearts.add(heart);
      }
      this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);
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
      this.cameras.main.setBounds(0, 0, 5000, 640);
    }
  
    setupInput() {
      this.input.on('pointerdown', this.jump, this);
    }
  
    jump() {
      if (!this.isJumping && (this.player.body.blocked.down || this.player.body.touching.down)) {
        console.log('jump');
        this.isJumping = true;
        this.player.setTexture('wife_jump');
        this.player.setVelocityY(-500);
      }
    }
  
    handleLanding() {
      if (this.isJumping && (this.player.body.blocked.down || this.player.body.touching.down)  && this.player.body.velocity.y >= 0) {
        console.log('land');
        this.isJumping = false;
        this.player.setTexture('wife');
      }
    }
  
    collectHeart(player, heart) {
      this.confettiEmitter.setPosition(heart.x, heart.y);
      this.confettiEmitter.explode(20);
  
      this.tweens.add({
        targets: heart,
        scale: 0,
        duration: 200,
        onComplete: () => heart.destroy()
      });
    }
  
    checkEndOfLevel() {
      if (this.player.x > 4800 && !this.finished) {
        this.showFinalScreen();
        this.finished = true;
      }
    }
  
    showFinalScreen() {
      this.playerSpeed = 0;
      this.add.rectangle(180, 320, 360, 640, 0xffffff, 0.95).setScrollFactor(0);
      this.add.text( 180, 260, 'No matter how fast life runs...\nI choose you ❤️', { fontSize: '18px', color: '#000', align: 'center' }).setOrigin(0.5).setScrollFactor(0);
      this.add.text( 180, 340, 'Will you be my Valentine?', { fontSize: '22px', color: '#e63946' } ).setOrigin(0.5).setScrollFactor(0);
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
  