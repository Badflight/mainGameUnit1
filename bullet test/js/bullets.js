class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet')
    }
    
    fire(x, y, flipX) {
        this.body.reset(x, y)
        // this.enableBody(true,x,y,true,true)
        this.enableBody(false)
        this.pX=x
        this.pY=y
        this.body.collideWorldBounds = true
        this.body.allowGravity = false
        console.log(this.body.collision)
        //console.log(this.body)
        //console.log(this.body)
        if (flipX === false) {
            //this.body.enableBody()
            this.setActive(true)
            this.setVisible(true)
            this.setVelocityX(600)
        }
        else if(flipX === true){
            this.setActive(true)
            this.setVisible(true)
            this.setVelocityX(-600)
        }
    }
    colB(){
        console.log('hit2')
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta)
        let dist=Phaser.Math.Distance.Between(this.pX,this.pY,this.body.x,this.body.y)
        if(dist>=400){
            this.disableBody(true,true)
        }
       
        
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
            //bullet.enableBody(true)
            bullet.fire(x, y, flipX)
            bullet.body.onWorldBounds = true;
            console.log(this.player)
        }   
    }

    colBullet(){
        console.log('hit1')
    }
    
   
}