
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
var animFlag = true;
var controller;

// toggle view angle with button
var viewIndex = 0;
var viewCount = 4;

// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time.

// Object states
var zeroVector = [0, 0, 0];
var origin = zeroVector;
var noRotation = zeroVector;
var noScale = [1, 1, 1];
var xAxis = [1, 0, 0];
var yAxis = [0, 1, 0];
var zAxis = [0, 0, 1];

// Ground
var groundPosition = [0,-5,0];
var groundRotation = [0,0,0];
var groundScale = [6,1,6];

// rocks
var rock1Position = [0,1.5,0];
var rock1Rotation = [0,0,0];
var rock1ScaleValue = 0.5
var rock1Scale = [rock1ScaleValue, rock1ScaleValue, rock1ScaleValue];
var rock2ScaleValue = 0.3;
var rock2Position = [1,1.3,0.5];
var rock2Rotation = [0,0,0];
var rock2Scale = [rock2ScaleValue, rock2ScaleValue, rock2ScaleValue];

// Fish
var fishOrigin = [0, -3, 0];
var fishPosition = [-3, 0.5, 0];
var fishBodyPosition = [0, 0, -1.25];
var fishBodyScale = [fishXScale, fishYScale, 2];
var fishRotation = [0, 0, 0];
var fishXScale = 0.3;
var fishYScale = 0.8;

// Fish head
var fishHeadPosition = [0,0,-1.5];
var fishHeadScale = [fishXScale, 0.5, -1];
var fishHeadScale = [fishXScale, fishYScale, 0.5];

// Fish tail
var tailRotation = [0, 0, 0];
var finScale = [0.1, 0.1, 1];
var topFinPosition = [0, 0.25, 1.2];
var bottomFinPosition = [0, -0.25, 1.2];

// Fish eyes
var leftEyePosition = [0.3, 0.3, 0];
var rightEyePosition = [-0.3, 0.3, 0];
var eyeScale = [0.2, 0.2, 0.2];
var pupilPosition = [0, 0, 0.8];
var pupilScale = [0.5, 0.5, 0.5];

// Diver and diver body
var diverPosition = [-2.5, 3.5, -1];
var diverDrift = [0, 0, 0];
var diverZScale = 0.2
var diverBodyPosition = [0,-1.4,0];
var diverBodyScale = [0.6,1,0.4];

// Diver head
var diverHeadScaleValue = 0.4
var diverHeadScale = [diverHeadScaleValue, diverHeadScaleValue, diverHeadScaleValue];

// Diver legs
var diverLegScale = [0.2, 0.5, diverZScale];
var diverLeftLegPosition = [-0.4, -1, 0];
var diverLeftLegRotation = [0,0,20];
var diverRightLegPosition = [0.8, 0, 0];
var diverRightLegRotation = [0,0,0];

// Diver shins
var diverLeftShinRotation = [0,0,0];
var diverRightShinRotation = [0,0,0];

// Diver foot
var footPosition = [-0.1, -1, 0.5];
var footScale = [1.2, 0.3, 1.7];

// seaweed
var seaweedSize = 0.15;
var seaweedOffset = 0.6;
var seaweedPosition = [1,2,0];
var seaweedRotation = [0,0,0]; 
var seaweedScale = [1*seaweedSize, 2*seaweedSize, 1*seaweedSize];
var seaweedSegmentCount = 10;
var seaweedPositionSet = [[-2, 0.7, 1], [0, 0, 0], [0, 0, 0]];
 
