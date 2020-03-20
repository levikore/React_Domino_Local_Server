import React, { Component } from "react";
import Board from "./Board.jsx";
import UserBank from "./UserBank.jsx";
import Statistics from "./Statistics.jsx";
import theme from "./theme.css";
const utilities = require("../Utilities/utils");


const MAX_NUMBER_ON_SIDE = 6;
const PLAYER_BANK_START_SIZE = 6;
const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

class Game extends Component {
    constructor(props) {
        super(props);
        this.rows = this.props.rows;
        this.columns = this.props.columns;
        this.cellDimensions = this.props.cellDimensions;
        this.possibleMoves = this.initializePossibleMoves();
        this.restartGame = this.restartGame.bind(this);
        this.currentTime = {};
        this.currentAvgTime = {};
        this.currentPossibleMove = null;
        this.gameHistoryArray = [];
        this.historyIndex = 0;
        this.gameId = this.props.id;
        //------------------------------------------------
        this.lastTurnIndex = -1;
        this.mySessionId = this.props.currentUser.id;
        this.myIngameIndex = -1;
        this.isInitialized = false;
        this.currentGame = null;
        this.stuckPlayersCounter = 0;
        //-------------------------------------------------------

        this.handleBackButton = this.handleBackButton.bind(this);
        this.handleNextButton = this.handleNextButton.bind(this);

        this.state = {
            selectedPiece: null,
            boardMatrix: Array(this.rows).fill().map(() => Array(this.columns).fill(null)),
            bank: [],
            playerBank: [],
            isWinner: false,
            isLoser: false,
            isGameOn: false,
            numOfTurns: 0,
            takeFromTheStock: 0,
            score: 0,
            avgTimeOn: false,
            currentTurnIndex: 0,

            isObserver: false,

            isRenderHeader: false,
        };

        this.getCurrentGameStateFromServer = this.getCurrentGameStateFromServer.bind(this);
    }

    componentDidMount() {
        this.getCurrentGameStateFromServer();
    }

    componentWillUnmount() {
        if (this.fetchTimeoutId) {
            clearTimeout(this.fetchTimeoutId);
        }
    }

    getStartBankArray() {
        var startBankArray = [];
        var piece;

        for (var i = 0; i <= MAX_NUMBER_ON_SIDE; i++) {
            for (var j = 0; j <= MAX_NUMBER_ON_SIDE; j++) {
                piece = new utilities.PrerenderedPiece(i, j, false, false, true)
                if (!startBankArray.some(member => member.number1 == j && member.number2 == i)) {
                    startBankArray.push(piece);
                }
            }
        }

        shuffleArray(startBankArray);
        return startBankArray;
    }

    popRundomMembersFromBankArray(bankArray, numberOfMembers) {
        return bankArray.splice(0, numberOfMembers);
    }

    setBankStates(bankArray, playerBankArray) {
        this.setState({
            bank: bankArray,
            playerBank: playerBankArray
        })
    }

    initializeBanks() {
        var startBankArray = this.getStartBankArray();
        var startPlayerBankArray = this.popRundomMembersFromBankArray(startBankArray, PLAYER_BANK_START_SIZE);
        this.setBankStates(startBankArray, startPlayerBankArray);
    }

    initializePossibleMoves() {
        var possibleMoves = [];

        for (var i = 0; i <= MAX_NUMBER_ON_SIDE; i++) {
            possibleMoves.push(this.getStartMoveArray());
        }

        return possibleMoves;
    }

    getStartMoveArray() {
        var possibleMovesArray = [];
        possibleMovesArray.push(new utilities.PossibleMove(getMiddle(this.rows), getMiddle(this.columns), true));
        return possibleMovesArray;
    }

    handlePieceSelect(row, column) {
        const selectedPiece = this.state.playerBank[column];
        if (selectedPiece == this.state.selectedPiece) {
            this.deselectPiece();
        }
        else {
            var newBoardMatrix = this.getBoardMatrixWithPossibleMoves(selectedPiece)
            this.setState({
                selectedPiece: selectedPiece,
                boardMatrix: newBoardMatrix
            });
        }
    }

