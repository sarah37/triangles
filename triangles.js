// options button hübscher
// space zwischen colour und buttons

////// OPTIONS ////////
var triangleSize = 150;
var colourScheme = 1; // 0=grey, 1=rainbow
var rainbowSpeed = 3;
var duration = 3000;
var randomness = 0.8;
///////////////////////

///// READ OPTIONS BOX

d3.select("#optionsButton").on("click", function () {
	if (d3.select("#options").classed("hidden")) {
		d3.select("#options").classed("hidden", false);
		d3.select("#optionsButton").attr("value", "hide options");
	}
	else {
		d3.select("#options").classed("hidden", true);
		d3.select("#optionsButton").attr("value", "show options");
	}
})

d3.selectAll(".colourScheme").on("change", function () {
	colourScheme = parseInt(this.value);
})

d3.select("#triangleSize").on("change", function () {
  triangleSize = this.value;
	newTPoints();
	xScale = d3.scaleLinear().domain([0, cols]).range([0, w]);
	yScale = d3.scaleLinear().domain([0, rows]).range([0, h]);
})

d3.select("#transitionsPerMin").on("change", function () {
	duration = 60000/this.value;
})

d3.select("#randomness").on("change", function () {
	randomness = this.value;
})

///////////////////////

var q = 0; // iterator for rainbow colour scheme

var w = window.innerWidth-40;
var h = window.innerHeight-40;
var min = Math.min(w,h);

var rows = Math.floor(h/triangleSize);
var cols = 2*Math.floor(0.86*w/triangleSize);

if (rows<1) {rows=1};
if (cols<1) {cols=1};

var xScale = d3.scaleLinear()
							.domain([0, cols])
							.range([0, w]);

var yScale = d3.scaleLinear()
							.domain([0, rows])
							.range([0, h]);


var tPoints = [];
newTPoints();

//dynamically create tPoints based on screen size

// create svg
var svg = d3.select("#svgDiv")
.append("svg")
.attr("width", w)
.attr("height", h);

// draw straight triangles
var tPoints2 = makeTriangles(tPoints);

svg.selectAll("polyline")
.data(tPoints2)
.enter()
.append("polyline")
.attr("points", function(d) {
	return d;
})
.style("fill", function () {
	return colour(colourScheme, q);
})
.property("stroke-alignment", "inner")
.property("stroke", "5px solid white")

// straight triangles are shown, now we can start randomising them
repeatTransition();


// FUNCTION DEFINITIONS

function newTPoints () {
	tPoints = [];
	
	rows = Math.floor(h/triangleSize);
	cols = 2*Math.floor(0.86*w/triangleSize);

	if (rows<1) {rows=1};
	if (cols<1) {cols=1};

	for (r=0; r<=rows; r++) {
		if (r%2 == 0) { //even rows
			for (c=0; c<=cols; c=c+2) {
				tPoints.push([c,r])
			}
		}
		else { //uneven rows
			for (c=0; c<=cols; c++) {
				if (c==0 || c%2!=0 || c==cols) {
					tPoints.push([c,r])
				}
			}
		}
	}
}


function repeatTransition() {
	setTimeout(repeatTransition, duration);
	var tPoints2 = makeTriangles(randomisePoints(tPoints));

	var triangles = svg.selectAll("polyline").data(tPoints2);

	triangles
		.enter()
		.append("polyline")
	
	var transition = triangles
	.transition()
	.ease(d3.easeQuadInOut)
	.duration(duration)
	.attr("points", function(d) {
		return d;
	})
	.style("fill", function () {
		// random grey
		return colour(colourScheme, q);
	})
	
	q += 5; //increase q by one for rainbow
	triangles.exit().remove();

};


// randomises the points that the triangles are based on
// relies on: -
function randomisePoints (originalPoints) {
	// max +- 1 in x-direction, +-.5 in y-direction to avoid overlap
	// do not randomise zeros (borders)
	var tPointsRandom = [];
	for (i=0; i<originalPoints.length; i++) {
		if (originalPoints[i][0] == 0 || originalPoints[i][0] == cols) {
			var n1 = originalPoints[i][0];
		}
		else {
			var n1 = originalPoints[i][0] - randomness*0.86 + (Math.random()*randomness*2*0.86);
		}
		if (originalPoints[i][1] == 0 || originalPoints[i][1] == rows) {
			var n2 = originalPoints[i][1];
		}	
		else {
			var n2 = originalPoints[i][1] - (randomness/2) + (Math.random()*randomness);
		}
		tPointsRandom.push([n1,n2]);
	}
	return tPointsRandom;
};

// makes triangle point combinations out of raw points
// relies on: triPoints
function makeTriangles (rawPoints) {
	var tPoints2 = [];
	
	var [exceptDown, exceptUp] = computeExceptions();
	
	var maxIK = (cols/2) + (cols/2+1) * (rows/2-1) + (cols/2+2) * (rows/2);
	// pointing down
	for (k=0; k<maxIK; k++) {
		if (exceptDown.indexOf(k) >= 0) {}
		else {
			tPoints2.push(triPoints(rawPoints, k, k+1, k+(cols/2+2)))
		}
	}
	// pointing up
	for (i=0; i<maxIK; i++) {
		if (exceptUp.indexOf(i) >= 0) {}
		else {
			tPoints2.push(triPoints(rawPoints, i, i+(cols/2+1), i+(cols/2+2)))
		}
	}
	return tPoints2;
}

function computeExceptions () {
//	rows, cols
	var exceptDown = [cols/2];
	var exceptUp = [(cols/2)+1]
	for (i=0; i<rows/2; i++) { //fix! 5
		exceptDown.push(exceptDown[exceptDown.length-1]+(cols/2)+2)
		exceptDown.push(exceptDown[exceptDown.length-1]+(cols/2)+1)
		exceptUp.push(exceptUp[exceptUp.length-1]+(cols/2)+1)
		exceptUp.push(exceptUp[exceptUp.length-1]+(cols/2)+2)
	}
	return [exceptDown, exceptUp]
};


// creates a string out of three numbers that works as polygon coordinates for the triangle between the three points
function triPoints (array, p1, p2, p3) {
	return Math.floor(xScale(array[p1][0])) + " " + Math.floor(yScale(array[p1][1])) + ", " + Math.floor(xScale(array[p2][0])) + " " + Math.floor(yScale(array[p2][1])) + ", " + Math.floor(xScale(array[p3][0])) + " " + Math.floor(yScale(array[p3][1]))
};

function colour(scheme, q) {
	var hex = "0123456789abcdef";
	// greys
	if (scheme == 0) {
		var a = hex[Math.floor(Math.random() * 6 + 10)];
		var b = hex[Math.floor(Math.random() * 6 + 10)];
		var c = "#" + a + b + a + b + a + b;
	}
	// rainbow
	if (scheme == 1) {
		var c = d3.hsl(q, 0.5, (Math.random()*0.5+0.3))
	}
	// pastel
	if (scheme == 2) {
		var h = Math.random() * 130 + 200;
		console.log(h);
		var s = 0.2;
		var l = Math.random() * 0.2 + 0.8;
		var c = d3.hsl(h,s,l);
	}
	return c;
}