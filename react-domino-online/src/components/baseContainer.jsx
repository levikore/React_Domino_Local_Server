import React from 'react';
import ReactDOM from 'react-dom';
import LoginContainer from './loginContainer.jsx';
import LobbyContainer from './lobbyContainer.jsx';
import ChatContaier from './chatContainer.jsx';
import Game from './GameComponents/Game.jsx'

const ROWS = 7;
const COLUMNS = 14;
const DIMENSIONS = 3 + "vw";

export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            showLogin: true,
            showLobby: true,
            currentUser: {
                id: '',
                name: ''
            },
            currentGame: null
        };

        this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);
        this.handleQuitGameSuccess = this.handleQuitGameSuccess.bind(this);
    }

    render() {
        if (this.state.showLogin) {
            return (<LoginContainer loginSuccessHandler={this.handleLoginSuccess} loginErrorHandler={this.handleLoginError} />)
        }


        if (this.state.showLobby) {
            return this.renderLobby();
        }

        if (this.state.currentGame) {
            return this.renderGameContainer();
        }
    }

    handleJoinGameSuccess(gameInfo) {
        this.setState(() => ({ showLobby: false, currentGame: gameInfo }));
    }

    handleQuitGameSuccess() {

        if (this.state.currentGame.isGameStart) {
            return console.log("You can't exit the game after it has started")
        }
        return fetch('/games/deleteUserFromGame', { method: 'POST', body: this.state.currentGame.id, credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    console.log(`failed to logout user ${this.state.currentUser.name} `, response);
                }
                this.setState(() => ({ showLobby: true, currentGame: null }));
            })
    }

    handleLoginSuccess() {
        this.setState(() => ({ showLogin: false }), this.getUserName);
    }

    handleLoginError() {
        console.error('login failed');
        this.setState(() => ({ showLogin: true }));
    }

    handleCreateNewGameSuccess() {

    }

    handleCreateNewGameError() {
        console.error('incorrect game parameters');
    }

    renderLobby() {
        return (
            <div className="lobby-base-container">
                <div className="user-info-area">
                    Hello {this.state.currentUser.name}
                    <button className="logout btn" onClick={this.logoutHandler}>Logout</button>
                </div>
                <LobbyContainer
                    currentUser={this.state.currentUser}
                    joinGameHandler={(gameInfo) => this.handleJoinGameSuccess(gameInfo)}
                    createNewGameErrorHandler={this.handleCreateNewGameError}
                />
            </div>
        )
    }

    renderGameHeader(gameObject) {
        return (
            <div>
                <h1>{gameObject.gameName}</h1>
                <p>for {gameObject.numberOfPlayers} players, hosted by: {gameObject.host.name}</p>
            </div>
        );
    }

    renderGameContainer() {
        return (
            <div className = "columnFlex">
                Hello {this.state.currentUser.name}
                {this.renderGameHeader(this.state.currentGame)}
                <Game id={this.state.currentGame.id}
                    currentUser={this.state.currentUser}
                    rows={ROWS} columns={COLUMNS}
                    cellDimensions={DIMENSIONS}
                    quitGameHandler={this.handleQuitGameSuccess}
                />
            </div>
        );
    }

    renderChatRoom() {
        return (
            <div className="chat-base-container">
                <div className="user-info-area">
                    Hello {this.state.currentUser.name}
                    <button className="logout btn" onClick={this.logoutHandler}>Logout</button>
                </div>
                <ChatContaier />
            </div>
        )
    }

    getUserName() {
        this.fetchUserInfo()
            .then(userInfo => {
                this.setState(() => ({ currentUser: userInfo, showLogin: false }));
            })
            .catch(err => {
                if (err.status === 401) { // incase we're getting 'unautorithed' as response
                    this.setState(() => ({ showLogin: true }));
                } else {
                    throw err; // in case we're getting an error
                }
            });
    }

    fetchUserInfo() {
        return fetch('/users', { method: 'GET', credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            });
    }

    logoutHandler() {
        fetch('/users/logout', { method: 'GET', credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    console.log(`failed to logout user ${this.state.currentUser.name} `, response);
                }
                this.setState(() => ({ currentUser: { name: '' }, showLogin: true }));
            })
    }
}