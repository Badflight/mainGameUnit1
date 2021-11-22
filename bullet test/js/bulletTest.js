class CustomSprite extends Phaser.Physics.Arcade.Sprite {
    jumpCount = 0
    jumpMax = 1
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture)
        scene.add.existing(this)
        scene.physics.add.existing(this)
    }

}


class BulletTest extends Phaser.Scene {
    /**@type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {CustomSprite}*/
    player
    /**@type {Bullets} */
    bullets
    /**@type {Phaser.Types.Input.keyboard.KeyCodes} */
    cursors
    /**@type {Phaser.Types.Input.Keyboard.KeyCodes} */
    keyboardKeys
    /**@type {Phaser.Geom.Rectangle} */
    customBounds
    /**@type {Phaser.Cameras.Scene2D.Camera} */
    camera
    /**@type {number} */
    score = 0
    /**@type {number} */
    health = 1000
    /**@type {number} */
    dist
    /**@type {Phaser.Physics.Arcade.Group} */
    badGuys
    /**@type {Phaser.Physics.Arcade.Collider} */
    badGuysCollider
    /**@type {Phaser.Physics.Arcade.Group} */
    energy
    /**@type {Phaser.Physics.Arcade.Sprite} */
    endSquare
    constructor() {
        super('Scene1')
    }
    preload() {
        //players and keyboard
        this.load.image('backGround', 'assets/background.png')
        this.load.image('intro', 'assets/intro.png')
        this.load.image('end', 'assets/endscreen.png')
        this.load.image('endSquare', 'assets/end.png')
        this.load.image('landscape-tiles', 'assets/tileset.png')
        this.load.spritesheet('player', 'assets/adventurer-Sheet.png', {frameWidth:50,frameHeight: 37})
        this.load.image('enemy', 'assets/enemy.png')
        this.load.image('bullet', 'assets/Projectile.png')
        this.load.image('energy', 'assets/energy.png')
        this.cursors = this.input.keyboard.createCursorKeys()
        this.keyboardKeys = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        //json file
        this.load.tilemapTiledJSON('level1', 'assets/level1.json')

    }

