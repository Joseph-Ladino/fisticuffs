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

	// useful stuff
	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	perpDot(v) {
		// equivalent to this.norm.dot(v);
		return -this.y * v.x + this.x * v.y;
	}

	projOn(v) {
		return v.mlts(this.dot(v) / v.magSqr);
	}

	get abs() {
		return new Vec(Math.abs(this.x), Math.abs(this.y));
	}
	get mag() {
		return Math.hypot(this.x, this.y);
	}
	get magSqr() {
		return this.dot(this);
	}
	get unit() {
		return this.divs(this.mag);
	}
	get norm() {
		return new Vec(-this.y, this.x);
	}
	get normUnit() {
		return this.norm.divs(this.mag);
	}

	set mag(mag) {
		let t = this.unit.mlt(mag);
		this.x = t.x;
		this.y = t.y;
	}

	static clone(v) {
		return new Vec(v.x, v.y);
	}
}

let ctx = document.getElementById("display").getContext("2d");
let buf = document.createElement("canvas").getContext("2d");
buf.canvas.width = 1600;
buf.canvas.height = 900;
resize();

function clearBuf() {
	buf.clearRect(0, 0, buf.canvas.width, buf.canvas.height);
}

function clearCtx() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function line(s, e, color = "#000000", width = 5) {
	buf.save();
	buf.strokeStyle = color;
	buf.lineWidth = width;

	buf.beginPath();
	buf.moveTo(s.x, s.y);
	buf.lineTo(e.x, e.y);
	buf.stroke();

	buf.restore();
}

function point(p, color = "#000000", radius = 5) {
	buf.save();
	buf.fillStyle = color;
	buf.strokeStyle = color;

	buf.beginPath();
	buf.arc(p.x, p.y, radius, 0, 2 * Math.PI);
	buf.fill();

	buf.restore();
}

function drawVec(o, v, color = "#000000", drawNormal = true, width = 5) {
	point(v, color, width * 1.5);
	line(o, v, color, width);

	if (drawNormal) {
		// delta (actual vector from o to v)
		let d = v.sub(o);

		// halfway point
		let hw = o.add(d.mlts(0.5));

		// scaled and translated normal
		let n = d.normUnit.mlts(width * 5).add(hw);

		point(n, color, width * 0.5 * 1.5);
		line(hw, n, color, width * 0.5);
	}
}

let vOrigin = new Vec(0, 0);
let red = new Vec(1200, 0);
let blue = new Vec(800, 450);

let projectMe = blue;
let projectTo = red;

// radius for dragging
let handleRadius = 10;
let draggables = [vOrigin, red, blue];
let dragging = false;
let mousepos = new Vec(0, 0);

function draw() {
	// translate to prevent wonky things with the projection
	let trProjMe = projectMe.sub(vOrigin);
	let trProjTo = projectTo.sub(vOrigin);

	let projected = trProjMe.projOn(trProjTo).add(vOrigin);

	line(projectTo, projected, "black");
	drawVec(vOrigin, red, "red");
	drawVec(vOrigin, blue, "blue");
	// drawVec(red, blue, "green");
	drawVec(projectMe, projected, "white");

	point(vOrigin, "black", 7.5);
	point(red, "yellow");
	point(blue, "yellow");
}

function resize() {
	let ar = buf.canvas.width / buf.canvas.height;
	if (window.innerWidth / window.innerHeight > ar) {
		ctx.canvas.width = window.innerHeight * ar;
		ctx.canvas.height = window.innerHeight;
	} else {
		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerWidth / ar;
	}

	buf.imageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
}

function clientToBufCoords(x, y) {
	let t = new Vec(0, 0);
	t.x = ((x - ctx.canvas.offsetLeft) / ctx.canvas.offsetWidth) * buf.canvas.width;
	t.y = ((y - ctx.canvas.offsetTop) / ctx.canvas.offsetHeight) * buf.canvas.height;

	return t;
}

function pointInCirc(point, circleCenter, radius) {
	return circleCenter.sub(point).magSqr < radius * radius;
}

let stopRender = false;
function render() {
	clearBuf();
	clearCtx();
	draw();
	ctx.drawImage(buf.canvas, 0, 0, buf.canvas.width, buf.canvas.height, 0, 0, ctx.canvas.width, ctx.canvas.height);
	if (!stopRender) requestAnimationFrame(render);
}

window.addEventListener("resize", resize);

ctx.canvas.addEventListener("mousedown", (e) => {
	mousepos = clientToBufCoords(e.clientX, e.clientY);

	for (let i in draggables) {
		if (pointInCirc(mousepos, draggables[i], handleRadius)) {
			dragging = i;
			break;
		}
	}
});

ctx.canvas.addEventListener("mousemove", (e) => {
	mousepos = clientToBufCoords(e.clientX, e.clientY);

	if (dragging !== false) {
		draggables[dragging].x = mousepos.x;
		draggables[dragging].y = mousepos.y;
	}
});

document.addEventListener("mouseup", (e) => {
	dragging = false;
});

render();
