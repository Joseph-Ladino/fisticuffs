/* globals Vec Rect Collider world */

class Sprite {
	constructor(url, width, height, mirrored = false) {
		this.img = new Image();
		this.width = width;
		this.height = height;
		this.mirrored = mirrored;
		this.img.src = url;
	}
}

class Entity extends Rect {
	constructor(x, y, width, height) {
		super(new Vec(x, y), new Vec(width, height));
		this.vel = new Vec(0, 0);

		// previous x,y
		this.pre = new Vec(x, y);

		// interpolated x,y
		this.tmp = new Vec(0, 0);
	}

	get boundingBox() {
		let out = new Rect(new Vec(0, 0), new Vec(0, 0));

		if (this.vel.x > 0) {
			out.pos.x = this.pos.x;
			out.sze.x = this.sze.x + this.vel.x;
		} else {
			out.pos.x = this.pos.x + this.vel.x;
			out.sze.x = this.sze.x - this.vel.x;
		}

		if (this.vel.y > 0) {
			out.pos.y = this.pos.y;
			out.sze.y = this.sze.y + this.vel.y;
		} else {
			out.pos.y = this.pos.y + this.vel.y;
			out.sze.y = this.sze.y - this.vel.y;
		}

		return out;
	}

	interpolate(alpha) {
		this.tmp = this.pos.mlts(alpha).add(this.pre.mlts(1 - alpha));
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
		this.type = "char";
		this.inputs = undefined;
		this.canJump = false;
		this.jump1 = false;
		this.jump2 = false;

		// friction but in the air
		this.airDrag = 0.95;

		this.speed;
		this.gndSpeed = 5;
		this.airSpeed = 0.5;
		this.jmpSpeed = 32;

		// for sprites
		this.mirrored = false;
		this.sprite = new Sprite("./assets/temp.png", this.sze.x, this.sze.y);
	}

	draw(buf) {
		if (!this.mirrored)
			buf.drawImage(this.sprite.img, 0, 0, this.sprite.img.width, this.sprite.img.height, this.tmp.x, this.tmp.y, this.sprite.width, this.sprite.height);
		else {
			buf.save();
			buf.translate(this.tmp.x + this.sze.x, this.tmp.y);
			buf.scale(-1, 1);
			buf.drawImage(this.sprite.img, 0, 0, this.sprite.img.width, this.sprite.img.height, 0, 0, this.sprite.width, this.sprite.height);
			buf.restore();
		}

		if (world.debug) {
			buf.strokeStyle = "#FFFFFF";
			let aabb = this.boundingBox;
			buf.strokeRect(aabb.pos.x, aabb.pos.y, aabb.sze.x, aabb.sze.y);
		}
	}

	resetJumps() {
		this.canJump = true;
		this.jump1 = false;
		this.jump2 = false;
	}

	update(gravity, friction) {
		this.pre = Vec.clone(this.pos);

		this.speed = this.canJump ? this.gndSpeed : this.airSpeed;

		if (this.inputs.left.down) this.vel.x -= this.speed;
		if (this.inputs.right.down) this.vel.x += this.speed;
		if (this.inputs.jump.pressed && this.canJump) {
			this.vel.y = -this.jmpSpeed;

			if (!this.jump1) this.jump1 = true;
			else if (!this.jump2) {
				this.jump2 = true;
				this.canJump = false;
			}
		}

		this.applyPhysics(gravity, this.canJump ? friction : this.airDrag);

		if (Math.abs(this.vel.x) < 0.02) this.vel.x = 0;

		this.mirrored = this.vel.x < 0 ? true : this.vel.x > 0 ? false : this.mirrored;
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
		this.player0 = new Character(0, 0, 80, 200);
		this.player1 = new Character(80, 0, 80, 200);
		this.player2 = new Character(160, 0, 80, 200);
		this.player3 = new Character(240, 0, 80, 200);
		this.players = {};
		this.entities = [];
		this.collisionBoxes = [new Rect(new Vec(450, 540), new Vec(30, 200)), new Rect(new Vec(540, 450), new Vec(200, 30))];

		// set initialised in engine.js
		this.inputcont = undefined;
		this.collideViewport = true;
		this.debug = false;
	}

	initInputs(inputcont = this.inputcont) {
		this.inputcont = inputcont;
		this.player0.inputs = inputcont.p0;
		this.players[0] = this.player0;
		
		// never do this again
		for(let i = 1; i <= 3; i++) {
			if(inputcont[`p${i}cont`]) {
				this.players[i] = this[`player${i}`];
				this.players[i].inputs = inputcont[`p${i}`];
			} else delete this.players[i];
		}
	}

	drawEntities(alpha) {
		for (let i in this.players) {
			let p = this.players[i];
			p.interpolate(alpha);
			p.draw(this.buf);
		}

		for (let e of this.entities) {
			e.interpolate(alpha);
			e.draw(this.buf);
		}

		for (let c of this.collisionBoxes) {
			c.draw(this.buf);
		}
	}

	update() {
		for (let i in this.players) {
			let p = this.players[i];
			p.update(this.gravity, this.friction);

			this.test = this.collisionBoxes[0];
			this.sortedBoxes = Array.from(this.collisionBoxes);
			this.sortedBoxes.sort((a, b) => p.pos.sub(a.pos).magSqr - p.pos.sub(b.pos).magSqr);

			this.collider.collide(p, this.sortedBoxes);

			p.pos = p.pos.add(p.vel);

			if (this.collideViewport) {
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
					p.resetJumps();
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
