import React from "react";
import ReactDOM from "react-dom";
import GameListObject from "./gameListObject.jsx"

export default class GamesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gamesList: {}
        };

        this.fetchGamesList = this.fetchGamesList.bind(this);

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.fetchGamesList();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.fetchGameListTimeout) {
            (() => {
                clearTimeout(this.fetchGameListTimeout);
            })();
        }
    }

    fetchGamesList() {
        const interval = 200;
        return fetch("/games/allGames", { method: "GET", credentials: "include" })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }

                this.fetchGameListTimeout = setTimeout(this.fetchGamesList, interval);

                return response.json();
            })
            .then(gamesList => {
                this.setState(() => ({ gamesList: JSON.parse(gamesList) }));
            })
            .catch(err => {
                throw err;
            });
    }

    getGamesListItems() {
        return (
            Object.keys(this.state.gamesList).map(index => (
                <li key={index}>
                    <GameListObject
                        gameInfo={this.state.gamesList[index]}
                        host={this.props.host}
                        joinGameHandler={this.props.joinGameHandler}
                    />
                </li>
            ))
        );
    }

    render() {
        return (
            <div>
                <h3>Pick A Game:</h3>
                <ul>
                    {this.getGamesListItems()}
                </ul>
            </div>
        );
    }
}