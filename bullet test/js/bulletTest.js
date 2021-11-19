class CustomSprite extends Phaser.Physics.Arcade.Sprite {
    jumpCount =0
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
    dist
    /**@type {Phaser.Physics.Arcade.Group} */
    badGuys
    /**@type {Phaser.Physics.Arcade.Collider} */
    badGuysCollider
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
        this.keyboardKeys = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        //json file
        this.load.tilemapTiledJSON('level1','assets/level1.json')

    }
    
    create() {
        //json level stuff
        this.map = this.make.tilemap({key: 'level1'})
        this.landscape = this.map.addTilesetImage('landscape-tiles', 'landscape-tiles')
        this.map.createLayer('midground', [this.landscape], 0, 0)
        this.map.createLayer('platforms', [this.landscape], 0, 0)
        //physics stuff
        this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
        this.bullets = new Bullets(this)
        this.player = new CustomSprite(this, 100, 100, 'player')
        this.player.setCollideWorldBounds(true)
        const collisionLayer = this.map.getLayer('platforms').tilemapLayer
        collisionLayer.setCollisionBetween(0,10000)
        //colliders
        this.physics.add.collider(this.player, collisionLayer)
        this.physics.add.collider(this.bullets, collisionLayer,this.platBullet,null,this)
        //this.physics.add.overlap(this.bullets, this.badGuysCollider,this.bulEnemyCol,null, this)
        //this.physics.add.overlap(this.bullets,this.enemy,this.platBullet(this.bullets),null,this)
        //camera set up
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0,0, this.map.widthInPixels,this.map.heightInPixels)
        this.camera.startFollow(this.player)
        this.input.on('pointerdown', (pointer) => {
            this.bullets.fireBullet(this.player.x, this.player.y, this.player.flipX)
        })
        this.physics.world.on('worldbounds', this.worldBoundsBullet, this)
        console.log(this.physics)
        //enemies---------------------------------------------------------------------
        this.badGuys = this.physics.add.group()
        let badGuyPoints = BulletTest.FindPoints(this.map,'objectLayer','enemy')
        console.log(badGuyPoints)
        /**@type {number} */
        let len = badGuyPoints.length/2
        /**@type {object} */
        let enemySpawn
        /**@type {object}*/
        let enemyDest
        /**@type {Phaser.Curves.Path} */
        let line
        /**@type {Phaser.GameObjects.PathFollower} */
        let enemy
        //loop for enemies
        for(let i = 1;i<=len;i++){
            enemySpawn = BulletTest.FindPoint(this.map,'objectLayer','enemy','enemySpawn'+i)
            enemyDest = BulletTest.FindPoint(this.map,'objectLayer','enemy','enemyDest'+i)
            line = new Phaser.Curves.Path(enemySpawn.x,enemySpawn.y).lineTo(enemyDest.x, enemyDest.y)
            enemy = this.add.follower(line, enemySpawn.x, enemySpawn.y, 'enemy')
            enemy.startFollow({
                duration:1500,
                repeat:-1,
                yoyo:true,
                ease:'Sine.easeInOut'
            })
            this.badGuys.add(enemy)
            enemy.body.allowGravity = false
            console.log(i)
        }
        this.badGuysCollider = this.physics.add.overlap(this.bullets,this.badGuys, this.bulEnemyCol,null,this)
        console.log(this.keyboardKeys)
        
    }

    
    update() {
        //arrow keys to move
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(400)
            this.player.flipX = false
            //this.customBounds.setPosition(this.player.x,0)
            //console.log(this.customBounds)
            
        }
        else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-400)
            this.player.flipX = true
            
        }
        else{
            this.player.setVelocityX(0)
        }
        //jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)&&this.player.jumpCount< this.player.jumpMax){
            this.player.jumpCount++;
            this.player.setVelocityY(-400 )
        }
        if(this.player.body.touching.down ||this.player.body.blocked.down){
            this.player.jumpCount = 0
        }
        if(Phaser.Input.Keyboard.JustDown(this.keyboardKeys)){
            this.bullets.fireBullet(this.player.x, this.player.y, this.player.flipX)
            console.log('f down')
        }
        //console.log(badGuyPoints)
        
    }
    //added in for function within the world collider
    worldBoundsBullet(body){
        console.log('out')
        //console.log(this.bullets)
        this.bullets.killAndHide(body.gameObject)
    }
    
    platBullet(bullet){
        //console.log(bullet)
        this.bullets.killAndHide(bullet)
    }
    bulEnemyCol(bullet,badGuys){
        console.log(badGuys)
        //badGuys.disableBody(true,true)
        // badGuys.setActive(false)
        // badGuys.setVisible(false)
        badGuys.destroy(true)
        //console.log(badGuys.active)
        console.log('bye')
    }
    static FindPoint(map,layer,type,name){
        var loc = map.findObject(layer,function(object){
            if(object.type ===type && object.name ===name){
                return object
            }
        })
        return loc
        }
    static FindPoints(map, layer, type){
        var locs = map.filterObjects(layer, function(object){
            if(object.type===type){
                return object
            }
        })
        return locs
    }

}
console.log('Base Scene')