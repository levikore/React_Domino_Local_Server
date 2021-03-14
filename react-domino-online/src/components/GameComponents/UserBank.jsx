import React, { Component } from "react";
import Cell from "./Cell.jsx";
import theme from "./theme.css";

const DEFAULT_DIMENSION = 5 + "vw";
const Default_Cell_ClassType = "bank "
const SELECTED_CELL_CLASSTYPE = "selected "

class UserBank extends Component {
  renderCell(piece, cellId) {
    return <Cell
      key={cellId}
      cellId={cellId}
      classType={Default_Cell_ClassType + (this.props.selectedPiece == piece ? SELECTED_CELL_CLASSTYPE : "")}
      column={cellId}
      row={0}
      cellDimensions={this.props.cellDimensions}
      piece={piece}
      handleCellClick={this.props.handleCellClick}
    />
  }

  render() {
    return (
      <div>
        <p>Left in Stock: {this.props.piecesLeftInBank}</p>
        <div className="player_bank_container">{this.props.containedPieces.map(
          (piece, index) =>
            this.renderCell(piece, index)
        )}
        </div>
      </div>
    );
  }
}

UserBank.defaultProps = {
  cellDimensions: DEFAULT_DIMENSION
}

export default UserBank;