var canvas = document.getElementsByTagName('canvas')[0],
  context = canvas.getContext('2d');

function shuffle(v)
{
  // loop backwards
  for (var i = v.length - 1; i > 0; --i)
  {
    // grab random element between the first element and us
    var j = parseInt(Math.random() * (i + 1)),
      // grab our current value
      temp = v[i];
    // swap
    v[i] = v[j];
    v[j] = temp;
  }
  return v;
}

function Maze()
{
  this.w = 0;
  this.h = 0;
  this.arr = [];
}

Maze.prototype.i = function(x, y)
{
  if (typeof x !== 'number')
  {
    var obj = x;
    x = obj.x;
    y = obj.y;
  }
  return parseInt(x + y * this.w, 10);
}

Maze.prototype.generate = function(w, h)
{
  this.w = w;
  this.h = h;
  this.arr = new Array(w * h);

  var queue = [
    {
      x: 0,
      y: 0,
      px: 0,
      py: 0
    }
  ];

  while (queue.length)
  {
    var p = queue.pop(),
      idx = this.i(p.x, p.y),
      midIdx = this.i(
        (p.x + p.px) / 2,
        (p.y + p.py) / 2
      );

    if (p.x < 0 || p.x >= w ||
      p.y < 0 || p.y >= h ||
      this.arr[idx])
    {
      // either out of bounds, or is already a walkway
      continue;
    }

    // mark as walkway
    this.arr[midIdx] = this.arr[idx] = true;

    var offsets = [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -2 },
      { x: 0, y: 2 }
    ];
    shuffle(offsets);

    for (var j = 0; j < offsets.length; ++j)
    {
      var o = offsets[j];
      queue.push({
        x: p.x + o.x,
        y: p.y + o.y,
        px: p.x,
        py: p.y
      });
    }
  }
}

Maze.prototype.dijkstra = function(from, to)
{
  var open = [
    {
      p: from,
      cost: 0,
      prev: null
    }
  ];

  var closed = {};

  while (open.length)
  {
    open.sort(function(lhs, rhs) {
      return lhs.cost - rhs.cost;
    });

    var node = open.shift(),
      nodeIdx = this.i(node.p);

    if (closed[nodeIdx])
    {
      continue;
    }
    closed[nodeIdx] = true;

    if (nodeIdx == this.i(to))
    {
      var path = [];
      while (node)
      {
        path.push(node.p);
        node = node.prev;
      }
      return path.reverse();
    }

    var neighbors = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    for (var j = 0; j < neighbors.length; ++j)
    {
      var neighbor = {
        p: {
          x: node.p.x + neighbors[j].x,
          y: node.p.y + neighbors[j].y
        },
        cost: node.cost + 1,
        prev: node
      };

      var neighborIdx = this.i(neighbor.p);

      if (closed[neighborIdx] || !this.arr[neighborIdx] ||
        neighbor.p.x < 0 || neighbor.p.x >= this.w ||
        neighbor.p.y < 0 || neighbor.p.y >= this.h)
      {
        continue;
      }

      open.push(neighbor);
    }
  }

  return null;
}

Maze.prototype.draw = function()
{
  var cellW = 11,
    cellH = 11,
    cellOffsetX = Math.ceil(cellW / 2),
    cellOffsetY = Math.ceil(cellH / 2),
    canvasW = this.w * cellOffsetX + cellOffsetX - 1,
    canvasH = this.h * cellOffsetY + cellOffsetY - 1;

  canvas.width = canvasW;
  canvas.height = canvasH;

  context.fillStyle = '#000';
  context.fillRect(0, 0, canvasW, canvasH);

  for (var i = 0; i < this.arr.length; ++i)
  {
    var x = i % this.w,
      y = Math.floor(i / this.w);

    if (this.arr[i])
    {
      context.fillStyle = '#fff';
      context.fillRect(x * cellOffsetX, y * cellOffsetY, cellW, cellH);
    }
  }
}

Maze.prototype.drawSolution = function()
{
  var cellW = 11,
    cellH = 11,
    cellOffsetX = Math.ceil(cellW / 2),
    cellOffsetY = Math.ceil(cellH / 2);

  var from = {
    x: 0,
    y: 0
  };
  var to = {
    x: this.w - 1,
    y: this.h - 1
  };

  context.fillStyle = '#0f0';
  context.fillRect(0, 0, cellW, cellH);
  context.fillStyle = '#f00';
  context.fillRect(to.x * cellOffsetX, to.y * cellOffsetY, cellW, cellH);

  var path = this.dijkstra(from, to);
  if (path)
  {
    context.strokeStyle = '#f00';
    context.beginPath();
    context.moveTo(
      path[0].x * cellOffsetX + cellW * 0.5,
      path[0].y * cellOffsetY + cellH * 0.5
    );
    for (var i = 0; i < path.length; ++i)
    {
      //context.fillRect(path[i].x * cellOffsetX, path[i].y * cellOffsetY, cellW, cellH);
      context.lineTo(
        path[i].x * cellOffsetX + cellW * 0.5,
        path[i].y * cellOffsetY + cellH * 0.5
      );
    }
    context.stroke();
  }
}

var maze = new Maze();

function generateAndDrawMaze()
{
  var widthElem = document.getElementById('width'),
    heightElem = document.getElementById('height');
  maze.generate(
    parseInt(widthElem.value, 10),
    parseInt(heightElem.value, 10)
  );
  maze.draw();
}

function drawMaze()
{
  maze.draw();
}

function drawMazeSolution()
{
  maze.drawSolution();
}

generateAndDrawMaze();