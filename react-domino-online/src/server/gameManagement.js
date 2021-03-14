const express = require('express');
const router = express.Router();
const gameServer = require('./gameServer')
const auth = require('./auth');

const gameManagement = express.Router();

gameManagement.get('/', gameServer.gameAuthentication, (req, res) => {
	const game = gameServer.getGameInfo(res.session.id);
	res.json(game);
});

gameManagement.get('/allGames', auth.userAuthentication , (req, res) => {	
	let gameList = gameServer.getGamesList();
	res.status(200).json(gameList);
});

gameManagement.post('/addGame', gameServer.addGameToGameList, (req, res) => {		
	res.sendStatus(200);	
});

gameManagement.post('/addUserToGame', gameServer.addUserToGame, (req, res)=>{
	res.sendStatus(200);	
});

gameManagement.post('/deleteGame', gameServer.removeGameFromGameList, (req, res)=>{
	res.sendStatus(200);
});

gameManagement.post('/deleteUserFromGame', gameServer.deleteUserFromGame, (req, res)=>{
	res.sendStatus(200);
});

gameManagement.post('/turnEnd', gameServer.handleTurnEnd, (req, res)=>{
	res.sendStatus(200);
});

gameManagement.post('/saveCurrentState', gameServer.saveCurrentState, (req, res)=>{
	res.sendStatus(200);
});

gameManagement.get('/getCurrentGameState', gameServer.getCurrentGameState, (req, res)=>{
	res.sendStatus(200);
});

module.exports = gameManagement;