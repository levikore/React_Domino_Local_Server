const MAX_NUMBER_ON_SIDE = 6;
const PLAYER_BANK_START_SIZE = 6;
const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

function shuffleArray(array) {//move to util
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function PrerenderedPiece(number1, number2, isHorizontal, isInverted, isPossibleMove) {
    this.number1 = number1,
        this.number2 = number2,
        this.isHorizontal = isHorizontal,
        this.isInverted = isInverted,
        this.isPossibleMove = isPossibleMove

    this.clone = function () {
        return new PrerenderedPiece(this.number1, this.number2, this.isHorizontal, this.isInverted, this.isPossibleMove);

    }
}

class PossibleMove {
    constructor(row, column, isHorizontal, facingNumber, direction) {
        this.row = row;
        this.column = column;
        this.isHorizontal = isHorizontal;
        this.facingNumber = facingNumber;
        this.direction = direction;
        this.isInverted = this.isInverted.bind(this);
    }

    isInverted(piece) {
        let isInvert = false;
        if (typeof this.direction !== "undefined") {
            if (this.direction === UP || this.direction === RIGHT) {
                if (piece.number1 != this.facingNumber) {
                    isInvert = true;
                }
            }
            else if (this.direction === DOWN || this.direction === LEFT) {
                if (piece.number2 != this.facingNumber) {
                    isInvert = true;
                }
            }
        }

        return isInvert;
    }

}

function getMiddle(number) {
    var middle = (number / 2).toFixed() - 1
    return middle >= 0 ? middle : middle - 1;
}

module.exports = {shuffleArray, PrerenderedPiece, PossibleMove, getMiddle};
