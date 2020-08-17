/* globals Vec Collider */

class Sprite {
	constructor(url, width, height, mirrored = false) {
		this.img = new Image();
		this.width = width;
		this.height = height;
		this.mirrored = mirrored;
		this.img.src = url;
	}
}

class Entity {
	constructor(x, y, width, height) {
		this.pos = new Vec(x, y);
		this.sze = new Vec(width, height);
		this.vel = new Vec(0, 0);

		// previous x,y
		this.pre = new Vec(x, y);

		// interpolated x,y
		this.tmp = new Vec(0, 0);
	}

	get left() {
		return this.pos.x;
	}

	get right() {
		return this.pos.x + this.sze.x;
	}

	get top() {
		return this.pos.y;
	}

	get bottom() {
		return this.pos.y + this.sze.y;
	}

	set left(x) {
		this.pos.x = x;
	}

	set right(x) {
		this.pos.x = x - this.sze.x;
	}

	set top(y) {
		this.pos.y = y;
	}

	set bottom(y) {
		this.pos.y = y - this.sze.y;
	}

	interpolate(alpha) {
		// this.tmp.x = this.pos.x * alpha + this.pre.x * (1 - alpha);
		// this.tmp.y = this.pos.y * alpha + this.pre.y * (1 - alpha);

		this.tmp = this.pos.mlts(alpha).add(this.pre.mlts(1 - alpha));
	}

	draw(buf) {
		buf.fillStyle = "red";
		buf.fillRect(this.tmp.x, this.tmp.y, this.sze.x, this.sze.y);
	}

	applyPhysics(gravity, friction) {
		this.vel.x *= friction;
		this.vel.y += gravity;
	}

	update() {}
}

class Character extends Entity {
	constructor(x, y, width, height) {
		super(x, y, width, height);
		this.inputs = undefined;
		this.canJump = false;

		// friction but in the air
		this.airDrag = 0.95;

		this.speed;
		this.gndSpeed = 5;
		this.airSpeed = 0.5;
		this.jmpSpeed = 20;

		// for sprites
		this.mirrored = false;
		this.sprite = new Sprite("./assets/temp.png", this.sze.x, this.sze.y);
	}

	draw(buf) {
		if(!this.mirrored) buf.drawImage(this.sprite.img, 0, 0, this.sprite.img.width, this.sprite.img.height, this.tmp.x, this.tmp.y, this.sprite.width, this.sprite.height);
		else {
			buf.save();
			buf.translate(this.tmp.x + this.sze.x, this.tmp.y);
			buf.scale(-1, 1);
			buf.drawImage(this.sprite.img, 0, 0, this.sprite.img.width, this.sprite.img.height, 0, 0, this.sprite.width, this.sprite.height);
			buf.restore();
		}
	}

	update(gravity, friction) {
		this.pre = Vec.clone(this.pos);

		this.speed = this.canJump ? this.gndSpeed : this.airSpeed;

		if (this.inputs.left.down) this.vel.x -= this.speed;
		if (this.inputs.right.down) this.vel.x += this.speed;
		if (this.inputs.jump.pressed && this.canJump) {
			this.vel.y -= this.jmpSpeed;
			this.canJump = false;
		}

		this.applyPhysics(gravity, this.canJump ? friction : this.airDrag);

		if(Math.abs(this.vel.x) < 0.02) this.vel.x = 0;

		this.mirrored = this.vel.x < 0 ? true : this.vel.x > 0 ? false : this.mirrored;
		
		this.pos = this.pos.add(this.vel);
	}
}

class World {
	constructor(buf, width, height) {
		this.buf = buf;
		this.buf.canvas.width = width;
		this.buf.canvas.height = height;

		this.width = width;
		this.height = height;

		// set in main after load
		this.level = undefined;

		this.gravity = 3;
		this.friction = 0.7;

		this.collider = new Collider();
		this.player1 = new Character(0, 0, 30, 80);
		this.players = [this.player1];
		this.entities = [];

		// set initialised in engine.js
		this.inputcont = undefined;
		this.collideViewport = true;
	}

	initInputs(inputcont) {
		this.inputcont = inputcont;
		this.player1.inputs = inputcont.p1;
	}

	drawEntities(alpha) {
		for (let p of this.players) {
			p.interpolate(alpha);
			p.draw(this.buf);
		}

		for (let e of this.entities) {
			e.interpolate(alpha);
			e.draw(this.buf);
		}
	}

	update() {
		for (let p of this.players) {
			if (this.collideViewport) {
				p.update(this.gravity, this.friction);

				this.collider.collide(p, this.level);

				if (p.right > this.width) {
					p.right = this.width;
					p.vel.x = 0;
				} else if (p.left < 0) {
					p.left = 0;
					p.vel.x = 0;
				}

				if (p.bottom > this.height) {
					p.bottom = this.height;
					p.vel.y = 0;
					p.canJump = true;
				} else if (p.top < 0) {
					p.top = 0;
					p.vel.y = 0;
				}
			}
		}

		for (let e of this.entities) {
			e.update(this.gravity, this.friction);
		}
	}
}
