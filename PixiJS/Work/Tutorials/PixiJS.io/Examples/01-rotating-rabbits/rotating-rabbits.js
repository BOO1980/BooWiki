const app = new PIXI.Application({
    width: 800, 
    height: 600, 
    backgroundColor: 0x1099bb, 
    resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

//create a new texture
const bunnyTexture = PIXI.Texture.from('http://localhost:8888/Assets/Images/bunny.png')

//create a 5 x 5 grid of Bunnies
for(var i = 0; i < 25; i++){
	const bunny	= new PIXI.Sprite(bunnyTexture);
		bunny.anchor.set(0.5) //setting the anchor to 0.5 means the origin is centered horizontally
		bunny.x = (i % 5) * 40;
		console.log(bunny.x)
}



