class CustomSprite extends Phaser.Physics.Arcade.Sprite {
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
    /**@type {Phaser.Physics.Arcade.Group} */
    enemy
    /**@type {Phaser.Types.Input.keyboard.KeyCodes} */
    cursors
    /**@type {Phaser.Cameras.Scene2D.Camera} */
    camera
    /**@type {number} */
    dist
    constructor() {
        super('Scene1')
    }
    preload() {
        //players and keyboard
        this.load.image('landscape-tiles', 'assets/spaceTile.png')
        this.load.image('player', 'assets/Player.png')
        this.load.image('enemy', 'assets/enemy.png')
        this.load.image('bullet', 'assets/Projectile.png')
        this.cursors = this.input.keyboard.createCursorKeys()
        //json file
        this.load.tilemapTiledJSON('level1','assets/level1.json')

    }
    
    create() {
        //json
        this.map = this.make.tilemap({key: 'level1'})
        this.landscape = this.map.addTilesetImage('landscape-tiles', 'landscape-tiles')
        this.map.createLayer('midground', [this.landscape], 0, 0)
        this.map.createLayer('platforms', [this.landscape], 0, 0)
        //physics stuff
        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
        this.bullets = new Bullets(this)
        this.player = new CustomSprite(this, 100, 100, 'player')
        //this.player.setSize(14,24)
        this.player.setCollideWorldBounds(true)
        const collisionLayer = this.map.getLayer('platforms').tilemapLayer
        collisionLayer.setCollisionBetween(0,10000)
        //collisionLayer.setCollisionBetween(0, 1000)
        this.physics.add.collider(this.player, collisionLayer)
        this.customBounds = new Phaser.Geom.Rectangle(this.player.y,this.player.x,400,400)
        this.add.graphics().lineStyle(5, 0x00ffff, 1).strokeRectShape(this.customBounds)
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0,0, this.map.widthInPixels,this.map.heightInPixels)
        this.camera.startFollow(this.player)
        this.input.on('pointerdown', (pointer) => {
            this.bullets.fireBullet(this.player.x, this.player.y, this.player.flipX)

        })
        this.physics.world.on('worldbounds', this.worldBoundsBullet, this)
        
    }
    // createBaseLayer(){
    //     this.landscape = this.map.addTilesetImage('space-tileset', 'space-tileset')
    //     this.map.createLayer('midground', [this.landscape], 0, 0)
    //     this.map.createLayer('platforms', [this.landscapr], 0, 0)
    // }
    
    update() {
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(400)
            this.player.flipX = false
            
        }
        else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-400)
            this.player.flipX = true
            
        }
        else{
            this.player.setVelocityX(0)
        }
        
        
    }
    //added in for function within line 63
    worldBoundsBullet(body){
        console.log('out')
        console.log(this.bullets)
        this.bullets.killAndHide(body.gameObject)
    }

}
console.log('Base Scene')