class Vec {
    constructor(x, y) {
        this.x = x; this.y = y;
    }

    // vector arithmetic
    add(v) {return new Vec(this.x + v.x, this.y + v.y);}
    sub(v) {return new Vec(this.x - v.x, this.y - v.y);}
    mlt(v) {return new Vec(this.x * v.x, this.y * v.y);}
    div(v) {return new Vec(this.x / v.x, this.y / v.y);}

    // scalar arithmetic 
    adds(n) {return new Vec(this.x + n, this.y + n);}
    subs(n) {return new Vec(this.x - n, this.y - n);}
    mlts(n) {return new Vec(this.x * n, this.y * n);}
    divs(n) {return new Vec(this.x / n, this.y / n);}
    
    dot(v) {return this.x * v.x + this.y * v.y;}
    
    static clone(v) {return new Vec(v.x, v.y);}

    get mag() {return Math.hypot(this.x, this.y);}
    get magNoSqrt() {return this.dot(this);}
    get unit() {let mag = this.mag; return this.div(mag, mag);}
}

// haven't decided what algorithim to go with yet but got some basic stuff
class Collider {
    
    // point, rect pos, rect size
	pointInRect(p, r, s) {
		return p.x < r.x + s.x && p.x > r.x && p.y < r.y + s.y && p.y > r.y;
	}

    // rect1 pos, rect1 size, rect2 pos, rect2 size
	rectOverlap(r1, r1s, r2, r2s) {
		return r1.x + r1s.x > r2.x && r1.x < r2.x + r2s.x && r1.y + r1s.y > r2.y && r1.y < r2.y + r2s.y;
    }
    
}