import React from 'react';
import ReactDOM from 'react-dom';

export default class GameCreationContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errMessage: "",
            gameNameValue: ""
        };

        this.handleCreateNewGame = this.handleCreateNewGame.bind(this);
    }

    renderErrorMessage() {
        if (this.state.errMessage) {
            return (
                <div className="createNewGame-error-message">
                    {this.state.errMessage}
                </div>
            );
        }
        return null;
    }

    handleCreateNewGame(e) {
        e.preventDefault();
        const gameName = e.target.elements.gameName.value;
        const numberOfPlayers = e.target.elements.numOfPlayers.value;
        this.setState({
            gameNameValue: ""
        });

        let gameInfoObject = new GameInfo(this.props.host, gameName, numberOfPlayers);

        fetch('/games/addGame', { method: 'POST', body: JSON.stringify(gameInfoObject), credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 403) {
                        this.setState(() => ({
                            errMessage: "Game already exists"
                        }));
                    }
                    this.props.createNewGameErrorHandler();
                }
            })
            .then(() => this.createNewGameSuccessHandler());
        return false;
    }

    createNewGameSuccessHandler() {
        this.setState(() => ({
            errMessage: ""
        }));
    }

    render() {
        return (
            <div className="newGame-page-wrapper">
                <form onSubmit={this.handleCreateNewGame}>
                    <label className="gameName-label" htmlFor="gameName"> Game Name: </label>
                    <input className="gameName-input" name="gameName" content={this.state.gameNameValue} />
                    <label className="numberOfPlayers-label" htmlFor="numberOfPlayers"> Number Of Players: </label>
                    <label>
                        <input
                            type="radio"
                            className="newGame-input"
                            name="numOfPlayers"
                            value="2"
                            id="r1"
                            defaultChecked
                        />
                        2
                    </label>
                    <label>
                        <input
                            type="radio"
                            className="newGame-input"
                            name="numOfPlayers"
                            value="3"
                            id="r2"
                        />
                        3
                    </label>
                    <input className="submit-btn btn" type="submit" value="Create" />
                </form>
                {this.renderErrorMessage()}
            </div>
        );
    }
}

class GameInfo {
    constructor(host, gameName, numberOfPlayers) {
        this.id = null;
        this.host = host;
        this.gameName = gameName;
        this.numberOfPlayers = numberOfPlayers;
        this.singedInPlayersIdsArray = [];
        this.isGameStart = false;
        this.isGameOver = false;
        this.winnerList = [];
        this.currentState = null;
    }
}




