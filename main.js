
var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = false;
var controller;

// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.

// Object states

var centerPosition = [0,0,0];
var noRotation = [0,0,0];

// Ground
var groundPosition = [0,-5,0];
var groundRotation = [0,0,0];
var groundScale = [6,1,6];

// rocks
var rock1Position = [0,1.5,0];
var rock1Rotation = [0,0,0];
var rock1Scale = [0.5, 0.5, 0.5];

var rock2Position = [1,1.3,0];
var rock2Rotation = [0,0,0];
var rock2Scale = [0.3, 0.3, 0.3];

// Fish body
var fishBodyPosition = [-2,0,0];
var fishBodyRotation = [0,90,0];
var fishBodyScale = [0.5, 0.5, 2];

// Fish head
var fishHeadPosition = [0,0,-1.5];
var fishHeadRotation = [0,0,0];
var fishHeadScale = [0.5, 0.5, -1];

// Diver
var diverZScale = 0.2
var diverBodyPosition = [0,0,0];
var diverBodyRotation = [0,0,0];
var diverBodyScale = [0.6,1,diverZScale];

// Head
var diverHeadPosition = [0,1.4,0];
var diverHeadRotation = [0,0,0];
var diverHeadScaleValue = 0.4
var diverHeadScale = [diverHeadScaleValue, diverHeadScaleValue, diverHeadScaleValue];

// Legs
var diverLegScale = [0.15, 0.5, diverZScale];
var diverLegYPos = -2.8

var diverLeftLegPosition = [-0.4,diverLegYPos,0];
var diverLeftLegRotation = [0,0,0];
var diverLeftLegScale = diverLegScale;

var diverRightLegPosition = [0.4,diverLegYPos,0];
var diverRightLegRotation = [0,0,0];
var diverRightLegScale = diverLegScale;

// Shin
var diverShinScale = [1, 1, 1];
var diverShinYPos = -2

var diverLeftShinPosition = [0,diverShinYPos,0];
var diverLeftShinRotation = [0,0,0];
var diverLeftShinScale = diverShinScale;

var diverRightShinPosition = [0,diverShinYPos,0];
var diverRightShinRotation = [0,0,0];
var diverRightShinScale = diverShinScale;

// seaweed
var seaweedSize = 0.12;
var seaweedOffsetY = 0.2;
var seaweedPosition = [0,0.2,0];
var seaweedRotation = [0,0,0]; 
var seaweedScale = [1*seaweedSize, 2*seaweedSize, 1*seaweedSize];
 
// colors
var colorWhite = vec4(1.0, 1.0, 1.0, 1.0);
var colorBlack = vec4(0.0, 0.0, 0.0, 1.0);
var colorDarkgrey = vec4(0.1, 0.1, 0.1, 1.0);
var colorLightgrey = vec4(0.5, 0.5, 0.5, 1.0);
var colorRed = vec4(1.0, 0.0, 0.0, 1.0);
var colorGreen = vec4(0.0, 1.0, 0.0, 1.0);
var colorBlue = vec4(0.0, 0.0, 1.0, 1.0);
var colorSand = vec4(1.0, 1.0, 0.0, 1.0);

// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
	// Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );


    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true;
            resetTimerFlag = true;
            window.requestAnimFrame(render);
        }
        //console.log(animFlag);

		controller = new CameraController(canvas);
		controller.onchange = function(xRot,yRot) {
			RX = xRot;
			RY = yRot;
			window.requestAnimFrame(render); };
    };

    render(0);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}


// Custom functions for assignment 

function createGround(transform, scale, color) {

    gTranslate(transform[0], transform[1], transform[2]);
    gPush();
    {
        setColor(color);
        gScale(scale[0], scale[1], scale[2]);
        drawCube();
    }
    gPop();
}

// Create and draw rock
function createRock(transform, scale, color) {
    
    gPush();
        gTranslate(transform[0], transform[1], transform[2]);
        gPush();
        {
            setColor(color);
            gScale(scale);
            drawSphere();
        }
        gPop();
    gPop();
}

