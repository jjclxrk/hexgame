const BOARD_SIZE = 11;
const HEX_SIZE = 40;
const HEX_HEIGHT = 2 * HEX_SIZE;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const LEFT_PADDING = 75;
const TOP_PADDING = 75;
const TURN_COLORS = ['rgba(200, 0, 0, 0.75)', 'rgba(0, 0, 200, 0.75)'];
//                 up-left, up-right, right, down-right, down-left, left   
const DIRECTIONS = [[0, -1], [1, -1], [+1, 0], [0, +1], [-1, +1], [-1, 0]] 

var CANVAS;
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

// Union-Find
// TODO: make this a class of its own ?
var id = [];
var sz = [];
for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    id[i] = i;
    sz[i] = 1;
}

function find(i) {
    let root = i;
    while (root != id[root]) {
        root = id[root];
    }
    // path compression
    while (i != root) {
        let next = id[i];
        id[i] = root;
        i = next;
    }
    return root;
}

function union(i, j) {
    let rooti = find(i);
    let rootj = find(j);

    if (sz[rooti] < sz[rootj]) {
        id[rooti] = rootj;
        sz[rootj] += sz[rooti];
    } else {
        id[rootj] = rooti;
        sz[rooti] += sz[rootj];
    }
}

function connected(i, j) {
    return find(i) == find(j);
}


// draw the hex grid and add move-listener to the canvas
function initBoard() {
    CANVAS = document.getElementById('board');
    CANVAS.addEventListener('mousedown', getClick);
    var ctx = CANVAS.getContext('2d');

    /// draw "borders" / direction indicators
    // player 0 is trying to make a path from top to bottom, player 1 from left to right 
    ctx.fillStyle = TURN_COLORS[0];
    ctx.fillRect(0, 0, 1200, 10);
    ctx.fillRect(0, 740, 1200, 10);
    ctx.fillStyle = TURN_COLORS[1];
    ctx.fillRect(0, 0, 10, 750);
    ctx.fillRect(1190, 0, 10, 750);

    for (let r = 0; r < 11; r++) {
        for (let q = 0; q < 11; q++) {
            let [centre_x, centre_y] = hexToPixel(q, r);
            drawHexagon(ctx, centre_x, centre_y, HEX_SIZE, undefined);
        }
    }
}

function getClick(event) {
    const rect = CANVAS.getBoundingClientRect()
    const x = event.clientX - rect.left - LEFT_PADDING;
    const y = event.clientY - rect.top - TOP_PADDING;
    makeMove(x, y, CANVAS.getContext('2d'));
}


function makeMove(x, y, ctx) {
    let [q, r] = pixelToHex(x, y);
    // check that move is valid ( <q,r> is on the board and not already taken)
    if (0 <= q && q < BOARD_SIZE && 0 <= r && r < BOARD_SIZE && grid[r][q] < 0) {
        let [centre_x, centre_y] = hexToPixel(q, r);
        drawHexagon(ctx, centre_x, centre_y, HEX_SIZE - 5, TURN_COLORS[turn]);
        // record move in the grid
        grid[r][q] = turn;
        connectPaths(q, r);
        if (isGameOver()) {
            CANVAS.removeEventListener('mousedown', getClick);
            ctx.fillRect(25, 25, 1150, 700);

        }
        // increment turn counter
        turn ^= 1;
    }
}

function connectPaths(q, r) {
    let pathid = r * BOARD_SIZE + q;
    for ([nq, nr] of hexNeighbours(q,r)) {
        if (grid[nr][nq] == turn) {
            union(pathid, nr * BOARD_SIZE + nq); 
        }
    }
}


function isGameOver() {
    if (turn == 0) {
        for (let qStart = 0; qStart < BOARD_SIZE; qStart++) {
            // check top row for current player's moves
            if (grid[0][qStart] == turn) {
                // check for connections to the bottom row
                for (let qEnd = 0; qEnd < BOARD_SIZE; qEnd++) {
                    if (connected(qStart, BOARD_SIZE * (BOARD_SIZE - 1) + qEnd)) {
                        return true;
                    }
                }
            }
        }
    } else {
        for (let rStart = 0; rStart < BOARD_SIZE; rStart++) {
            // check leftmost column for current player's moves
            if (grid[rStart][0] == turn) {
                // check for connections to rightmost column
                for (let rEnd = 0; rEnd < BOARD_SIZE; rEnd++) {
                    if (connected(rStart * BOARD_SIZE, (rEnd + 1) * BOARD_SIZE - 1)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
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

function hexNeighbours(q, r) {
    neighbours = [];
    for ([dq, dr] of DIRECTIONS) {
        let [newq, newr] = [q + dq, r + dr];
        if (0 <= newq && newq < BOARD_SIZE && 0 <= newr && newr < BOARD_SIZE) {
            neighbours.push([newq, newr]);
        }
    }
    return neighbours;
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

