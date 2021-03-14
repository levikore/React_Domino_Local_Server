
const utilities = require("../components/Utilities/utils");

const MAX_NUMBER_ON_SIDE = 6;
const PLAYER_BANK_START_SIZE = 6;
const ROWS = 7;
const COLUMNS = 14;
const DIMENSIONS = 3 + "vw";

const gamesList = {};

function gameAuthentication(req, res, next) {
    if (gamesList[req.session.id] === undefined) {
        res.sendStatus(401);
    }
    else {
        next();
    }
}

function getGameInfo(id) {
    const game = gamesList[sessionid];
    return {
        gameName: game.gameName,
        creatorName: game.creatorName,
        numberOfPlayers: game.numberOfPlayers,
        numberOfPlayersSignedIn: (game.signedInPlayers).length
    };
}

function addGameToGameList(req, res, next) {
    if (gamesList[getNewGameID(req)] !== undefined) {
        res.status(403).send('game already in progress');
    }
    else {
        for (id in gamesList) {
            const currentGame = gamesList[id];
            if (currentGame.gameName === JSON.parse(req.body).gameName) {
                res.status(403).send('game already exists');
                return;
            }
        }

        let gameObject = buildGameObject(req);

        gamesList[gameObject.id] = gameObject;
        next();
    }
}

function buildGameObject(req) {
    let gameObject = JSON.parse(req.body);
    gameObject.id = getNewGameID(req);
    return gameObject;
}

function getNewGameID(req) {
    let gameObject = JSON.parse(req.body);
    return gameObject.gameName;
}

function addUserToGame(req, res, next) {
    const gameId = JSON.parse(req.body).gameId;
    const gameInfo = gamesList[gameId];

    if (gameInfo.numberOfPlayers < gameInfo.singedInPlayersIdsArray.length) {
        res.sendStatus(403);
    }
    else {
        let player = {
            id: req.session.id,
            name: JSON.parse(req.body).userName,
            privateState: {
                "playerBank": null,
                "gameTime": 0,
                "avgTime": 0,
                "numOfTurns": 0,
                "takeFromTheStock": 0,
                "score": 0,
                "isObserver": false
            },
        }
        gamesList[gameId].singedInPlayersIdsArray.push(player);

        if (gamesList[gameId].singedInPlayersIdsArray.length == gameInfo.numberOfPlayers) {

            gamesList[gameId].isGameStart = true;
            initializeGameSatate(gameId);
        }
        next();
    }
}

function initializeGameSatate(gameId) {
    gamesList[gameId].currentState = {
        "boardMatrix": Array(ROWS).fill().map(() => Array(COLUMNS).fill(null)),
        "bank": null,
        "possibleMoves": getInitializedPossibleMoves(gameId),
        "currentTurnIndex": 0,
        "stuckPlayersCounter": 0,
    }

    initializeBanks(gameId);
}

function getInitializedPossibleMoves() {
    var possibleMoves = [];

    for (var i = 0; i <= MAX_NUMBER_ON_SIDE; i++) {
        possibleMoves.push(getStartMoveArray());
    }

    return possibleMoves;
}

function getStartMoveArray() {
    var possibleMovesArray = [];
    var possibleMove = new utilities.PossibleMove(utilities.getMiddle(ROWS), utilities.getMiddle(COLUMNS), true);
    possibleMovesArray.push(possibleMove);
    return possibleMovesArray;
}

function initializeBanks(gameId) {
    gamesList[gameId].currentState.bank = getStartBankArray().slice();
    initializePlayerBanks(gameId, gamesList[gameId].currentState.bank);
}

function getStartBankArray() {
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

    utilities.shuffleArray(startBankArray);
    return startBankArray;
}

function initializePlayerBanks(gameId, startBankArray) {

    for (index in gamesList[gameId].singedInPlayersIdsArray) {
        gamesList[gameId].singedInPlayersIdsArray[index].privateState.playerBank = popRandomMembersFromBankArray(startBankArray, PLAYER_BANK_START_SIZE);
    }
}

function popRandomMembersFromBankArray(bankArray, numberOfMembers) {
    return bankArray.splice(0, numberOfMembers);
}

function removeGameFromGameList(req, res, next) {
    const gameId = req.body;
    const gameInfo = gamesList[gameId];

    if (gamesList[gameId] === undefined) {
        res.status(403).send('game does not exist');
    }
    else if (gameInfo.singedInPlayersIdsArray.length !== 0) {
        res.status(403).send("can't delete game with signed in players");
    }
    else {
        delete gamesList[gameId];
    }

    next();
}

function getGamesList() {
    return JSON.stringify(gamesList);
}

function deleteUserFromGame(req, res, next) {
    const gameId = req.body;

    if (gamesList[gameId] === undefined) {
        res.status(403).send('game does not exist');
    }
    else {
        let temporaryUserArray = gamesList[gameId].singedInPlayersIdsArray.filter(function (value, index, arr) {
            return value.id != req.session.id;
        });

        gamesList[gameId].singedInPlayersIdsArray = temporaryUserArray;

        if (gamesList[gameId].singedInPlayersIdsArray.length === 0 && gamesList[gameId].isGameOver) {
            nulifyGame(gameId);
        }
    }

    next();
}

