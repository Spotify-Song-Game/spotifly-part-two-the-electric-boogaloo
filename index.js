const WINDOW_WIDTH = innerWidth;
const WINDOW_HEIGHT = innerHeight;
const PLAYER_SIZE = 10;
const NUM_BARS = 100;
const BASE_BAR_HEIGHT = 200;

// Create an engine which contains all the methods for creating and manipulating physics bodies
var my_engine = Matter.Engine.create();
my_engine.gravity = {x: 0, y: 1, scale: 0.001};

// Create the renderer, which creates its own canvas in which the engine object is visualized
var my_renderer = Matter.Render.create({
    element: document.body, //sets the element attribute to render within the document body
    engine: my_engine, // assign this renderer to render my_engine
    options: {
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        wireframes: false,
        background: "red"
    }
});

// Add player body
var playerBox = Matter.Bodies.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, PLAYER_SIZE, PLAYER_SIZE, {
    mass: 10,
    inertia: Infinity,
    restitution: 0,
    render: {
        fillStyle: "cyan",
    }
});
Matter.Composite.add(my_engine.world, playerBox);

// TODO: Add enemy boxes

// Function which prepares the inputted audio object, and prepares the browser
function initializeAudio(audio){
    audio.id = "audio_player";
    audio.src = "mp3/beautiful.mp3";
    audio.controls = false; // hides the audio player controls
    audio.loop = false; // loop or don't loop
    document.getElementById("audio").appendChild(audio);
    document.getElementById("audio_player").onplay = function() {
        if (typeof(context) === "undefined") {
            context = new AudioContext(); // Make an audio context, basically a graph with nodes, used in analysis
            analyser = context.createAnalyser(); // Actually make the analyser which will then give us frequencyBinCount - used for moving bars
            source = context.createMediaElementSource(audio); // Necessary js bs, source for media, used to connect audio - analyser
            source.connect(analyser); // Connect the audio to the analyser
            analyser.connect(context.destination); // connect the analyser
        }
    };
}

// Create the music bars
var bars = [];
var barHeights = Array(NUM_BARS).fill(BASE_BAR_HEIGHT);
for (let i = 0; i < NUM_BARS; i++) {
    bars.push(Matter.Bodies.rectangle(Math.ceil(WINDOW_WIDTH / NUM_BARS) * i,
                               WINDOW_HEIGHT,
                               Math.ceil(WINDOW_WIDTH / NUM_BARS),
                               barHeights[i],
              { 
                isStatic: true,
                render: {
                    fillStyle: "black"
                }
              }));
}
Matter.Composite.add(my_engine.world, bars);

// Define how the frame should update
function frameUpdate(){

    // Does something with defining the frame-rate on various browsers... I don't actually completely understand it
    window.RequestAnimationFrame =
        window.requestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function(callback) { setTimeout(callback, 1000 / 60); };

    // make the bars update every frame
    setBarsToMusic();
}

// Create the runner which actually starts the physics engine
var my_runner = Matter.Runner.create();

// Start everything here, when a key is pressed
window.addEventListener("keydown", function(event) {
    console.log("The game begins...");

    // Run the renderer, which visualizes my_engine
    Matter.Render.run(my_renderer);

    // Run the runner to start
    Matter.Runner.run(my_runner, my_engine);
    
    // Start audio
    var my_audio = new Audio();
    initializeAudio(my_audio);
    my_audio.play();
    
}, { once: true });

// function which sets the bars to the music
function setBarsToMusic(){
    fbc_array = new Uint8Array(analyser.frequencyBinCount); // Read about it yourself https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/frequencyBinCount
    analyser.getByteFrequencyData(fbc_array); // This is the only thing I don't yet understand, but it's the most important part
    //https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData

    //Composite.remove(engine.world, bars); //removes old bars

    // modify each bar
    for (let i = 0; i < NUM_BARS; i++) {
        var height = BASE_BAR_HEIGHT * (0.5 + ((fbc_array[i] - Math.min(fbc_array)) / Math.max(fbc_array)));
        Matter.Body.set(bars[i], x, math.max(height));
    }

    //Composite.add(engine.world, bars);
}
