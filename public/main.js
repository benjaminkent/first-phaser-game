let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

let platforms

let player

let cursors

let stars
let score = 0
let scoreText

let bombs

let game = new Phaser.Game(config)

function preload() {
  this.load.image('sky', 'assets/star-sky.jpg')
  this.load.image('ground', 'assets/space-platform.png')
  this.load.image('star', 'assets/green-blob.png')
  this.load.image('bomb', 'assets/evil-bomb.png')
  this.load.spritesheet('dude', 'assets/dude.png', {
    frameWidth: 32,
    frameHeight: 48
  })
}

function create() {
  this.add.image(400, 300, 'sky')

  platforms = this.physics.add.staticGroup()

  platforms
    .create(400, 568, 'ground')
    .setScale(2)
    .refreshBody()

  platforms.create(600, 400, 'ground')
  platforms.create(75, 250, 'ground')
  platforms.create(750, 220, 'ground')
  platforms.create(0, 450, 'ground')

  player = this.physics.add.sprite(700, 450, 'dude')

  player.setBounce(0.2)
  player.setCollideWorldBounds(true)

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20
  })

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  })

  this.physics.add.collider(player, platforms)

  cursors = this.input.keyboard.createCursorKeys()

  stars = this.physics.add.group({
    key: 'star',
    repeat: 15,
    setXY: { x: 12, y: 0, stepX: 50 }
  })

  stars.children.iterate(star => {
    star.setBounceY(Phaser.Math.FloatBetween(0.3, 0.6))
  })

  this.physics.add.collider(stars, platforms)

  this.physics.add.overlap(player, stars, collectStar, null, this)

  scoreText = this.add.text(275, 16, 'score: 0', {
    fontSize: '25px',
    fill: '#58E702'
  })

  bombs = this.physics.add.group()

  this.physics.add.collider(bombs, platforms)

  this.physics.add.collider(player, bombs, hitBomb, null, this)
}

function collectStar(player, star) {
  star.disableBody(true, true)

  score += 1
  scoreText.setText('Score: ' + score)

  if (stars.countActive(true) === 0) {
    stars.children.iterate(star => {
      star.enableBody(true, star.x, 0, true, true)
    })

    let bombX =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400)

    let bomb = bombs.create(bombX, 16, 'bomb')
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    bomb.allowGravity = false
  }
}

function hitBomb(player, bomb) {
  this.physics.pause()

  player.setTint(0xff0000)

  player.anims.play('turn')

  gameOver = true
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-200)

    player.anims.play('left', true)
  } else if (cursors.right.isDown) {
    player.setVelocityX(200)

    player.anims.play('right', true)
  } else {
    player.setVelocityX(0)

    player.anims.play('turn')
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400)
  }
}