function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    MS = []; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    
    // set all the matrices
    setAllMatrices();
    
	if( animFlag )
    {
		// dt is the change in time or delta time from the last frame to this one
		// in animation typically we have some property or degree of freedom we want to evolve over time
		// For example imagine x is the position of a thing.
		// To get the new position of a thing we do something called integration
		// the simpelst form of this looks like:
		// x_new = x + v*dt
		// That is the new position equals the current position + the rate of of change of that position (often a velocity or speed), times the change in time
		// We can do this with angles or positions, the whole x,y,z position or just one dimension. It is up to us!
		dt = (timestamp - prevTime) / 1000.0;
		prevTime = timestamp;
	}
	


    // Ground
    gPush();

        //createGround(groundPosition, groundScale, colorSand);

        // Rock 1
        //createRock(rock1Position, rock1Scale, colorLightgrey);
        
        // Rock 2
        //createRock(rock2Position, rock2Scale, colorLightgrey);

    gPop();
    
    // Fish body
	gPush();
		gTranslate(fishBodyPosition[0],fishBodyPosition[1],fishBodyPosition[2]);
        fishBodyRotation[1] = fishBodyRotation[1] + 90*dt;
        gRotate(fishBodyRotation[1],0,1,0);
        gPush();
		{
			setColor(colorRed);
            gScale(fishBodyScale[0], fishBodyScale[1], fishBodyScale[2]);
			//drawCone();
		}
        gPop();

            gTranslate(fishHeadPosition[0],fishHeadPosition[1],fishHeadPosition[2]);
            gPush();
            {
                setColor(colorWhite);
                gScale(fishHeadScale[0], fishHeadScale[1], fishHeadScale[2]);
                //drawCone();
            }
            gPop();
	gPop();


    /*
    // Diver body
    gPush();
        gTranslate(diverBodyPosition[0], diverBodyPosition[1], diverBodyPosition[2]);
        //diverBodyRotation[1] = 30*Math.cos(radians(timestamp)/2.0);
        gRotate(diverBodyRotation[1], 0, 1, 0);
        gPush();
        {
            setColor(colorBlue);
            gScale(diverBodyScale[0], diverBodyScale[1], diverBodyScale[2]);
            drawCube();
        }
        gPop();

            // Diver head
            gTranslate(diverHeadPosition[0], diverHeadPosition[1], diverHeadPosition[2]);
            gPush();
            {
                setColor(colorBlue);
                gScale(diverHeadScale[0], diverHeadScale[1], diverHeadScale[2]);
                drawSphere();
            }
            gPop();

            // Diver left leg
            gPush();
            gTranslate(diverLeftLegPosition[0], diverLeftLegPosition[1], diverLeftLegPosition[2]);
            {
                setColor(colorBlue);
                gScale(diverLeftLegScale[0], diverLeftLegScale[1], diverLeftLegScale[2]);
                drawCube();
            }
                // Diver left shin
                gPush();
                gTranslate(diverLeftShinPosition[0], diverLeftShinPosition[1], diverLeftShinPosition[2]);
                {
                    setColor(colorBlue);
                    gScale(diverLeftShinScale[0], diverLeftShinScale[1], diverLeftShinScale[2]);
                   drawCube();
                }
                gPop();
            gPop();

            // Diver right leg
            gPush();
            gTranslate(diverRightLegPosition[0], diverRightLegPosition[1], diverRightLegPosition[2]);
            {
                setColor(colorBlue);
                gScale(diverRightLegScale[0], diverRightLegScale[1], diverRightLegScale[2]);
                drawCube();
            }
                // Diver left shin
                gPush();
                gTranslate(diverRightShinPosition[0], diverRightShinPosition[1], diverRightShinPosition[2]);
                {
                    setColor(colorBlue);
                    gScale(diverRightShinScale[0], diverRightShinScale[1], diverRightShinScale[2]);
                    drawCube();
                }
                gPop();
            gPop();

    gPop();

    */


    
    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
	var controller = this;
	this.onchange = null;
	this.xRot = 0;
	this.yRot = 0;
	this.scaleFactor = 3.0;
	this.dragging = false;
	this.curX = 0;
	this.curY = 0;
	
	// Assign a mouse down handler to the HTML element.
	element.onmousedown = function(ev) {
		controller.dragging = true;
		controller.curX = ev.clientX;
		controller.curY = ev.clientY;
	};
	
	// Assign a mouse up handler to the HTML element.
	element.onmouseup = function(ev) {
		controller.dragging = false;
	};
	
	// Assign a mouse move handler to the HTML element.
	element.onmousemove = function(ev) {
		if (controller.dragging) {
			// Determine how far we have moved since the last mouse move
			// event.
			var curX = ev.clientX;
			var curY = ev.clientY;
			var deltaX = (controller.curX - curX) / controller.scaleFactor;
			var deltaY = (controller.curY - curY) / controller.scaleFactor;
			controller.curX = curX;
			controller.curY = curY;
			// Update the X and Y rotation angles based on the mouse motion.
			controller.yRot = (controller.yRot + deltaX) % 360;
			controller.xRot = (controller.xRot + deltaY);
			// Clamp the X rotation to prevent the camera from going upside
			// down.
			if (controller.xRot < -90) {
				controller.xRot = -90;
			} else if (controller.xRot > 90) {
				controller.xRot = 90;
			}
			// Send the onchange event to any listener.
			if (controller.onchange != null) {
				controller.onchange(controller.xRot, controller.yRot);
			}
		}
	};
}
