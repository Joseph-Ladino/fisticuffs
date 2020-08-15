/* globals Config Display World Engine */

var ctx = document.getElementById("display").getContext("2d");
var buf = document.createElement("canvas").getContext("2d");

var display = new Display(ctx, buf);
var world = new World(this.buf, 1280, 720);
var engine = new Engine(world, display);

function gameLoop() {

}

engine.start();

window.addEventListener("resize", display.resize)