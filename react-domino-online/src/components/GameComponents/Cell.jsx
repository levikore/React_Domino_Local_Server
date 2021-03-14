import React, { Component } from "react";
import Piece from "./Piece.jsx";
import theme from "./theme.css";

class Cell extends Component {
    constructor(props) {
        super(props);

        this.style = {
            width: this.props.cellDimensions,
            height: this.props.cellDimensions,
            lineHeight: this.props.cellDimensions,
        };

        this.state = {
            isClicked: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.handleCellClick(this.props.row, this.props.column);
        this.setState({
            isClicked: true
        });
    }

    renderPiece() {
        var piece = this.props.piece;
        var renderedPiece = null;
        if (piece != null) {
            renderedPiece = <Piece
                number1={piece.number1}
                number2={piece.number2}
                isHorizontal={piece.isHorizontal}
                isInverted={piece.isInverted}
                dimension={this.props.cellDimensions}
            />
        }

        return renderedPiece;
    }

    render() {
        const isClicked = this.state.isClicked;
        var testPiece = new Piece(5, 6, true, true);
       const style = {
            width: this.props.cellDimensions,
            height: this.props.cellDimensions,
            lineHeight: this.props.cellDimensions,
        };
       
        return (
            <div
                className={"cell " + this.props.classType}
                style={style}
                id={this.props.cellId}
                onClick={() => this.handleClick()}
            >
                {this.renderPiece()}
            </div>
        );
    }
}

/*const tryStyle ={
    width: 20,
    height: 20,
    backgroundColor: "green"
}*/

Cell.defaultProps = {
    classType: ""
}

export default Cell;
