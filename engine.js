/* globals player1 buf */

class Input {
	constructor() {
		this.down = false;
		this.up = true;
		this.pressed = false;
		this.held = false;
	}

	set(down) {
		this.down = down;
		this.pressed = down && this.up;
		this.held = down && !this.pressed;
		this.up = !down;
	}
}

class Key extends Input {
	constructor(key) {
		super();
		this.key = key;
	}
}

class GP {
	constructor() {
		this.index;
		// fill array with unique objects, .fill() just creates a whole lotta shared references
		this.buttons = Array.from({ length: 18 }, (_) => new Input());
		this.axes = new Array(4);
		this.axesMin = 0.05;
		this.conf = {
			up: 12,
			left: 14,
			down: 13,
			right: 15,
			jump: 0,
		};
	}

	setButtons(arr) {
		for (let i in arr) this.buttons[i].set(arr[i].pressed);
	}

	setAxes(arr) {
		for (let i in arr) this.axes[i] = Math.abs(arr) > this.axesMin ? arr[i] : 0;
	}

	// get leftStick() {
	// 	return this.axes.slice(0, 2);
	// }
	// get rightStick() {
	// 	return this.axes.slice(2);
	// }
	get up() {
		return this.buttons[this.conf.up];
	}
	get left() {
		return this.buttons[this.conf.left];
	}
	get down() {
		return this.buttons[this.conf.down];
	}
	get right() {
		return this.buttons[this.conf.right];
	}
	get jump() {
		return this.buttons[this.conf.jump];
	}
}

class InputController {
	constructor(world) {
		this.world = world;

		this.p0cont = false;
		this.p1cont = false;
		this.p2cont = false;
		this.p3cont = false;
		this.gpCount = 0;

		this.kb = {
			up: new Key("w"),
			left: new Key("a"),
			down: new Key("s"),
			right: new Key("d"),
			jump: new Key(" "),
		};

		this.gamepads = Array.from({ length: 4 }, (_) => new GP());

		this.keyhandler = (e) => this.keyUpDown(e);
		this.gphandler = (e) => this.gpManage(e);

		this.setListeners();
	}

	get p0() {
		return this.p0cont ? this.gamepads[0] : this.kb;
	}
	get p1() {
		return this.p1cont ? this.gamepads[0 + this.p0cont] : undefined;
	}
	get p2() {
		return this.p2cont ? this.gamepads[1 + this.p0cont] : undefined;
	}
	get p3() {
		return this.p3cont ? this.gamepads[2 + this.p0cont] : undefined;
	}

	clearPressed() {
		for (let i in this.kb) this.kb[i].pressed = false;
	}

	setListeners() {
		document.addEventListener("keydown", this.keyhandler);
		document.addEventListener("keyup", this.keyhandler);
		window.addEventListener("gamepadconnected", this.gphandler);
		window.addEventListener("gamepaddisconnected", this.gphandler);
	}

	removeListeners() {
		document.removeEventListener("keydown", this.keyhandler);
		document.removeEventListener("keyup", this.keyhandler);
		window.removeEventListener("gamepadconnected", this.gphandler);
		window.removeEventListener("gamepaddisconnected", this.gphandler);
	}

	keyUpDown(e) {
		let down = e.type == "keydown";
		switch (e.key) {
			case this.kb.up.key:
				this.kb.up.set(down);
				break;
			case this.kb.left.key:
				this.kb.left.set(down);
				break;
			case this.kb.down.key:
				this.kb.down.set(down);
				break;
			case this.kb.right.key:
				this.kb.right.set(down);
				break;
			case this.kb.jump.key:
				this.kb.jump.set(down);
				break;
		}
	}

	gpManage(e) {
		let gp = e.gamepad;
		let index = gp.index + 1 - this.p0cont;
		if (e.type == "gamepadconnected") {
			this[`p${index}cont`] = true;
			this.gpCount++;
			console.log("connected", gp.id, "to player index", index);
			this.gpQuery();
		} else {
			this[`p${index}cont`] = false;
			this.gpCount--;
			console.log("disconnected", gp.id, "from player index", index);
		}

		this.world.initInputs();
	}

	gpQuery() {
		let gamepads = navigator.getGamepads();
		for (let gp of gamepads) {
			if (gp) {
				let icgp = this.gamepads[gp.index];

				icgp.setButtons(gp.buttons);
				icgp.setAxes(gp.axes);
			}
		}
	}

	setp0gp(gamepad = false) {
		this.p0cont = gamepad;
		this[`p${this.gpCount}cont`] = !gamepad;
		this.world.initInputs();
	}
}

class Engine {
	constructor(world, display) {
		this.world = world;
		this.world.initInputs(new InputController(world));
		this.display = display;

		this.tick = 1000 / 30;
		this.prev = performance.now();
		this.delta = 0;
		this.elapsed = this.tick;
		this.afr = false;
		this.interpolate = true;

		this.loop = (now) => {
			this.start();
			this.delta = now - this.prev;
			this.prev = now;
			this.elapsed += this.delta;

			this.display.clear();
			// this.display.drawBackground(world.level.image);

			while (this.elapsed >= this.tick) {
				this.elapsed -= this.tick;

				world.inputcont.gpQuery();

				this.world.update();
				this.world.inputcont.clearPressed();
			}

			let alpha = this.interpolate ? this.elapsed / this.tick : 1;
			this.world.drawEntities(alpha);
			this.display.render();
		};
	}

	start() {
		this.afr = window.requestAnimationFrame(this.loop);
	}

	stop() {
		window.cancelAnimationFrame(this.afr);
	}

	get fps() {
		return Math.round(1000 / this.tick);
	}
	set fps(n) {
		this.tick = 1000 / n;
	}
}
