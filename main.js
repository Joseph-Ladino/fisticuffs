/* globals Tileset Level Display World Level Engine */

var ctx = document.getElementById("display").getContext("2d");
var buf = document.createElement("canvas").getContext("2d");

// var tsCount = 1, lvCount = 1;
// var tsLoaded = 0, lvLoaded = 0;

// var tilesets = { /* scifi: new Tileset("./assets/scifi/scifi.tset", onTilesetLoad), */ scifi80: new Tileset("./assets/scifi80/scifi.tset", onTilesetLoad) };
// var levels = [new Level("./assets/scifi80/test2.map", onLevelLoad)];

// function onTilesetLoad() {
//     if(++tsLoaded == tsCount) onAllLoaded();
// }

// function onLevelLoad() {
//     if(++lvLoaded == lvCount) onAllLoaded();
// }

// function onAllLoaded() {
//     if(tsLoaded == tsCount && lvLoaded == lvCount) {

//         for(let l of levels) {
//             l.tileset = tilesets[l.tsname];
//             l.drawTilesToCanvas();
//         }

//         world.level = levels[0];
//         engine.start();
//     }
// }

var display = new Display(ctx, buf);
var world = new World(this.buf, 1280, 720);
var engine = new Engine(world, display);

engine.start();

window.addEventListener("resize", display.resize)