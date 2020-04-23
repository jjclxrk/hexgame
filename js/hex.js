const BOARD_SIZE = 11;
const HEX_SIZE = 40;
const HEX_HEIGHT = 2 * HEX_SIZE;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const LEFT_PADDING = 75;
const TOP_PADDING = 75;
const TURN_COLORS = ['rgba(200, 0, 0, 0.75)', 'rgba(0, 0, 200, 0.75)'];

var turn = 0;
var grid = [[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
             [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
              [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
               [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                 [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                     [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
                      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]];


// draw the hex grid and add move-listener to the canvas
function initBoard() {
    var canvas = document.getElementById('board');
    canvas.addEventListener('mousedown', function(e) {
        getClick(canvas, e)
    });

    var ctx = canvas.getContext('2d');
    for (let r = 0; r < 11; r++) {
        for (let q = 0; q < 11; q++) {
            let [centre_x, centre_y] = hexToPixel(q, r);
            drawHexagon(ctx, centre_x, centre_y, HEX_SIZE, undefined);
        }
    }
}


function getClick(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left - LEFT_PADDING;
    const y = event.clientY - rect.top - TOP_PADDING;
    makeMove(x, y, canvas.getContext('2d'));
}


function makeMove(x, y, ctx) {
    let [q, r] = pixelToHex(x, y);
    // check that move is valid ( <q,r> is on the board and not already taken)
    if (0 <= q && q < BOARD_SIZE && 0 <= r && r < BOARD_SIZE && grid[r][q] < 0) {
        let [centre_x, centre_y] = hexToPixel(q, r);
        drawHexagon(ctx, centre_x, centre_y, HEX_SIZE - 5, TURN_COLORS[turn]);
        // record move and increment turn counter
        grid[r][q] = turn;
        turn ^= 1;
    }
}

function drawHexagon(ctx, centre_x, centre_y, size, fillStyle) {
    const height = 2 * size;
    const width = Math.sqrt(3) * size;

    ctx.beginPath();
    // draw from top point, clockwise
    ctx.moveTo(centre_x, centre_y - height / 2);
    ctx.lineTo(centre_x + width / 2, centre_y - height / 4);
    ctx.lineTo(centre_x + width / 2, centre_y + height / 4);
    ctx.lineTo(centre_x, centre_y + height / 2);
    ctx.lineTo(centre_x - width / 2, centre_y + height / 4);
    ctx.lineTo(centre_x - width / 2, centre_y - height / 4);
    // to fill or not to fill
    if (fillStyle == null) {
        ctx.closePath();
        ctx.stroke();
    } else {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }    
}



function hexToPixel(q, r) {
    var x = (r * 0.5) * HEX_WIDTH + q * HEX_WIDTH + LEFT_PADDING;
    var y = (r * 0.75) * HEX_HEIGHT + TOP_PADDING;
    return [x, y];
}

function pixelToHex(x, y) {
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / HEX_SIZE;
    const r = (2/3 * y) / HEX_SIZE;
    return hexRound(q, r);
}

function hexRound(q, r) {
    // get cube-based coordinates for the calculation
    const x = q;
    const z = r;
    const y = -x - z;
    // get the closest integer
    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);
    // get the differences
    const dx = Math.abs(x - rx);
    const dy = Math.abs(y - ry);
    const dz = Math.abs(z - rz);
    // minimise the max of the three differences to ensure rx + ry + rx == 0
    if (dx > dy && dx > dx) {
        rx = -ry - rz;
    } else if (dy > dz) {
        ry = -rx - rz;
    } else {
        rz = -rx - ry;
    }
    // return axial coordinates: q == x, r == z
    return [rx, rz];
}

