window.addEventListener("load" , ()=>{
    const canvas  = document.querySelector("#canvas1");
    const ctx = canvas.getContext('2d');
    canvas.width = 1000 ; 
    canvas.height = 500 ; 
    class inputhandler{
       constructor(game){
           this.game = game ; 
           window.addEventListener("keydown" , e=> {
               if((e.key === 'ArrowUp')||
               (e.key === 'ArrowDown')
                && this.game.keys.indexOf(e.key) === -1 ){
                   this.game.keys.push(e.key);
               }else if(e.key === " "){ 
                   this.game.player.shoottop();
               }else if(e.key == 'd'){
                   this.game.debug = !this.game.debug;
               }
           })       
           window.addEventListener("keyup" , e =>{
               if (this.game.keys.indexOf(e.key) > -1 ){ 
                   this.game.keys.splice(this.game.keys.indexOf(e.key), 1);  
               }
           })
       }
    }
    class Projectile{
        constructor(game , x , y){
            this.game = game ;
            this.x = x ; 
            this.y= y; 
            this.width= 10 ; 
            this.height = 3; 
            this.speed= 3 ;
            this.markedfordeletion = false;  
            this.image =document.querySelector("#projectile");
        }
        update(){
            this.x += this.speed ;
            if(this.x > this.game.width * 0.8) this.markedfordeletion = true ; 
        }
        draw(context){
           context.drawImage(this.image, this.x , this.y);
        }
    }
    class particle{
        constructor(game , x , y ){
            this.game = game ; 
            this.x = x ;    
            this.y = y ; 
            this.image = document.querySelector("#gears");
            this.framex = Math.floor(Math.random() * 3 );
            this.framey = Math.floor(Math.random() * 3 );
            this.spritsize  = 50  ;
            this.sizeModifier = (Math.random() * 0.5 + 0.5 ).toFixed(1);
            this.size = this.spritsize * this.sizeModifier ; 
            this.speedx =  Math.random() * 6 - 3 ;
            this.speedy = Math.random() * -15 ; 
            this.gravity = 0.5  ;
            this.markedfordeletion = false ; 
            this.angle = 0 ; 
            this.va = Math.random() * 0.2 - 0.1 ; 
            this.bounced = 0  ;
            this.bottomBounce= Math.random() * 80 + 60 ; 
        }
        update(){
            this.angle += this.va ;
            this.speedy += this.gravity ; 
            this.x -= this.speedx ; 
            this.y += this.speedy ; 
            if (this.y > this.game.height + this.size || this.x < 0 - this.size ){
                this.markedfordeletion = true ; 
            }
            if(this.y > this.game.height - this.bottomBounce && this.bounced < 5){
                this.bounced++ ;
                this.speedy *= -0.7 ;
            }
        }
        draw(context){
            context.save();
            context.translate(this.x , this.y);
            context.rotate(this.angle);
            context.drawImage(this.image , this.framex * this.spritsize , this.framey * this.spritsize , this.spritsize , this.spritsize , this.size * -0.5   , this.size * -0.5  , this.size, this.size )
            context.restore();
        }
    }
    class player{
        constructor(game){
            this.game = game ;    
            this.width = 120 ;   
            this.height = 190 ;     
            this.x = 20 ;    
            this.y = 100 ; 
            this.framex= 0 ; 
            this.framey= 0 ;
            this.maxframe = 37 ; 
            this.speedy = 0; 
            this.maxspeed = 3 ;
            this.projectiles = [];
            this.image = document.querySelector("#player");
            this.powerup = false ; 
            this.poweruptimer = 0 ;
            this.poweruplimit = 10000;
        }
        update(deltatime){
            if(this.game.keys.includes("ArrowUp")) this.speedy = -this.maxspeed;
            else if(this.game.keys.includes("ArrowDown"))this.speedy = this.maxspeed ; 
            else this.speedy = 0 ; 
            this.y += this.speedy
            // dont cross the line y ; 
            if(this.y > this.game.height - this.height * 0.5){
                this.y = this.game.height - this.height * 0.5 ; 
            }
           else if(this.y < -this.height * 0.5){ this.y =  -this.height * 0.5}
            this.projectiles.forEach(projectile => {
                projectile.update();
            })
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedfordeletion)
        //   change frame of image 
        if(this.framex < this.maxframe){
            this.framex++ ; 
        }else{
         this.framex = 0 ;}
         if(this.powerup){
             if(this.poweruptimer > this.poweruplimit){
                 this.poweruptimer = 0 ;
                 this.powerup = false ; 
                 this.framey = 0 ;
             }else {
                 this.poweruptimer += deltatime;
                 this.framey = 1 ;
                 this.game.ammo += 0.1;
             }
         }
        }

        draw(context){
          if(this.game.debug) context.strokeRect(this.x , this.y , this.width , this.height);
            context.drawImage(this.image, this.framex * this.width , this.framey * this.height , this.width , this.height , this.x , this.y , this.width , this.height)
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            })
        }
        shoottop(){
            if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game , this.x+80  , this.y+30));
            this.game.ammo-- ; 
        }
        if(this.powerup)this.shootbottom();
     }
     shootbottom(){
         if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game , this.x+80  , this.y+175));
           
         }
     }
     enterpower(){
        this.poweruptimer = 0 ;
        this.powerup = true ;
       if(this.game.ammo < this.game.maxammo) this.game.ammo = this.game.maxammo;
     } 
      }

    class Enemy{
        constructor(game){
            this.game = game ; 
            this.x = this.game.width; 
            this.speedx = Math.random() * -1.5 - 0.5 ; 
            this.markedfordeletion = false; 
            this.framex= 0 ;
            this.framey = 0 ; 
            this.maxframe = 37 ;
        }
        update(){
            this.x += this.speedx - this.game.speed; 
            if(this.framex < this.maxframe){
                this.framex++;
            }else{
                this.framex = 0 ; 
            }
           if (this.x + this.width <  0) this.markedfordeletion = true ;
           
        }
        draw(context){
         if(this.game.debug) context.strokeRect(this.x , this.y , this.width , this.height );
           context.drawImage(this.image ,this.framex * this.width, this.framey * this.height, this.width, this.height ,  this.x, this.y,this.width, this.height )
         if (this.game.debug){
           context.font = '20px Helvetica'; 
           context.fillText(this.lives , this.x , this.y);
        }
     }
    }
    class Angler1 extends Enemy {
        constructor(game){
         super(game); 
         this.width = 228 ; 
         this.height = 169  ;
               this.lives = 3 ;
            this.score = this.lives ;
         this.y = Math.random() * (this.game.height * 0.9 - this.height);
         this.image = document.querySelector("#angler1");
         this.framey = Math.floor(Math.random() * 2); 
        }
    }
    class Angler2 extends Enemy {
        constructor(game){
         super(game); 
         this.width = 213 ; 
         this.height = 165  ;
              this.lives = 2;
            this.score = this.lives ;
         this.y = Math.random() * (this.game.height * 0.9 - this.height);
         this.image = document.querySelector("#angler2");
         this.framey = Math.floor(Math.random() * 3); 
        }
    }
    class luckyfish extends Enemy {
        constructor(game){
         super(game); 
         this.width = 99 ; 
         this.height = 95 ;
              this.lives = 3;
            this.score = this.lives ;
         this.y = Math.random() * (this.game.height * 0.9 - this.height);
         this.image = document.querySelector("#lucky");
         this.framey = Math.floor(Math.random() * 3); 
         this.score = 15 ;
         this.type = 'lucky' ;
        }
    }
    class HiveWhale extends Enemy {
        constructor(game){
         super(game); 
         this.width = 400 ; 
         this.height = 227 ;
              this.lives = 15;
            this.score = this.lives ;
         this.y = Math.random() * (this.game.height * 0.9 - this.height);
         this.image = document.querySelector("#HivWhale");
         this.framey = 0; 
         this.type = 'hive' ;
         this.speedx = Math.random() * -1.2 - 0.2 ;
        }
    }
    class Drone  extends Enemy {
        constructor(game , x , y){
         super(game); 
         this.width = 115 ; 
         this.height = 95 ;
              this.lives = 15;  
            this.score = this.lives ;
        this.x = x ;
         this.y = y;
         this.image = document.querySelector("#drone");
         this.framey = Math.floor(Math.random() * 2);  
         this.type = 'drone' ;
         this.speedx = Math.random() * -4.2 - 0.5 ;
        }
    }
     class layer{
        constructor(game , image , speedmodifier){
            this.game = game; 
            this.image = image ;
            this.speedmodifier = speedmodifier;
            this.width = 1768 ;
            this.height = 500 ;
            this.x = 0 ;
            this.y = 0 ;
        }
        update(){
            if(this.x < -this.width) this.x = 0     
             this.x -= this.game.speed * this.speedmodifier;
        }
        draw(context){
            context.drawImage(this.image ,this.x, this.y );
            context.drawImage(this.image ,this.x + this.width, this.y );
        }
    }
    class background{
        constructor(game){
         this.game = game;
         this.image1 = document.querySelector("#layer1");
         this.image2 = document.querySelector("#layer2");
         this.image3 = document.querySelector("#layer3");
         this.image4 = document.querySelector("#layer4");
         this.layer1 = new layer(this.game , this.image1 , 0.2);
         this.layer2 = new layer(this.game , this.image2 , 0.4);
         this.layer3 = new layer(this.game , this.image3 , 1);
         this.layer4 = new layer(this.game , this.image4 , 1.5);
         this.layers = [this.layer1 , this.layer2, this.layer3 , this.layer4];
        }
        update(){
            this.layers.forEach(laye => laye.update());
        }  
        draw(context){
            this.layers.forEach(laye => laye.draw(context));
        }
    }
    class Explostion{
        constructor(game , x ,y ){
            this.game = game ;
            this.framex = 0 ;
            this.spiritwidth = 200 ; 
            this.spiritHeight = 200 ;
            this.width = this.spiritwidth; 
            this.height=  this.spiritHeight;
            this.x = x - this.width * 0.5;  
            this.y = y - this.height * 0.5; 
            this.fbs = 15
            this.timer = 0 ;
            this.interval = 1000/this.fbs ;
            this.markedfordeletion = false ; 
            this.maxframe = 8  ;
        }
        update(deltatime){
            this.x -= this.game.speed;
            if(this.timer > this.interval){
            if(this.framex > this.maxframe) {
                this.framex =  0 ;
                this.markedfordeletion = true}  else this.framex++ ; 
            this.timer = 0 ;
            } else {
                this.timer += deltatime ;
            }
        }
        draw(context){
            context.drawImage(this.image, this.framex * this.spiritwidth  , 0,this.spiritwidth, this.spiritHeight, this.x , this.y , this.width , this.height );
        }
    }
    class smokeexploition extends Explostion {
        constructor(game , x, y ){
            super(game , x , y);
            this.image = document.querySelector("#smoke");
        }
    }
    class Fireexploition extends Explostion {
        constructor(game , x, y ){
            super(game , x , y);
            this.image = document.querySelector("#fire");
        }
    }
    class UI{
        constructor(game){
           this.game = game ; 
           this.fontsize = 25 ;
           this.fontFamily= 'Helvetica' ; 
           this.color = "white" ;
        }
        draw(context){
            context.save();
            context.fillStyle = this.color ; 
            context.font = this.fontsize + 'px' + this.fontFamily; 
            context.fillText('Score: ' + this.game.score , 20, 40)
            if(this.game.player.powerup) context.fillStyle = '#ffffbd' ;
            for(let i = 0 ; i < this.game.ammo ; i++){
                context.fillRect(20 + 5 * i , 50 , 3 ,20 );
            }
            const formattime = (this.game.gametime * 0.001 ).toFixed(1);
            context.fillText("timer: " + formattime , 20 , 100);
            if(this.game.gameover){
                context.textAlign = "center" ; 
                let message1 ; 
                let message2 ;
                if (this.game.score > this.game.winningscore){
                    message1 = 'you win wonderfull ';
                    message2 = 'well done '; 
                }else {
                    message1 = 'you lose dont worry' ;         
                    message2 = 'try again '; 
                }   
                context.font = '70 px' + this.fontFamily ;
                context.fillText(message1 , this.game.width * 0.5 , this.game.height * 0.5 - 40) 
                context.font = '100 px' + this.fontFamily ;
                context.fillText(message2 , this.game.width * 0.5 , this.game.height * 0.5 + 40)
            }
            context.restore();  
        }
    }
    class Game{
        constructor(width , height){
            this.width = width ; 
            this.height = height ;
            this.background = new background(this);
            this.ul  = new UI(this)
            this.player = new player(this);
            this.input = new inputhandler(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.Explostions = [];
            this.timeenemy = 0 ; 
            this.timeinterval = 2000; 
            this.ammo = 20 ;
            this.maxammo = 50 ; 
            this.ammotimer = 0 ; 
            this.ammointerval = 350 ; 
            this.gameover = false ; 
            this.score = 0 ; 
            this.winningscore = 100 ; 
            this.gametime = 0  ;
            this.timelimit= 25000 ;     
            this.speed = 3; 
            this.debug = false ;
        }
        update(deltatime){
             
            if(!this.gameover) this.gametime += deltatime ;
            if (this.gametime > this.timelimit){
                this.gameover = true ;
            } 
             this.background.update();
            this.player.update(deltatime);
            if(this.ammotimer > this.ammointerval){
                if(this.ammo< this.maxammo) this.ammo++ ;
                   this.ammotimer = 0 ; 
            }else {
                this.ammotimer += deltatime
            }
            this.particles.forEach(partic => partic.update());
           this.particles =  this.particles.filter(partic => !partic.markedfordeletion);
           this.Explostions.forEach(explistion => explistion.update(deltatime));
           this.Explostions =  this.Explostions.filter(explistion => !explistion.markedfordeletion);
            this.enemies.forEach(enemy => {
                enemy.update()
                if(this.checkcollision(this.player, enemy)){
                    enemy.markedfordeletion = true ;
                    this.addexplostion(enemy);
                    for(let i = 0 ; i < 6 ; i++){
                        this.particles.push(new particle(this, enemy.x + enemy.width * 0.5 , enemy.y + enemy.height * 0.5))
                    }
                    if(enemy.type == 'lucky'){
                        this.player.enterpower();
                    }else if(!this.gameover){
                        this.score-- ;  
                    }
                }
            this.player.projectiles.forEach(projectile =>{
                if(this.checkcollision(projectile, enemy)){
                    enemy.lives-- ; 
                    projectile.markedfordeletion = true ; 
                this.particles.push(new particle(this, enemy.x + enemy.width * 0.5 , enemy.y + enemy.height * 0.5))
                    if(enemy.lives <= 0 ){
                        for(let i = 0 ; i < 6 ; i++){
                            this.particles.push(new particle(this, enemy.x + enemy.width * 0.5 , enemy.y + enemy.height * 0.5))
                        }
                         enemy.markedfordeletion = true ; 
                    this.addexplostion(enemy);
                         if(enemy.type === 'hive'){
                             for(let i = 0 ; i < 5 ; i++){  
                                 this.enemies.push(new Drone(this , enemy.x + Math.random() * enemy.width , enemy.y + Math.random() * enemy.height * 0.5));    
                           }
                         }                        
                    if (!this.gameover) this.score += enemy.score;    
                    if(this.score > this.winningscore)this.gameover = true ;  
                    }   
                }
            })
            })
            this.enemies = this.enemies.filter(enemy => !enemy.markedfordeletion)
            if(this.timeenemy > this.timeinterval && !this.gameover){
                this.addenemy();
                this.timeenemy = 0 ;
            }else {
                this.timeenemy += deltatime ;
            }
        }
        draw(context){
            this.background.draw(context);
            this.ul.draw(context);
            this.player.draw(context);
            this.particles.forEach(partic => partic.draw(context));
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
            this.Explostions.forEach(explistion => {
                explistion.draw(context);
            })
        }
        addenemy(){ 
            const ramdomize = Math.random(); 
            if(ramdomize < 0.3){
               this.enemies.push(new luckyfish(this));
            }else if (ramdomize < 0.6) {
               this.enemies.push(new Angler1(this));
            }else if(ramdomize < 0.8){
                this.enemies.push(new HiveWhale(this));
            }else {
               this.enemies.push(new Angler1(this));}      
        }
        addexplostion(enemy){
            const randomize = Math.random();
            if(randomize < 0.5 ) {this.Explostions.push(new smokeexploition(this , enemy.x + enemy.width * 0.5  , enemy.y + enemy.height * 0.5))
            }else {
                this.Explostions.push(new Fireexploition(this , enemy.x + enemy.width * 0.5  , enemy.y + enemy.height * 0.5))
            }
        }

        checkcollision(rect1 , rect2){
            return (
                rect1.x < rect2.x + rect2.width && 
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height && 
                rect1.y + rect1.height > rect2.y )
        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lasttime = 0 
  function animate(timestamp){
      let deltatime = timestamp - lasttime ;
      lasttime =timestamp ;
      ctx.clearRect(0, 0 , canvas.width ,canvas.height);
      game.update(deltatime);
      game.draw(ctx);
      requestAnimationFrame(animate);
      }
      animate(0);
})