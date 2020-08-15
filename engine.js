/* globals player1 buf */

class Engine {
	constructor(world, display) {
		this.world = world;
		this.display = display;

		this.tick = 1000 / 10;
		this.prev = performance.now();
		this.delta = 0;
		this.elapsed = this.tick;
		this.afr = false;

		this.loop = (now) => {
			this.start();
			this.delta = now - this.prev;
			this.prev = now;
			this.elapsed += this.delta;

			this.display.clear();
			this.display.drawBackground();

			let count = 0;
			while (this.elapsed >= this.tick) {
				count++;
				this.elapsed -= this.tick;
				this.world.update();
			}

			let alpha = this.elapsed / this.tick;

			// console.log(count, alpha)

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
}
