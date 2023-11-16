
title = "SHADOW&SHOOTER";

description = `
Click to blast
Hold to move
`;

characters = [
`
 ll
 ll
cllc
cllc
cllc
c  c
`,
`
 ll
 ll
llll
llll
llll
l  l
`,`
r  r
rrrr
rppr
rrrr
 rr
 rr
`,`
y  y
yyyy
yppy
yyyy
 yy
 yy
`
];

// Game design variable container
const G = {
	WIDTH: 100,
	HEIGHT: 150,

    STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,
    
    PLAYER_FIRE_RATE: 10,
    PLAYER_GUN_OFFSET: 3,

    ENEMY_SPEED: 0.5,

    FBULLET_SPEED: 5
};

// Game runtime options
// Refer to the official documentation for all available options
options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    //isCapturingGameCanvasOnly: true,
    isReplayEnabled: true,

};

// JSDoc comments for typing
/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type { Star [] }
 */
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;
let subplayer;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;

/**
 * @typedef {{
* pos: Vector
* speed: number
* trap: number
* level: number
* }} Enemy
*/

/**
* @type { Enemy [] }
*/
let enemies;

let count;
let trapnum;
let rand;
let set;
let scount;

function update() {
    if(score < 0){
        player = subplayer = enemies = fBullets = set = null;
        end();
    }
	if (!ticks) {
		stars = times(20, () => {
            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            return {
                pos: vec(posX, posY),
                speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
            };
        });

        player = {
            pos: vec(2, G.HEIGHT - 3)
        };

        subplayer = {
            pos: vec(2, G.HEIGHT - 3)
        };
        //player shadow
        enemies = [];
        fBullets = [];
        count = 0;
        trapnum = 0;
        rand = 0;
        scount = 11;
        set = new Set();
	}

    color("red");
    rect(0, 6, G.WIDTH/20 * scount, 3);
    if(scount > 20){
        scount = 20;
    }
    if(scount <= 0){
        end();
    }

    if (enemies.length === 0 || enemies[0].pos.y == G.HEIGHT*2/3) {
        scount--;
        set = new Set();
        for(let i = 0; i < 4; i++){
            set.add(Math.ceil(rnd(1, 16)));
        }
        for (let i = 1; i < 16; i++) {
            if(set.has(i)){
                trapnum = 2;
            }
            else{
                trapnum = 1;
            }
            const posX = 2 + i * 6;
            const posY = 0;
            enemies.push({ pos: vec(posX, posY), trap: trapnum, speed: G.ENEMY_SPEED, level: 1});
        }
    }

    stars.forEach((s) => {
        s.pos.y += s.speed;
        if (s.pos.y > G.HEIGHT) s.pos.y = 0;
        color("light_black");
        box(s.pos, 1);
    });

    //text(fBullets.length.toString(), 3, 10);
    if(subplayer.pos.x > G.WIDTH - 2){
        subplayer.pos.x = player.pos.x;
    }
    //player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
    if (input.isJustPressed) {
        subplayer.pos.x += 6;
    }
    else if(input.isPressed){
        count++;
        if(count == 10){
            subplayer.pos.x += 6;
            count = 0;
        }
        color ("black");
        char("b", subplayer.pos.x, subplayer.pos.y);
    }
    else if(input.isJustReleased){
        player.pos.x = subplayer.pos.x;
        fBullets.push({
            pos: vec(player.pos.x, player.pos.y)
        });
        color("yellow");
        particle(player.pos.x, player.pos.y, 4, 1, -PI/2, PI/4 );
        count = 0;
    }
    if(player.pos.x == G.WIDTH - 2 && input.isJustPressed){
        player.pos.x = 2;
        subplayer.pos.x = 2;
    }
    color ("black");
    char("a", player.pos);
    // Updating and drawing bullets

    fBullets.forEach((fb) => {
        // Move the bullets upwards
        fb.pos.y -= G.FBULLET_SPEED;
        // Drawing
        color("yellow");
        box(fb.pos, 2);
    });


    remove(enemies, (e) => {
        e.pos.y += e.speed;
        color("black");
        const isCollidingWithFBullets = char(e.trap == 1?"c":"d", e.pos)
        .isColliding.rect.yellow;
        if (isCollidingWithFBullets) {
            if(e.trap == 1){
                color("yellow");
                addScore(3, e.pos);
                scount++;
            }
            else{
                color("red");
                scount = scount - 3;
            }
            particle(e.pos);
        }
        if(e.pos.y > G.HEIGHT){
            if(e.trap == 1){
                scount--;
            }
            else{
                addScore(1, e.pos);
            }
        }
        return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
    });

    remove(fBullets, (fb) => {
        color("yellow");
        const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.c;
        return (isCollidingWithEnemies || fb.pos.y < 0);
    });
}

