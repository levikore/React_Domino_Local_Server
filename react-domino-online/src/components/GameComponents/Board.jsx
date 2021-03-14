import React, { Component } from "react";
import Cell from "./Cell.jsx";
import theme from "./theme.css";

class Board extends Component {

  renderCell(cellId, cellDimensions, i, j, piece, classType, handleCellClick) {
    return <Cell
      key={cellId}
      cellId={cellId}
      cellDimensions={cellDimensions}
      row={i}
      column={j}
      piece={piece ? piece : null}
      classType={classType}
      handleCellClick={handleCellClick}
    />
  }

  isPossibleMove(row, column) {
    return this.props.boardMatrix[row][column] != null && this.props.boardMatrix[row][column].isPossibleMove ? true : false;
  }


  render() {
    const { rows, columns, cellDimensions, boardMatrix, handleCellClick } = this.props;

    var boardArray = [];

    for (var i = 0; i < rows; i++) {
      var rowArray = [];
      for (var j = 0; j < columns; j++) {
        let cellId = i + "_" + j;
        let classType = this.isPossibleMove(i, j) ? "possibleMove" : "";

        rowArray.push(this.renderCell(cellId, cellDimensions, i, j, boardMatrix[i][j], classType, handleCellClick));
      }

      boardArray.push(rowArray);
    }

    return (
      <table className="board">
        <tbody>
          {boardArray.map((rowArray, i) =>
            <tr key={i}>
              {rowArray.map((cell, j) =>
                <td key={j}>{cell}</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default Board;