function nulifyGame(gameId) {
    gamesList[gameId].singedInPlayersIdsArray = [];
    gamesList[gameId].isGameStart = false;
    gamesList[gameId].isGameOver = false;
    gamesList[gameId].winnerList = [];
    gamesList[gameId].currentState = null;
}

function handleTurnEnd(req, res, next) {
    const gameId = JSON.parse(req.body).id;

    if (gamesList[gameId] === undefined) {
        res.status(403).send('game does not exist');
    }

    handleSaveCurrentState(req);
    handleTurnSwitch(gameId);

    next();
}

function saveCurrentState(req, res, next) {
    handleSaveCurrentState(req)
    next();
}

function handleSaveCurrentState(req) {
    const gameId = JSON.parse(req.body).id;

    if (gamesList[gameId] === undefined) {
        res.status(403).send('game does not exist');
    }
    else {
        const newState = JSON.parse(JSON.parse(req.body).currentState);
        var isNextTurn = checkIfNextTurn(gameId, newState);

        gamesList[gameId].currentState = newState.publicState;
        const currentTurnIndex = gamesList[gameId].currentState.currentTurnIndex;
        gamesList[gameId].singedInPlayersIdsArray[currentTurnIndex].privateState = newState.privateState;

        handleObserver(gameId, currentTurnIndex);


        if (isNextTurn) {
            handleTurnSwitch(gameId);
        }
    }
}

function handleObserver(gameId, currentTurnIndex) {
    const player = gamesList[gameId].singedInPlayersIdsArray[currentTurnIndex];

    if (player.privateState.isObserver) {
        gamesList[gameId].winnerList.push(player);
    }
}

function checkIfNextTurn(gameId, newState) {
    const prevBoard = gamesList[gameId].currentState.boardMatrix;
    const newBoard = newState.publicState.boardMatrix;
    return (isBoardChanged(prevBoard, newBoard) || newState.publicState.stuckPlayersCounter !== 0);
}

function isBoardChanged(prevBoard, newBoard) {
    return JSON.stringify(prevBoard) !== JSON.stringify(newBoard);
}

function handleTurnSwitch(gameId) {

    gamesList[gameId].currentState.currentTurnIndex =
        (gamesList[gameId].currentState.currentTurnIndex + 1) %
        gamesList[gameId].singedInPlayersIdsArray.length;

    let newIndex = gamesList[gameId].currentState.currentTurnIndex;

    if (isAllActivePlayersStuck(gameId)) {
        handleTieState(gameId);
    }
    else if (isOneActivePlayerLeft(gameId)) {
        let player = gamesList[gameId].singedInPlayersIdsArray[getLoserIndex(gameId)];
        gamesList[gameId].winnerList.push(player);
        endGame(gameId);
    }
    else if (gamesList[gameId].singedInPlayersIdsArray[newIndex].privateState.isObserver) {
        handleTurnSwitch(gameId);
    }
}

function isAllActivePlayersStuck(gameId) {
    let numberOfStuckPlayers = gamesList[gameId].currentState.stuckPlayersCounter;
    let numberOfWinners = gamesList[gameId].winnerList.length;
    let numberOfPlayers = gamesList[gameId].singedInPlayersIdsArray.length;

    console.log(numberOfStuckPlayers === numberOfPlayers - numberOfWinners);

    return numberOfStuckPlayers === numberOfPlayers - numberOfWinners;
}

function handleTieState(gameId) {
    let tieArray = gamesList[gameId].singedInPlayersIdsArray.filter(player => !player.privateState.isObserver);

    console.log(tieArray);

    tieArray.sort((player1, player2) => -(player2.privateState.score - player1.privateState.score));

    console.log(tieArray);

    if (gamesList[gameId].winnerList.length !== 0) {
        Array.prototype.push.apply(gamesList[gameId].winnerList, tieArray);
    }
    else {
        gamesList[gameId].winnerList = tieArray.slice();
    }

    console.log(gamesList[gameId].winnerList);

    endGame(gameId);
}

function getLoserIndex(gameId) {
    var index = 0;
    const playerArray = gamesList[gameId].singedInPlayersIdsArray;
    for (index = 0; index < playerArray.length; index++) {
        if (!playerArray[index].privateState.isObserver) {
            break;
        }
    }

    console.log(playerArray[index]);
    return index;
}

function endGame(gameId) {
    gamesList[gameId].isGameOver = true;
    gamesList[gameId].isGameStart = false;
    console.log(gamesList[gameId].isGameOver);
}

function isOneActivePlayerLeft(gameId) {
    let numberOfPlayers = gamesList[gameId].singedInPlayersIdsArray.length;
    let numberOfWinners = gamesList[gameId].winnerList.length;

    console.log(numberOfPlayers - numberOfWinners === 1);

    return numberOfPlayers - numberOfWinners === 1;

}

function getCurrentGameState(req, res, next) {
    return JSON.stringify(gamesList[req.body].currentState);
}

module.exports = { getGameInfo, gameAuthentication, addGameToGameList, getGamesList, addUserToGame, removeGameFromGameList, deleteUserFromGame, saveCurrentState, getCurrentGameState, handleTurnEnd }