    create() {
        //json level stuff
        this.map = this.make.tilemap({ key: 'level1' })
        this.landscape = this.map.addTilesetImage('landscape-tiles', 'landscape-tiles')
        this.add.image(160,96,'backGround').setScrollFactor(0,0)
        this.map.createLayer('midground', [this.landscape], 0, 0)
        this.map.createLayer('platforms', [this.landscape], 0, 0)
        //physics stuff
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.bullets = new Bullets(this)
        this.player = new CustomSprite(this, 100, 100, 'player')
        this.player.setSize(20,30)
        this.player.setCollideWorldBounds(true)
        const collisionLayer = this.map.getLayer('platforms').tilemapLayer
        collisionLayer.setCollisionBetween(0, 10000)
        //colliders
        this.physics.add.collider(this.player, collisionLayer)
        this.physics.add.collider(this.bullets, collisionLayer, this.platBullet, null, this)
        //this.badGuysCollider = this.physics.add.overlap(this.bullets,this.badGuys, this.bulEnemyCol,null,this)
        //this.physics.add.collider(this.enerygy, collisionLayer)
        //this.physics.add.overlap(this.bullets, this.badGuysCollider,this.bulEnemyCol,null, this)
        //this.physics.add.overlap(this.bullets,this.enemy,this.platBullet(this.bullets),null,this)
        //text set up
        this.scoreText = this.add.text(32, 32, 'Score:' + this.score, {
            fontSize: '16px',
        }).setScrollFactor(0)
        this.healthText = this.add.text(32, 64, 'Health:' + this.health, {
            fontSize: '16px'
        }).setScrollFactor(0)
        //camera set up
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.camera.startFollow(this.player)
        this.input.on('pointerdown', (pointer) => {
            console.log('press f')
            // this.bullets.fireBullet(this.player.x, this.player.y, this.player.flipX)
        })
        this.physics.world.on('worldbounds', this.worldBoundsBullet, this)
        console.log(this.physics)
        //enemies---------------------------------------------------------------------
        this.badGuys = this.physics.add.group()
        let badGuyPoints = BulletTest.FindPoints(this.map, 'objectLayer', 'enemy')
        console.log(badGuyPoints)
        /**@type {number} */
        let len = badGuyPoints.length / 2
        /**@type {object} */
        let enemySpawn
        /**@type {object}*/
        let enemyDest
        /**@type {object} */
        let endPoint
        /**@type {Phaser.Curves.Path} */
        let line
        /**@type {Phaser.GameObjects.PathFollower} */
        let enemy
        //loop for enemies
        for (let i = 1; i <= len; i++) {
            enemySpawn = BulletTest.FindPoint(this.map, 'objectLayer', 'enemy', 'enemySpawn' + i)
            enemyDest = BulletTest.FindPoint(this.map, 'objectLayer', 'enemy', 'enemyDest' + i)
            line = new Phaser.Curves.Path(enemySpawn.x, enemySpawn.y).lineTo(enemyDest.x, enemyDest.y)
            enemy = this.add.follower(line, enemySpawn.x, enemySpawn.y, 'enemy')
            enemy.startFollow({
                setVelocityX:500,
                //duration: 1500,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            })
            this.badGuys.add(enemy)
            enemy.body.allowGravity = false
            console.log(i)
        }
        this.physics.add.collider(this.bullets, this.badGuys, this.bulEnemyCol, null, this)
        this.physics.add.collider(this.player, this.badGuys, this.playerEnemyCol, null, this)
        console.log(this.badGuysCollider)
        //intro screen
        this.endPoint = BulletTest.FindPoint(this.map,'objectLayer', 'end', 'endPoint')
        this.endSquare = new CustomSprite(this, this.endPoint.x, this.endPoint.y,'endSquare')
        this.endSquare.body.allowGravity = false
        this.physics.add.collider(this.player, this.endSquare, this.endgame, null, this)
        console.log(this.endSquare)
        console.log(endPoint)
        this.introScreen = this.add.image(160, 96, 'intro').setScrollFactor(0, 0)
        this.endScreen = this.add.image(160,96, 'end').setScrollFactor(0,0).setAlpha(0)
        this.input.on('pointerdown', this.startGame, this)
        //collider for energy
        //this.physics.add.collider(this.enerygy, collisionLayer)
        this.createAnim()

    }


    update() {
        //arrow keys to move
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(250)
            this.player.flipX = false
            this.player.anims.play('walk', true)
            //this.customBounds.setPosition(this.player.x,0)
            //console.log(this.customBounds)

        }
        else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250)
            this.player.flipX = true
            this.player.anims.play('walk', true)

        }
        else {
            this.player.anims.play('idle', true)
            this.player.setVelocityX(0)
        }
        //jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.jumpCount < this.player.jumpMax) {
            this.player.jumpCount++;
            this.player.setVelocityY(-300)
            //this.player.anims.play('jump', true)
        }
        if (this.player.body.touching.down || this.player.body.blocked.down) {
            this.player.jumpCount = 0
        }
        if(this.player.body.velocity.y<0){
            this.player.anims.play('jump', true)
        }
        else if(this.player.body.velocity.y>0){
            this.player.anims.play('fall', true)
        }
        //new shoot
        if (Phaser.Input.Keyboard.JustDown(this.keyboardKeys)) {
            this.bullets.fireBullet(this.player.x, this.player.y, this.player.flipX)
        }
        if (this.health <=0){
            this.endgame()
        }

    }
    startGame() {
        this.input.removeListener('pointerdown')
        this.tweens.add({
            targets: this.introScreen,
            alpha: {
                value: 0
            }
        })
    }
    endgame(){
        this.physics.pause()
        this.tweens.add({
            targets:this.endScreen,
            alpha: {value:1,duration:500,ease:'Powe1'}
        })
    }
    //added in for function within the world collider
    worldBoundsBullet(body) {
        console.log('out')
        //console.log(this.bullets)
        this.bullets.killAndHide(body.gameObject)
    }

    platBullet(bullet) {
        //console.log(bullet)
        this.bullets.killAndHide(bullet)
    }
    bulEnemyCol(bullet, badGuys) {
        this.bullets.setVelocityX(0)
        this.bullets.killAndHide(bullet)
        this.energy = this.physics.add.group({
            key: 'energy',
            allowGravity: false,
            setXY: {
                x: badGuys.x,
                y: badGuys.y,
            }
        })
        this.physics.add.collider(this.player, this.energy, this.energyCollection, null, this)
        //console.log(this.enerygy.body)
        //console.log(badGuys)
        badGuys.destroy(true)
        //console.log('bye')
    }
    playerEnemyCol(player, badGuys) {
        this.health -= 10
        this.score -= 20
        this.healthText.setText('Health' + this.health)
        this.scoreText.setText('Score'+ this.score)
        badGuys.destroy()
        //this.physics.world.removeCollider(badGuysCollider)
        // this.health -= 10
        // this.healthText.setText('Health'+ this.health)
        //this.player.setBounceX(10)
        console.log(this.badGuys)
        console.log('OH NO IM HIT')
    }
    energyCollection(player, energy) {
        energy.disableBody(true, true)
        this.score += 10
        this.scoreText.setText('Score:' + this.score)
        console.log('collect')
    }
    createAnim(){
        this.anims.create({
            key:'idle',
            frames:this.anims.generateFrameNumbers('player',{start:0, end:3}),
            frameRate:3,
            repeat:-1
        })
        this.anims.create({
            key:'walk',
            frames:this.anims.generateFrameNumbers('player',{start:8, end:13}),
            frameRate:10,
            repeat:-1
        })
        this.anims.create({
            key:'jump',
            frames:this.anims.generateFrameNumbers('player',{start:16, end:21}),
            frameRate:10,
            repeat:-1
        })
        this.anims.create({
            key:'fall',
            frames:[{key:'player', frame: 23}],
            frameRate:10,
        })
    }
    static FindPoint(map, layer, type, name) {
        var loc = map.findObject(layer, function (object) {
            if (object.type === type && object.name === name) {
                return object
            }
        })
        return loc
    }
    static FindPoints(map, layer, type) {
        var locs = map.filterObjects(layer, function (object) {
            if (object.type === type) {
                return object
            }
        })
        return locs
    }

}
console.log('Base Scene')