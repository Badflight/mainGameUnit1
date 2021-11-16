class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet')
    }
    
    fire(x, y, flipX) {
        this.body.reset(x, y)
        this.body.collideWorldBounds = true
        this.body.allowGravity = false
        console.log(this.body)
        if (flipX === false) {
            this.setActive(true)
            this.setVisible(true)
            this.setVelocityX(800)
        }
        else if(flipX === true){
            this.setActive(true)
            this.setVisible(true)
            this.setVelocityX(-800)
        }

        

    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta)
        console.log(delta)
        if (this.body.onWorldBounds == false){
            console.log(this.body.onWorldBounds)
        }
        // if (this.x > 1000) {
        //     this.setActive(false)
        //     this.setVisible(false)
        //     console.log('goneR')
        // }
        // else if (this.x<= 0){
        //     this.setActive(false)
        //     this.setVisible(false)
        //     console.log('goneL')
        // }
        
    }
    worldBoundsBullet(body){
        console.log('stuck')
    }
}
class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene)
        this.createMultiple({
            frameQuantity: 2,
            key: 'bullet',
            active: false,
            visible: false,
            collideWorldBounds: true,
            classType: Bullet
        });
    }
    fireBullet(x, y,flipX) {
        let bullet = this.getFirstDead(false)
        if (bullet) {
            bullet.fire(x, y, flipX)
            bullet.body.onWorldBounds = true;
            console.log(this.body)
        }
        
    }
   
}