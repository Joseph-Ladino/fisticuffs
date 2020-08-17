class Tileset {
	constructor(path, onload) {
		this.images = [];
		this.tilesize = 0;
		this.onload = onload;

        this.types = [];

        this.loadFromFile(path);
	}

	async loadFromFile(path) {
		const json = await (await fetch(path)).json();
		this.types = json.types;
		this.tilesize = json.tilesize;
		this.images = [];

        let images = json.images;
        let total = images.length;
        let count = 0;
		for (let i in images) {
            this.images.push(new Image());
            
			this.images[i].onload = (_) => {
                if(++count == total) this.onload();
            };
            
			this.images[i].src = images[i];
		}
	}
}

class Level {
	constructor(path, onload) {
        this.tileset = undefined;
        this.onload = onload;
		this.width = 0;
		this.height = 0;
		this.data = [];
		this.ctx = document.createElement("canvas").getContext("2d");

		this.loadFromFile(path);
	}

	drawTilesToCanvas() {
		let ts = this.tilesize;

		this.ctx.canvas.width = ts * this.width;
		this.ctx.canvas.height = ts * this.height;

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				let d = this.data[y * this.width + x];

				// explicitely draw only ts^2 pixels per image, just incase i forget to scale one down or something
				if (d > -1) this.ctx.drawImage(this.tileset.images[d], 0, 0, ts, ts, ts * x, ts * y, ts, ts);
			}
		}
	}

	get tilesize() {
		return this.tileset.tilesize;
	}

	get image() {
		return this.ctx.canvas;
	}

	async loadFromFile(path) {
		const json = await (await fetch(path)).json();
		this.width = json.width;
		this.height = json.height;
        this.data = json.data.map((v) => v - 1);
        this.tsname = json.tileset;

		this.onload();
	}
}

class Display {
	constructor(ctx, buf) {
		this.ctx = ctx;
		this.buf = buf;

		this.resize();
	}

	clear() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.buf.clearRect(0, 0, this.buf.canvas.width, this.buf.canvas.height);
	}

	drawBackground(image) {
		this.buf.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.buf.canvas.width, this.buf.canvas.height);
	}

	render() {
		this.ctx.drawImage(this.buf.canvas, 0, 0, this.buf.canvas.width, this.buf.canvas.height, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	}

	resize() {
		let ar = this.buf.canvas.width / this.buf.canvas.height;

		if (window.innerWidth / window.innerHeight > ar) {
			this.ctx.canvas.width = window.innerHeight * ar;
			this.ctx.canvas.height = window.innerHeight;
		} else {
			this.ctx.canvas.width = window.innerWidth;
			this.ctx.canvas.height = window.innerWidth / ar;
		}

		// doesn't work in constructor, moved here
		this.buf.imageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;
	}
}
