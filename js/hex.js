const BOARD_SIZE = 11;
const HEX_SIZE = 40;
const HEX_HEIGHT = 2 * HEX_SIZE;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;

function drawHexagon(ctx, centre_x, centre_y) {
    ctx.beginPath();
    // draw from top point, clockwise
    ctx.moveTo(centre_x, centre_y - HEX_HEIGHT/2);
    ctx.lineTo(centre_x + HEX_WIDTH/2, centre_y - HEX_HEIGHT/4);
    ctx.lineTo(centre_x + HEX_WIDTH/2, centre_y + HEX_HEIGHT/4);
    ctx.lineTo(centre_x, centre_y + HEX_HEIGHT/2);
    ctx.lineTo(centre_x - HEX_WIDTH/2, centre_y + HEX_HEIGHT/4);
    ctx.lineTo(centre_x - HEX_WIDTH/2, centre_y - HEX_HEIGHT/4);
    ctx.closePath();
    ctx.stroke();
}

// draw an initial BOARD_SIZE * BOARD_SIZE hex grid
function drawBoard() {
    var canvas = document.getElementById('board');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        for (let y_offset = 0; y_offset < BOARD_SIZE; y_offset++) {
            row_offset = y_offset/2 * HEX_WIDTH;
            for (let x_offset = 0; x_offset < BOARD_SIZE; x_offset++) {
                drawHexagon(ctx, (row_offset + x_offset * HEX_WIDTH) + 75, (y_offset * (0.75*HEX_HEIGHT)) + 75);
            }
        }
    } else {
        // canvas unsupported
    }
}