// colors
var colorWhite = vec4(1.0, 1.0, 1.0, 1.0);
var colorBlack = vec4(0.0, 0.0, 0.0, 1.0);
var colorPastelPink = vec4(1.0, 0.8, 0.84, 1.0);
var colorSand = vec4(1.0, 0.9, 0.4, 1.0);
var colorStone = vec4(0.5, 0.54, 0.53, 1.0);
var colorSeaweed = vec4(0.18, 0.55, 0.34, 1.0);
var colorDiver = vec4(0.5, 0.0, 1.0, 1.0);
var colorFish = vec4(1.0, 0.2, 0.33);

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

    document.getElementById("viewToggleButton").onclick = function () {
        viewIndex++;
        viewIndex = viewIndex % viewCount;
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

function createGround(translate, scale, color) {

    gTranslate(translate[0], translate[1], translate[2]);
    gPush();
    {
        setColor(color);
        gScale(scale[0], scale[1], scale[2]);
        drawCube();
    }
    gPop();
}

// Create and draw rock
function createRock(translate, scale, color) {
    
    gTranslate(translate[0], translate[1], translate[2]);
    gPush();
    {
        setColor(color);
        gScale(scale);
        drawSphere();
    }
    gPop();
}

function createSeaweedStrand(ts, count, position, rotate, scale, offset, color)
{
    // base case
    if(count == 0)
    {
        return;
    }

    gTranslate(position[0], position[1], position[2]);
    gPush();
    
        let phase = count*100;
        rotate[2] = 5*Math.cos( radians(ts) /30.0 + phase );
        gRotate(rotate[2], 0, 0, 1);

        // body
        gPush();
        {
            setColor(color);
            gScale(scale[0], scale[1], scale[2]);
            drawSphere();
        }
        gPop();

        // do recursion
        createSeaweedStrand(ts, count-1, position, rotate, scale, offset, color);
    gPop();
}

function staticDraw(shape, translate, rotate, rotateAxis, scale, color)
{
        gTranslate(translate[0], translate[1], translate[2]);
        gRotate(rotate, rotateAxis[0], rotateAxis[1], rotateAxis[2]);
        {
            setColor(color);
            gScale(scale[0], scale[1], scale[2]);
            if(shape=="cone")
            {
                drawCone();
            }
            else if(shape=="sphere")
            {
                drawSphere();
            }
            else
            {
                drawCube();
            }
        }
}

function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    front = vec3(0,0,10);
    side = vec3(10, 0, 0);
    obliqueRight = vec3(5, 5, 10);
    obliqueLeft = vec3(-5, 5, 10);
    eyeList = [front ,obliqueRight, side, obliqueLeft];
    eye = eyeList[viewIndex];

    MS = []; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // conditional render
    diver = true;
    ground = true;
    decor = true;
    fish = true;
    
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
    if(ground)
    {
        gPush();
            createGround(groundPosition, groundScale, colorSand);

            // seaweed
            gPush();
                gTranslate(seaweedPositionSet[0][0], seaweedPositionSet[0][1], seaweedPositionSet[0][2]);
                createSeaweedStrand(timestamp, seaweedSegmentCount, [0, 0.6, 0], seaweedRotation, seaweedScale, 0.6, colorSeaweed); 
            gPop(); // end seaweed

            if(decor)
            {
                gPush(); // rock
                    createRock(rock1Position, rock1Scale, colorStone);

                    // seaweed
                    gPush();
                        gTranslate(seaweedPositionSet[1][0], seaweedPositionSet[1][1], seaweedPositionSet[1][2]);
                        createSeaweedStrand(timestamp, seaweedSegmentCount, [0, 0.6, 0], seaweedRotation, seaweedScale, 0.6, colorSeaweed); 
                    gPop(); // end seaweed

                gPop(); // end rock
                
                gPush(); // rock
                    createRock(rock2Position, rock2Scale, colorStone);

                    // seaweed
                    gPush();
                        gTranslate(seaweedPositionSet[2][0], seaweedPositionSet[2][1], seaweedPositionSet[2][2]);
                        createSeaweedStrand(timestamp, seaweedSegmentCount, [0, 0.6, 0], seaweedRotation, seaweedScale, 0.6, colorSeaweed); 
                    gPop(); // end seaweed

                gPop(); // end rock
            }

        // End ground
        gPop();
    }
    
    if(fish)
    {
        // Fish
        gPush();

            // Rotate around the origin
            gTranslate(fishOrigin[0], fishOrigin[1], fishOrigin[2]); // origin
            fishRotation[1] = 0.05 * timestamp;
            gRotate(fishRotation[1], 0, 1, 0);
            gTranslate(fishPosition[0], fishPosition[1], fishPosition[2]); // position

            // fish moves up and down
            fishHeadPosition[1] = 0.3*Math.cos( radians(timestamp) / 10.0);
            
            gPush(); // head
                gTranslate(0, fishHeadPosition[1], 0);
                gPush();
                {
                    setColor(colorFish);
                    gScale(fishHeadScale[0], fishHeadScale[1], fishHeadScale[2]);
                    drawCone();
                }
                gPop();

                gPush(); // left eye

                    staticDraw("sphere", leftEyePosition, 0, xAxis, eyeScale, colorWhite);
                    
                    gPush();
                        staticDraw("sphere", pupilPosition, 0, xAxis, pupilScale, colorBlack);
                    gPop();

                gPop(); // end left eye

                gPush(); // right eye

                    staticDraw("sphere", rightEyePosition, 0, xAxis, eyeScale, colorWhite);
                    
                    gPush();
                        staticDraw("sphere", pupilPosition, 0, xAxis, pupilScale, colorBlack);
                    gPop();

                gPop(); // end right eye

                gPush(); //body
                    gTranslate(fishBodyPosition[0], fishBodyPosition[1], fishBodyPosition[2]);
                    gRotate(180, 0, 1, 0);

                    gPush();
                        staticDraw("cone", zeroVector, 0, yAxis, fishBodyScale, colorFish);
                    gPop();

                    gPush(); // tail rotation
                        tailRotation[1] = tailRotation[1] + 1.0*Math.cos( radians(timestamp) /3.0 );
                        gRotate(tailRotation[1], 0, 1, 0);

                        gPush();
                            staticDraw("cone", topFinPosition, -30, xAxis, finScale, colorFish);
                        gPop();
                        
                        gPush();
                            staticDraw("cone", bottomFinPosition, 30, xAxis, finScale, colorFish);
                        gPop();

                    gPop(); // end tail rotation

                gPop(); // end body

            gPop(); // end head

        gPop();
        // end fish
    }

    if(diver)
    {
    
    // Diver
    gPush();
        // calculate drift from timestamp
        drift = 0.6 * Math.cos( radians(timestamp) /25.0 );
        diverDrift[0] = drift;
        diverDrift[1] = drift;
        gTranslate(diverPosition[0] + diverDrift[0], diverPosition[1] + diverDrift[1], diverPosition[2]); // diver frame position

        // static rotation
        gRotate(20, 0, 1, 0);
        
        gPush(); // Head
            gPush();
                staticDraw("sphere", zeroVector, 0, xAxis, diverHeadScale, colorDiver);
            gPop();
            
            gPush(); // Body

                gTranslate(diverBodyPosition[0], diverBodyPosition[1], diverBodyPosition[2]);
                gPush(); // body scale
                    {
                        setColor(colorDiver);
                        gScale(diverBodyScale[0], diverBodyScale[1], diverBodyScale[2]);
                        drawCube();
                    }
                gPop(); // end body scale
                
                // translate to where center of leg is at rotation point
                gTranslate(diverLeftLegPosition[0], diverLeftLegPosition[1], diverLeftLegPosition[2]);

                gPush(); // left leg
                                      
                    // rotate
                    diverLeftLegRotation[0] = 10*Math.cos( radians(timestamp) /10.0);
                    gRotate(diverLeftLegRotation[0], 1, 0, 0);
                    gRotate(20, 1, 0, 0);

                    // translate so joint was where center had been rotating
                    gTranslate(0, -0.5, 0);
                    gPush();
                    {
                        setColor(colorDiver);
                        gScale(diverLegScale[0], diverLegScale[1], diverLegScale[2]);
                        drawCube();
                    }
                    gPop();

                    gTranslate(0, -0.5, 0);
                    gPush(); // lower leg

                        // rotate
                        diverLeftShinRotation[0] = 10*Math.cos( radians(timestamp) /10.0);
                        gRotate(diverLeftShinRotation[0], 1, 0, 0);
                        gRotate(45, 1, 0, 0);

                        // translate so joint was where center had been rotating
                        gTranslate(0, -0.5, 0);
                        {
                            setColor(colorDiver);
                            gScale(diverLegScale[0], diverLegScale[1], diverLegScale[2]);
                            drawCube();
                        }

                        gPush(); // foot
                            staticDraw("cube", footPosition, 0, xAxis, footScale, colorDiver);
                        gPop(); // end foot

                    gPop(); // end lower leg

                gPop(); // end left leg


                // move over to where right leg will be
                gTranslate(diverRightLegPosition[0], diverRightLegPosition[1], diverRightLegPosition[2]);
                gPush(); // right leg
                                      
                    // rotate
                    diverRightLegRotation[0] = 5*Math.sin( radians(timestamp) /10.0);
                    gRotate(diverRightLegRotation[0], 1, 0, 0);
                    gRotate(20, 1, 0, 0);

                    // translate so joint was where center had been rotating
                    gTranslate(0, -0.5, 0);
                    gPush();
                    {
                        setColor(colorDiver);
                        gScale(diverLegScale[0], diverLegScale[1], diverLegScale[2]);
                        drawCube();
                    }
                    gPop();

                    gTranslate(0, -0.5, 0);
                    gPush(); // lower leg

                        // rotate
                        diverRightShinRotation[0] = 5*Math.sin( radians(timestamp) /10.0);
                        gRotate(diverRightShinRotation[0], 1, 0, 0);
                        gRotate(45, 1, 0, 0);

                        // translate so joint was where center had been rotating
                       
                        staticDraw("cube", [0, -0.5, 0], 0, xAxis, diverLegScale, colorDiver);

                        gPush(); // foot
                            staticDraw("cube", footPosition, 0, xAxis, footScale, colorDiver);
                        gPop(); // end foot

                    gPop(); // end lower leg

                gPop(); // end right leg
            
            gPop(); // End Body
        
        gPop(); // End head

    gPop();// End diver
    }
    

    
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
