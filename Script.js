const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let tool = 'R';
let shapes = [];
let rb = { on: false, x1: 0, y1: 0, x2: 0, y2: 0 };
let fpts = [];

function drawShape(s) {
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (s.t === 'R') {
    ctx.strokeRect(Math.min(s.x1,s.x2), Math.min(s.y1,s.y2), Math.abs(s.x2-s.x1), Math.abs(s.y2-s.y1));
  } else if (s.t === 'E') {
    ctx.ellipse((s.x1+s.x2)/2, (s.y1+s.y2)/2, Math.abs(s.x2-s.x1)/2, Math.abs(s.y2-s.y1)/2, 0, 0, Math.PI*2);
    ctx.stroke();
  } else if (s.t === 'L') {
    ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
  } else if (s.t === 'F' && s.pts) {
    s.pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.stroke();
  }
}

function drawPreview() {
  if (!rb.on) return;
  ctx.strokeStyle = '#f90';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  if (tool === 'R' || tool === 'S') {
    ctx.strokeRect(Math.min(rb.x1,rb.x2), Math.min(rb.y1,rb.y2), Math.abs(rb.x2-rb.x1), Math.abs(rb.y2-rb.y1));
  } else if (tool === 'E') {
    ctx.ellipse((rb.x1+rb.x2)/2, (rb.y1+rb.y2)/2, Math.abs(rb.x2-rb.x1)/2||1, Math.abs(rb.y2-rb.y1)/2||1, 0, 0, Math.PI*2);
    ctx.stroke();
  } else if (tool === 'L') {
    ctx.moveTo(rb.x1, rb.y1); ctx.lineTo(rb.x2, rb.y2); ctx.stroke();
  } else if (tool === 'F') {
    fpts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(drawShape);
  drawPreview();
}

canvas.addEventListener('mousedown', e => {
  rb = { on: true, x1: e.offsetX, y1: e.offsetY, x2: e.offsetX, y2: e.offsetY };
  fpts = [{ x: e.offsetX, y: e.offsetY }];
});

canvas.addEventListener('mousemove', e => {
  if (!rb.on) return;
  rb.x2 = e.offsetX; rb.y2 = e.offsetY;
  if (tool === 'F') fpts.push({ x: e.offsetX, y: e.offsetY });
  redraw();
});

canvas.addEventListener('mouseup', e => {
  rb.x2 = e.offsetX; rb.y2 = e.offsetY; rb.on = false;
  const w = Math.abs(rb.x2-rb.x1), h = Math.abs(rb.y2-rb.y1);
  if (tool !== 'S' && (w > 3 || h > 3 || fpts.length > 4))
    shapes.push({ t: tool, x1: rb.x1, y1: rb.y1, x2: rb.x2, y2: rb.y2, pts: [...fpts] });
  fpts = [];
  redraw();
});

document.addEventListener('keydown', e => {
  const k = e.key.toUpperCase();
  if ('RELFS'.includes(k) && k.length === 1) tool = k;
  if (k === 'Z') { shapes.pop(); redraw(); }
  document.getElementById('info').textContent = `tool: ${tool}  |  shapes: ${shapes.length}  |  R: rect · E: ellipse · L: line · F: freehand · S: select · Z: undo`;
});

let off = 0;
(function loop() {
  if (rb.on) { off -= .5; ctx.lineDashOffset = off; redraw(); }
  requestAnimationFrame(loop);
})();