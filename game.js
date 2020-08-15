class Entity {
	constructor(x, y, width, height) {
		this.w = width;
		this.h = height;

		this.x = x;
		this.y = y;

		// previous x,y
		this.px = x;
		this.py = y;

		// velocity x,y
		this.vx = 0;
		this.vy = 0;

		// temp x,y used for rendering after interpolation
		this.tx = 0;
        this.ty = 0;
	}

	get left() {
		return this.x;
	}

	get right() {
		return this.x + this.w;
	}

	get top() {
		return this.y;
	}

	get bottom() {
		return this.y + this.h;
	}

	interpolate(alpha) {
		this.tx = this.x * alpha + this.px * (1 - alpha);
		this.ty = this.y * alpha + this.py * (1 - alpha);
	}

	draw(buf) {
		buf.fillStyle = "red";
		buf.fillRect(this.tx, this.ty, this.w, this.h);
    }
    
    applyPhysics(gravity, friction) {
        this.vy += gravity;
        this.vx *= friction;
    }

    update() {}
}

class Character extends Entity {
	constructor(x, y, width, height) {
		super(x, y, width, height);
	}

	update(gravity, friction) {
        this.px = this.x;
        this.py = this.y;

        this.applyPhysics(gravity, friction);

        this.x += this.vx;
        this.y += this.vy;
    }
}

class World {
	constructor(buf, width, height) {
        this.buf = buf;
        this.buf.canvas.width = width;
        this.buf.canvas.height = height;

		this.width = width;
        this.height = height;
        
        this.gravity = 2;
        this.friction = 0.95;
        
        this.player1 = new Character(0, 0, 40, 100);

        this.entities = [this.player1];
    }

    drawEntities(alpha) {
        for(let e of this.entities) {
            e.interpolate(alpha);
            e.draw(this.buf);
        }
    }

    update() {
        for(let e of this.entities) {
            e.update(this.gravity, this.friction);
        }
    }
}