    getBoardMatrixWithPossibleMoves(selectedPiece) {
        var boardMatrixCopy = this.getBoardMatrixWithoutPossibleMoves();
        var currentPossibleMovesForPiece = this.getPosibleMovesforPiece(selectedPiece);

        for (var i = 0; i < currentPossibleMovesForPiece.length; i++) {
            var pieceToPut = JSON.parse(JSON.stringify(selectedPiece));
            let toBeAssignedPossibleMove = new utilities.PossibleMove(1, 1, true, null, null);
            var possibleMove = Object.assign(toBeAssignedPossibleMove, currentPossibleMovesForPiece[i]);

            pieceToPut.isHorizontal = this.isDoublePiece(pieceToPut) ? !possibleMove.isHorizontal : possibleMove.isHorizontal;
            pieceToPut.isInverted = possibleMove.isInverted(pieceToPut);
            boardMatrixCopy[possibleMove.row][possibleMove.column] = pieceToPut;
        }

        return boardMatrixCopy;
    }

    getBoardMatrixWithoutPossibleMoves() {
        var boardMatrixCopy = this.state.boardMatrix.slice(0);
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                boardMatrixCopy[i][j] = (boardMatrixCopy[i][j] != null && boardMatrixCopy[i][j].isPossibleMove) ? null : boardMatrixCopy[i][j];
            }
        }

        return boardMatrixCopy;
    }

    getPosibleMovesforPiece(piece) {
        var movesArray1 = this.possibleMoves[piece.number1].slice(0);
        var movesArray2 = this.possibleMoves[piece.number2].slice(0);

        var possibleMoves = movesArray1.concat(movesArray2);

        return possibleMoves;
    }

    getBoardMatrixWithNewPiece(lastMoveRow, lastMoveColumn) {
        var boardCopy = this.state.boardMatrix.slice(0);
        if (boardCopy[lastMoveRow][lastMoveColumn] != null) {
            boardCopy[lastMoveRow][lastMoveColumn].isPossibleMove = false;
        }

        return boardCopy;
    }

    updatePossibleMoves(row, column) {
        this.removeLastMoveFromPossibleMoves(row, column);
        this.addNewPossibleMoves(row, column);
    }

    removeLastMoveFromPossibleMoves(row, column) {
        for (var i = 0; i < this.possibleMoves.length; i++) {
            var movesArray = this.possibleMoves[i];

            for (var j = 0; j < movesArray.length; j++) {
                if (movesArray[j].row == row && movesArray[j].column == column) {
                    movesArray.splice(j, 1);
                    break;
                }
            }
        }
    }

    addNewPossibleMoves(row, column) {
        const lastPiece = this.state.boardMatrix[row][column];

        const isLastPieceHorizontal = lastPiece.isHorizontal;
        const isLastPieceInverted = lastPiece.isInverted;

        if (this.isDoublePiece(lastPiece)) {
            this.addVerticalPossibleMoves(row, column, lastPiece.number1, lastPiece.number1);
            this.addHorizontalPossibleMoves(row, column, lastPiece.number1, lastPiece.number1);

        }
        else {
            if (isLastPieceHorizontal) {
                this.addHorizontalPossibleMoves(row, column,
                    isLastPieceInverted ? lastPiece.number1 : lastPiece.number2,
                    isLastPieceInverted ? lastPiece.number2 : lastPiece.number1);

            }
            else {
                this.addVerticalPossibleMoves(row, column,
                    isLastPieceInverted ? lastPiece.number2 : lastPiece.number1,
                    isLastPieceInverted ? lastPiece.number1 : lastPiece.number2);
            }
        }
    }

    isDoublePiece(piece) {
        return piece.number1 === piece.number2;
    }

    addVerticalPossibleMoves(row, column, number1, number2) {
        this.addNewPossibleMove(row - 1, column, number1, false, DOWN);
        this.addNewPossibleMove(row + 1, column, number2, false, UP);
    }

    addHorizontalPossibleMoves(row, column, number1, number2) {
        this.addNewPossibleMove(row, column - 1, number1, true, RIGHT);
        this.addNewPossibleMove(row, column + 1, number2, true, LEFT);
    }

    addNewPossibleMove(row, column, number, isHorizontal, facingDirection) {
        if (row < this.rows && row >= 0 && column >= 0 && column < this.columns && this.state.boardMatrix[row][column] === null) {
            this.possibleMoves[number].push(new utilities.PossibleMove(row, column, isHorizontal, number, facingDirection));
        }
    }

    getUpdatedPlayerBank() {
        const currentPiece = this.state.selectedPiece;
        var playerBankCopy = this.state.playerBank.splice(0);

        if (currentPiece != null) {
            for (var i = 0; i < playerBankCopy.length; i++) {
                if (playerBankCopy[i].number1 === currentPiece.number1 && playerBankCopy[i].number2 === currentPiece.number2) {
                    break;
                }
            }

            playerBankCopy.splice(i, 1);
        }

        return playerBankCopy;
    }

    deselectPiece() {
        var newBoardMatrix = this.getBoardMatrixWithoutPossibleMoves();
        this.setState({
            selectedPiece: null,
            boardMatrix: newBoardMatrix
        });
    }

    handleGameAfterMove() {

        var numOfMoves = this.countAvailableMoves();
        if (this.state.playerBank.length !== 0 && numOfMoves === 0 && this.state.bank.length !== 0) {
            this.popPieceIntoPlayerBankUntilThereArePossibleMoves();
        }
        else if (numOfMoves === 0 && this.state.bank.length === 0) {
            this.stuckPlayersCounter++;
            console.log(this.stuckPlayersCounter);
            this.saveCurrentGame();
        }
    }

    countAvailableMoves() {
        var movesCounter = 0;
        const playerBank = this.state.playerBank;

        for (var i = 0; i < playerBank.length; i++) {
            movesCounter += this.possibleMoves[playerBank[i].number1].length + this.possibleMoves[playerBank[i].number2].length;
        }

        return movesCounter;
    }

    updatePlayerStatistics() {
        var currentPiece = this.state.selectedPiece

        if (currentPiece != null) {

            var newScore = this.state.score + currentPiece.number1 + currentPiece.number2;

            var newTurnCount = this.state.numOfTurns + 1;

            this.setState({
                score: newScore,
                numOfTurns: newTurnCount,
                avgTimeOn: true
            }, () => { this.setState({ avgTimeOn: false }); }
            );
        }
    }

    popPieceIntoPlayerBankUntilThereArePossibleMoves() {
        var bankCopy = this.state.bank.slice(0);
        var playerBankCopy = this.state.playerBank.slice(0);

        var stockTake = this.state.takeFromTheStock + 1;
        var newNumOfTurns = this.state.numOfTurns + 1;

        const newPiece = JSON.parse(JSON.stringify(bankCopy.pop()));

        playerBankCopy.push(newPiece);

        this.setState({
            bank: bankCopy,
            playerBank: playerBankCopy,

            takeFromTheStock: stockTake,
            numOfTurns: newNumOfTurns
        },
            () => {
                this.saveCurrentGame();
                this.handleGameAfterMove();
            }
        );
    }


    handleCellClick(row, column) {
        if (this.state.boardMatrix[row][column] != null && this.state.boardMatrix[row][column].isPossibleMove) {

            this.updatePlayerStatistics();
            var newBoardMatrix = this.getBoardMatrixWithNewPiece(row, column);
            var newPlayerBank = this.getUpdatedPlayerBank();

            this.stuckPlayersCounter = 0;

            this.setState({
                boardMatrix: newBoardMatrix,
                playerBank: newPlayerBank,
                isObserver: newPlayerBank.length === 0,
            },
                () => {
                    this.deselectPiece();
                    this.updatePossibleMoves(row, column);
                    this.saveCurrentGame();
                }
            );
        }
    }

    saveCurrentGame() {

        let gameHistoryObject = {
            publicState: {
                "boardMatrix": this.state.boardMatrix.map((member) => member.map((innerMember) => innerMember)),
                "bank": this.state.bank.map((member) => member),
                "possibleMoves": this.possibleMoves.map((member) => member.map((innerMember) => innerMember)),
                "currentTurnIndex": this.state.currentTurnIndex,
                "stuckPlayersCounter": this.stuckPlayersCounter,
            },
            privateState: {
                "playerBank": this.state.playerBank.map((member) => member),
                "gameTime": this.currentTime,
                "avgTime": this.currentAvgTime,
                "numOfTurns": this.state.numOfTurns,
                "takeFromTheStock": this.state.takeFromTheStock,
                "score": this.state.score,
                "isObserver": this.state.isObserver,
            }
        }

        this.saveCurrentStateInServer(gameHistoryObject);
    }

    saveCurrentStateInServer(currentGameState) {
        let body = {
            id: this.props.id,
            currentState: JSON.stringify(currentGameState)
        }

        return fetch('/games/saveCurrentState', { method: 'POST', body: JSON.stringify(body), credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    console.log("failed to save state");
                }
            })
    }

    getCurrentGameStateFromServer() {
        const interval = 200;
        return fetch("/games/allGames", { method: "GET", credentials: "include" })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }

                this.fetchTimeoutId = setTimeout(this.getCurrentGameStateFromServer, interval);

                return response.json();
            })
            .then(gamesList => {
                let gameObject = JSON.parse(gamesList)[this.gameId];
                this.handleUpdatedGame(gameObject);
            })
            .catch(err => {
                throw err;
            });
    }

    handleUpdatedGame(gameObject) {
        this.currentGame = gameObject;

        if (gameObject.isGameStart) {
            if (!this.isInitialized) {
                this.myIngameIndex = this.getInGameIndex(gameObject.singedInPlayersIdsArray);
                this.isInitialized = true;

                this.setState({
                    isGameOn: true,
                });
            }

            if (this.isTurnIndexUpdated(gameObject.currentState.currentTurnIndex) || this.isBankUpdated(gameObject.currentState.bank)) {
                this.showCurrentHistory(gameObject.currentState);
                if (this.isMyTurn(gameObject.currentState.currentTurnIndex)) {
                    this.handleGameAfterMove();

                }
            }
        }
        else if (gameObject.isGameOver) {
            this.handleEndGame(gameObject)
        }
    }

    handleEndGame(gameObject) {
        if (this.fetchTimeoutId) {
            clearTimeout(this.fetchTimeoutId);
        }

        this.showCurrentHistory(gameObject.currentState);

        this.setState({
            isGameOn: false,
            isObserver: true,
        });
    }

    isUpdatable(turnIndex) {
        let result = false;
        if (this.firstTime) {
            this.firstTime = false;
            result = true;
        }
        else if (!this.isMyTurn(turnIndex)) {
            result = true;
        }

        return result;
    }

    isMyTurn(turnIndex) {
        return this.myIngameIndex === turnIndex;
    }

    isBankUpdated(updatedBank) {
        return JSON.stringify(this.state.bank) !== JSON.stringify(updatedBank);
    }

    isTurnIndexUpdated(updatedTurnIndex) {
        let result = false;
        if (this.lastTurnIndex != updatedTurnIndex) {
            this.lastTurnIndex = updatedTurnIndex;
            result = true;
        }

        return result;
    }

    getInGameIndex(playersArray) {
        for (var i = 0; i < playersArray.length; i++) {
            if (playersArray[i].id === this.mySessionId) {
                break;
            }
        }

        return i;
    }

    restartGame() {
        this.initializeBanks();
        this.possibleMoves = this.initializePossibleMoves();
        this.initializeStatistics();
        this.gameHistoryArray = [];
        this.historyIndex = 0;
        this.setState({
            selectedPiece: null,
            boardMatrix: Array(this.rows).fill().map(() => Array(this.columns).fill(null)),
            isWinner: false,
            isLoser: false,
            isGameOn: true,
        }, () => {
            this.currentTime = {};
            this.currentAvgTime = {};
            this.saveCurrentGame();
        }
        );
    }

    initializeStatistics() {
        this.setState({
            numOfTurns: 0,
            takeFromTheStock: 0,
            score: 0,
            avgTimeOn: false
        });
    }

    timeBlockGetter(currentTime, currentAvgTime) {
        this.currentTime = currentTime;
        this.currentAvgTime = currentAvgTime;
    }

    handleBackButton() {
        if (this.historyIndex - 1 >= 0) {
            var currentHistoryObject = this.gameHistoryArray[--this.historyIndex];
            this.showCurrentHistory(currentHistoryObject);
        }
    }

    handleNextButton() {
        if (this.historyIndex + 1 < this.gameHistoryArray.length) {
            var currentHistoryObject = this.gameHistoryArray[++this.historyIndex];
            this.showCurrentHistory(currentHistoryObject);
        }
    }

    isMyTurn() {
        var result = false;
        if (this.currentGame) {
            result = this.currentGame.currentState.currentTurnIndex === this.myIngameIndex;
        }

        return result;
    }

    showCurrentHistory() {
        let publicGameState = this.currentGame.currentState;
        let privateGameState = this.currentGame.singedInPlayersIdsArray[this.myIngameIndex].privateState;

        this.stuckPlayersCounter = publicGameState.stuckPlayersCounter;

        this.setState({
            boardMatrix: publicGameState.boardMatrix.map((member) => member.map((innerMember) => innerMember)),
            bank: publicGameState.bank.map((member) => member),
            playerBank: privateGameState.playerBank.map((member) => member),
            currentTurnIndex: publicGameState.currentTurnIndex,
        }, () => { this.possibleMoves = publicGameState.possibleMoves.map((member) => member.map((innerMember) => innerMember)); }
        );
    }

    renderGameInformation() {
        return (
            <div className="informationContainer">
                {this.getGameStatus()}||
                {this.state.isGameOn ? <div>Now Playing: {this.getCurrentPlayerName()}</div> : ""}
            </div>
        );
    }

    getGameStatus() {
        let result = "";

        if (this.state.isGameOn && !this.state.isObserver) {
            result = "Game In Progress";
        }
        else if (!this.state.isGameOn && !this.state.isObserver) {
            result = "Waiting For Players";
        }
        else if (this.state.isGameOn && this.state.isObserver) {
            result = "Observer mode";
        }
        else if (!this.state.isGameOn && this.state.isObserver) {
            result = "Game Over";
        }

        return result;
    }

    renderOponentsCarts() {
        const playersInformationArray = this.currentGame.singedInPlayersIdsArray.slice();

        const listItems = playersInformationArray.map((playerInformation, index) =>
            (index != this.myIngameIndex) ?
                <li key={index}>
                    {playersInformationArray[index].name}'s cart: {playersInformationArray[index].privateState.playerBank.length}
                </li> : null

        );

        return listItems;
    }

    getCurrentPlayerName() {
        return this.isMyTurn() ? "Me" : this.currentGame.singedInPlayersIdsArray[this.currentGame.currentState.currentTurnIndex].name;
    }

    renderEndGameStatistics() {
        return (
            <div>
                <h2>Endgame Statistics:</h2>
                <ul id="endgameStatistics">
                    {this.getStatisticsList()}
                </ul>
            </div>

        );
    }

    renderStatistics() {
        var renderedStatistics = (!this.state.isGameOn && this.state.isObserver) ?
            this.renderEndGameStatistics() :
            <Statistics
                numOfTurns={this.state.numOfTurns}
                takeFromTheStock={this.state.takeFromTheStock}
                score={this.state.score}
                avgTimeOn={this.state.avgTimeOn}
                isGameOn={this.state.isGameOn}
                currentTime={this.currentTime}
                currentAvgTime={this.currentAvgTime}
                timeBlockGetter={(currentTime, currentAvgTime) => this.timeBlockGetter(currentTime, currentAvgTime)}
            />

        return renderedStatistics;
    }

    getStatisticsList() {
        let winnerList = this.currentGame.winnerList.slice();
        let statisticsList = winnerList.map((player, index) =>
            <li key={player.id}>
                <div>
                    <h3>{index + 1}# place: {player.name}</h3>
                    <p>Game Time: m {player.privateState.gameTime.m} s {player.privateState.gameTime.s}</p>
                    <p>Avg Time: m {player.privateState.avgTime.m} s {player.privateState.avgTime.s}</p>
                    <p>Num of turns: {player.privateState.numOfTurns}</p>
                    <p>Taken from stock: {player.privateState.takeFromTheStock}</p>
                    <p>score: {player.privateState.score}</p>
                </div>
            </li>
        );

        return statisticsList;
    }


    render() {
        return (
            <div className="columnFlex">
                {!this.state.isGameOn || this.state.isObserver ? <button className="Quit-btn" onClick={this.props.quitGameHandler}>Quit</button> : ""}
                {this.renderGameInformation()}
                <div id="gameContainer">
                    <Board
                        rows={this.rows}
                        columns={this.columns}
                        cellDimensions={this.cellDimensions}
                        boardMatrix={this.state.boardMatrix}
                        handleCellClick={(row, column) => this.handleCellClick(row, column)}
                    />
                    <div>
                        {this.renderStatistics()}
                        <div>
                            <h3>Oponents carts:</h3>
                            {this.state.isGameOn || this.state.isObserver ? <ul>{this.renderOponentsCarts()}</ul> : ""}
                        </div>
                    </div>
                </div>
                <div className={this.isMyTurn() && this.state.isGameOn ? "" : "unclickableGui"}>
                    <UserBank
                        containedPieces={this.state.playerBank}
                        selectedPiece={this.state.selectedPiece}
                        piecesLeftInBank={this.state.bank.length}
                        cellDimensions={this.cellDimensions}
                        handleCellClick={(row, column) => this.handlePieceSelect(row, column)}
                    />
                </div>
            </div>
        );
    }
}


function getMiddle(number) {
    var middle = (number / 2).toFixed() - 1
    return middle >= 0 ? middle : middle - 1;
}

export default Game;
