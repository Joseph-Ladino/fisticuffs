/* globals world buf */

class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	// vector arithmetic
	add(v) {
		return new Vec(this.x + v.x, this.y + v.y);
	}
	sub(v) {
		return new Vec(this.x - v.x, this.y - v.y);
	}
	mlt(v) {
		return new Vec(this.x * v.x, this.y * v.y);
	}
	div(v) {
		return new Vec(this.x / v.x, this.y / v.y);
	}

	// scalar arithmetic
	adds(n) {
		return new Vec(this.x + n, this.y + n);
	}
	subs(n) {
		return new Vec(this.x - n, this.y - n);
	}
	mlts(n) {
		return new Vec(this.x * n, this.y * n);
	}
	divs(n) {
		return new Vec(this.x / n, this.y / n);
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	static clone(v) {
		return new Vec(v.x, v.y);
	}

	get abs() {
		return new Vec(Math.abs(this.x), Math.abs(this.y));
	}
	get mag() {
		return Math.hypot(this.x, this.y);
	}
	get magNoSqrt() {
		return this.dot(this);
	}
	get unit() {
		let mag = this.mag;
		return this.div(mag, mag);
	}
}

class Rect {
	constructor(pos, size) {
		this.pos = pos;
		this.tmp = pos;
		this.sze = size;
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

	static clone(rect) {
		return new Rect(rect.pos, rect.sze);
	}

	draw(buf) {
		buf.fillStyle = "red";
		buf.fillRect(this.tmp.x, this.tmp.y, this.sze.x, this.sze.y);
	}

	pointOverlap(p) {
		return p.x < this.right && p.x > this.left && p.y < this.bottom && p.y > this.top;
	}

	rectOverlap(r) {
		return r.left < this.right && r.right > this.left && r.bottom > this.top && r.top < this.bottom;
	}
}

class Collider {
	strokeLine(s, e) {
		buf.beginPath();
		buf.moveTo(s.x, s.y);
		buf.lineTo(e.x, e.y);
		buf.stroke();
	}

	drawVertLines(vert, r) {
		buf.beginPath();
		buf.moveTo(vert.x, vert.y);

		if (vert.x <= r.left) buf.lineTo(0, vert.y);
		else buf.lineTo(1280, vert.y);
		buf.stroke();

		buf.beginPath();
		buf.moveTo(vert.x, vert.y);

		if (vert.y <= r.top) buf.lineTo(vert.x, 0);
		else buf.lineTo(vert.x, 720);
		buf.stroke();
	}

	lineRect(s, e, rect) {
		let out = {
			collision: false,
			normal: undefined,
			nearPoint: undefined,
			nearTime: undefined,
		};

		let tl = Vec.clone(rect.pos);
		let br = rect.pos.add(rect.sze);

		let l = e.sub(s);

		let near = tl.sub(s).div(l);
		let far = br.sub(s).div(l);

		if (isNaN(near.x) || isNaN(near.y) || isNaN(far.x) || isNaN(far.y)) return out;

		if (near.x > far.x) {
			let t = near.x;
			near.x = far.x;
			far.x = t;
		}

		if (near.y > far.y) {
			let t = near.y;
			near.y = far.y;
			far.y = t;
		}

		let near_f = Math.max(near.x, near.y);
		let far_f = Math.min(far.x, far.y);

		if (near.x > far.y || near.y > far.x || far_f < 0 || near_f > 1 || near_f < 0) return out;

		let nearEnd = s.add(l.mlts(near_f));
		let farEnd = s.add(l.mlts(far_f));

		let normal = new Vec(0, 0);

		if (near.y > near.x) normal.y = l.y < 0 ? 1 : -1;
		else normal.x = l.x < 0 ? 1 : -1;

		out.collision = true;
		out.nearTime = near_f;
		out.nearPoint = nearEnd;
		out.normal = normal;

		if (world.debug) {
			buf.save();
			buf.lineWidth = 5;

			// draw line to second intersection
			buf.strokeStyle = "#0000FF";
			this.strokeLine(nearEnd, farEnd);

			// draw line to first intersection
			buf.strokeStyle = "#00FFFF";
			this.strokeLine(s, nearEnd);

			buf.restore();
		}

		return out;
	}

	collide(entity, rects) {
		if (entity.vel.x != 0 || entity.vel.y != 0) {
			for (let i in rects) {
				let r = Rect.clone(rects[i]);

				if (world.debug) {
					buf.strokeStyle = "#000000";
					buf.strokeWidth = 2;
					buf.setLineDash([3, 5]);

					this.drawVertLines(r.pos, r);
					this.drawVertLines(r.pos.add(new Vec(r.sze.x, 0)), r);
					this.drawVertLines(r.pos.add(new Vec(0, r.sze.y)), r);
					this.drawVertLines(r.pos.add(r.sze), r);

					buf.setLineDash([]);
				}

				r.pos = r.pos.sub(entity.sze);
				r.sze = r.sze.add(entity.sze);

				let nextPos = entity.pos.add(entity.vel);

				let res = this.lineRect(entity.pre, nextPos, r);

				if (res.collision) {
					let newVel = entity.vel.abs.mlts(1 - res.nearTime).mlt(res.normal);

					entity.vel.x += newVel.x;
					entity.vel.y += newVel.y;

					if (entity.type == "char" && res.normal.y == -1) entity.resetJumps();
				}
			}
		}
	}
}
