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

    drawBackground() {}

    render() {
        this.ctx.drawImage(this.buf.canvas, 0, 0, this.buf.canvas.width, this.buf.canvas.height, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    resize() {
        let ar = this.buf.canvas.width / this.buf.canvas.height;

        if(window.innerWidth / window.innerHeight > ar) {
            this.ctx.canvas.width = window.innerHeight * ar;
            this.ctx.canvas.height = window.innerHeight;
        } else {
            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerWidth / ar;
        }
    }
}