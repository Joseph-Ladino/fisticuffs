/* globals player1 buf */

class Key {
	constructor(key) {
		this.key = key;
		this.pressed = false;
		this.down = false;
		this.up = true;
	}

	set(down, repeat) {
		this.down = down;
		this.up = !down;
		if(down) this.pressed = !repeat;
	}
}

class InputController {
	constructor() {
		this.p1cont = false;

		this.kb = {
			up: new Key("w"),
			left: new Key("a"),
			down: new Key("s"),
			right: new Key("d"),
			jump: new Key(" "),
		};

		this.gamepads = [];

		this.keyhandler = (e) => {
			let down = e.type == "keydown";
			switch (e.key) {
				case this.kb.up.key: this.kb.up.set(down, e.repeat); break;
				case this.kb.left.key: this.kb.left.set(down, e.repeat); break;
				case this.kb.down.key: this.kb.down.set(down, e.repeat); break;
				case this.kb.right.key: this.kb.right.set(down, e.repeat); break;
				case this.kb.jump.key: this.kb.jump.set(down, e.repeat); break;
			}

			// console.log(e.key, down);
		};

		this.setListners();
	}

	get p1() {
		return this.p1cont ? undefined : this.kb;
	}

	clearPressed() {
		for(let i in this.kb) {
			this.kb[i].pressed = false;
		}
	}

	setListners() {
		document.addEventListener("keydown", this.keyhandler);
		document.addEventListener("keyup", this.keyhandler);
	}

	removeListeners() {
		document.removeEventListener("keydown", this.keyhandler);
		document.removeEventListener("keyup", this.keyhandler);
	}
}

class Engine {
	constructor(world, display) {
		this.world = world;
		this.world.initInputs(new InputController());
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
			this.display.drawBackground(world.level.image);

			while (this.elapsed >= this.tick) {
				this.elapsed -= this.tick;
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

	get fps() {return Math.round(1000 / this.tick);}
	set fps(n) {this.tick = 1000 / n;}
}
