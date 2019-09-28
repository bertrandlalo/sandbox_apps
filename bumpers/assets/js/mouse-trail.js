let io = new IO()
// dots is an array of Dot objects,
// mouse is an object used to track the X and Y position
   // of the mouse, set with a mousemove event listener below
var self_dots = [],
    others_dots = [],
    self_mouse = {
      x: 0,
      y: 0
    },
    others_mouse = {
      x: 0,
      y: 0
    }
    ;

// The Dot object used to scaffold the dots
var Dot = function(className) {
  this.x = 0;
  this.y = 0;
  this.node = (function(){
    var n = document.createElement("div");
    n.className = className;
    document.body.appendChild(n);
    return n;
  }());
};
// The Dot.prototype.draw() method sets the position of
  // the object's <div> node
Dot.prototype.draw = function() {
  this.node.style.left = this.x + "px";
  this.node.style.top = this.y + "px";
};

// Creates the Dot objects, populates the dots array
for (var i = 0; i < 12; i++) {
  var d = new Dot('self-trail');
  self_dots.push(d);
}
for (var i = 0; i < 12; i++) {
  var d = new Dot('others-trail');
  others_dots.push(d);
}

// This is the screen redraw function
function draw() {
  // Make sure the mouse position is set everytime
    // draw() is called.
  var self_x = self_mouse.x,
      self_y = self_mouse.y,
      others_x = others_mouse.x,
      others_y = others_mouse.y
      ;

  // This loop is where all the 90s magic happens
  self_dots.forEach(function(dot, index, dots) {
    var nextDot = dots[index + 1] || dots[0];

    dot.x = self_x;
    dot.y = self_y;
    dot.draw();
    self_x += (nextDot.x - dot.x) * .6;
    self_y += (nextDot.y - dot.y) * .6;

  });
  // This loop is where all the 90s magic happens
  others_dots.forEach(function(dot, index, dots) {
    var nextDot = dots[index + 1] || dots[0];

    dot.x = self_x;
    dot.y = self_y;
    dot.draw();
        self_x += (nextDot.x - dot.x) * .6;
    self_y += (nextDot.y - dot.y) * .6;
//    others_x += (nextDot.x - dot.x) * .6;
//    others_y += (nextDot.y - dot.y) * .6;

  });

}

addEventListener("mousemove", function(event) {
  page_x = event.pageX;
  page_y = event.pageY;
  //event.preventDefault();
  self_mouse.x = page_x;
  self_mouse.y = page_y;
  console.log(event)
  io.event('bumpers_player_moves', {'uuid': io.uuid, 'position': {'page_x': page_x, 'page_y': page_y} });

});


io.on('connect', () => {
    io.subscribe('events');
    io.event('bumpers_player_connects', {'uuid': io.uuid});
});


io.on('events', (event) => {
    // Get last row of data
    let keys = Object.keys(event);
    for (let event_id in event) {
        event_label = event[event_id].label;
        event_data = JSON.parse(event[event_id].data);
        if (event_label == 'bumpers_player_moves') {
            if (event_data.uuid !== io.uuid) {
            // some other player moved
            console.log('other player position');
            console.log(event_data)
            others_mouse.x = event_data.page_x;
            others_mouse.y = event_data.page_y;
            }
        }
    }
});

// animate() calls draw() then recursively calls itself
  // everytime the screen repaints via requestAnimationFrame().
function animate() {
  draw();
  requestAnimationFrame(animate);
}

// And get it started by calling animate().
animate();
