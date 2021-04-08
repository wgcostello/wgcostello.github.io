var canvas = $("#wrapper-canvas").get(0);

var dimensions = {
  width: $(window).width(),
  height: $(window).height() };

var minDimension = Math.min(dimensions.width, dimensions.height);

var lineW = 1 / 180 * minDimension;

Matter.use('matter-attractors');
Matter.use('matter-wrap');

let colours = [
[
'#CBE1EC',
'#96F9CA',
'#85C1FF',
'#C0CBDF',
'#C2F3FA',
'#A5C3CD',
'#94F6D0',
'#CAABD4'],

[
'#DFF5E9',
'#BFBEFA',
'#B0AFFF',
'#B4DEAC',
'#89D9F4',
'#A3FDB5',
'#DBC3FF',
'#D4ACFF'],

[
'#F7A4FF',
'#D8AEFF',
'#BDECFC',
'#DBBBFC',
'#88EDF9',
'#C9B1FD',
'#EC9EC6',
'#B2F4F3'],

[
'#9CF5F9',
'#ABD7FE',
'#ABF9FB',
'#95D8B5',
'#C2F7ED',
'#D3FCEE',
'#CFADAC',
'#83D4FF'],

[
'#AEC4FF',
'#A0F4FE',
'#B1E8EB',
'#A5B3FF',
'#9BB9F5',
'#B1AFEE',
'#ABE1FB',
'#B6C7FB'],

[
'#92FECA',
'#BFE5E8',
'#A2DBF8',
'#B0BFC6',
'#BEBCFD',
'#B5E7FF',
'#B8F8FA',
'#C7CCEC'],

[
'#BBFFAC',
'#95BEC0',
'#B2A4F3',
'#C1FCE6',
'#D9E3E5',
'#88B0F8',
'#D5C8FE',
'#CAFAE0'],

[
'#B0B0FF',
'#BEB8E8',
'#80F5FC',
'#CBE9AD',
'#8CD0FF',
'#CEC1EC',
'#D7FAF6',
'#A6E3E8'],

[
'#CAB8F6',
'#9DB0CE',
'#D6F4FF',
'#C7ACFD',
'#99FFFD',
'#DCACA8',
'#8CBDFF',
'#A5ABFF'],

[
'#B5FFF8',
'#CAF0E3',
'#B6FFCF',
'#ADF4F0',
'#8EFBFE',
'#C8FBAE',
'#BEF1FF',
'#F7A3BA']];

function runMatter() {
  // module aliases
  var Engine = Matter.Engine,
  Events = Matter.Events,
  Runner = Matter.Runner,
  Render = Matter.Render,
  World = Matter.World,
  Body = Matter.Body,
  Mouse = Matter.Mouse,
  Bodies = Matter.Bodies;

  // create an engine
  var engine = Engine.create();

  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;
  engine.world.gravity.scale = 0.1;

  // create a renderer
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: dimensions.width,
      height: dimensions.height,
      wireframes: false,
      background: 'transparent' } });

  // create runner
  var runner = Runner.create();

  // create scene
  var world = engine.world;
  world.gravity.scale = 0;

  // create a body with an attractor
  var attractiveBody = Bodies.circle(
  render.options.width / 2,
  render.options.height / 2,
  0.001,
  {
    render: {
      visible: false
    },
    plugin: {
      attractors: [
      function (bodyA, bodyB) {
        return {
          x: (bodyA.position.x - bodyB.position.x) * 1e-8,
          y: (bodyA.position.y - bodyB.position.y) * 1e-8 };

      }],
      wrap: {
        min: {
          x: 0,
          y: 0 },
        max: {
          x: dimensions.width,
          y: dimensions.height } } } });

  // add the attractive body to the world
  World.add(world, attractiveBody);

  // create a body to disrupt the hexagon pattern
  var disruptor = Bodies.circle(
  0,
  0,
  0.2 * window.innerHeight,
  {
    density: 0.5,
    render: {
      visible: false,
      fillStyle: '#383838',
      strokeStyle: '#383838',
      lineWidth: 0 }
  });

  // add the disruptor to the world
  World.add(world, disruptor);

  // set variables for hexagons
  const radius = 71 / 1800 * dimensions.height;
  const hexWidth = radius * Math.sqrt(3);

  const startingX = dimensions.width / 2 - 3.25 * hexWidth;
  const startingY = dimensions.height / 2 - 6.75 * radius;

  // create hexagons
  var hexagons = [];

  for (i = 0; i < 10; i++) {
    for (j = 0; j < 8; j++) {
      var fill = colours[i][j];

      if (i % 2 == 0) {
        hexagons.push(newHexagon(Bodies, startingX + hexWidth * j, startingY + radius * 1.5 * i, radius, fill, lineW));
      } else {
        hexagons.push(newHexagon(Bodies, startingX - hexWidth / 2 + hexWidth * j, startingY + radius * 1.5 * i, radius, fill, lineW));
      }
    }
  };

  // add all of the hexagons to the world
  World.add(world, hexagons);

  // add mouse control
  var mouse = Mouse.create(render.canvas);

  Events.on(engine, 'afterUpdate', function () {
    if (!mouse.position.x) return;
    // smoothly move the attractor body towards the mouse
    Body.applyForce(disruptor, {
      // x: (mouse.position.x - disruptor.position.x) * 0.12,
      // y: (mouse.position.y - disruptor.position.y) * 0.12
      x: disruptor.position.x - mouse.position.x,
      y: disruptor.position.y - mouse.position.y },
    {
      x: mouse.position.x - disruptor.position.x,
      y: mouse.position.y - disruptor.position.y });

  });

  // return a context for MatterDemo to control
  let data = {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
    play: function () {
      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);
    } };

  Matter.Runner.run(runner, engine);
  Matter.Render.run(render);
  return data;
};

function newHexagon(Bodies, x, y, radius, fill, lineW) {
  var hexagon = Bodies.polygon(x, y, 6, radius, {
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      density: 0.5,
      render: {
        fillStyle: fill,
        strokeStyle: '#A5B3B3',
        lineWidth: lineW },
      restitution: 0,
      plugin: {
        wrap: {
          min: {
            x: 0,
            y: 0 },
          max: {
            x: dimensions.width,
            y: dimensions.height } } } });
  return hexagon;
};

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

function setWindowSize() {
  let dimensions = {};
  dimensions.width = $(window).width();
  dimensions.height = $(window).height();

  m.render.canvas.width = $(window).width();
  m.render.canvas.height = $(window).height();
  return dimensions;
};

function vhToPixels(vh) {
  return Math.round(window.innerHeight / (100 / vh));
};

let m = runMatter();
setWindowSize();
$(window).resize(debounce(setWindowSize, 250));