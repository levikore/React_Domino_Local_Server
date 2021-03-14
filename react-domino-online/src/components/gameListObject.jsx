import React from "react";
import ReactDOM from "react-dom";

const ROWS = 7;
const COLUMNS = 14;
const DIMENSIONS = 3 + "vw";

export default class GameListObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errMessage: ""
    }

    this.handleJoinClick = this.handleJoinClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }

  handleJoinClick() {
    this.addUserToGame();
  }

  handleDeleteClick() {
    this.deleteGame();
  }

  addUserToGame() {
    const gameId = this.props.gameInfo.id;
    const body = {
      gameId: gameId,
      userName: this.props.host.name,
    }

    return fetch('/games/addUserToGame', { method: 'POST', body: JSON.stringify(body), credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          if (response.status === 403) {
            this.setState(() => ({
              errMessage: "Unable to sign player to game"
            }));
          }
        }
        else {
          this.props.joinGameHandler(this.props.gameInfo);
        }
      });
  }

  deleteGame() {
    const gameId = this.props.gameInfo.id;
    return fetch('/games/deleteGame', { method: 'POST', body: gameId, credentials: 'include' })
      .then(response => {
        if (!response.ok) {
          this.setState(() => ({
            errMessage: "Unable to delete game"
          }));
        }
      })
  }

  showDeleteButton() {
    return ((this.props.host.name === this.props.gameInfo.host.name) && (this.props.gameInfo.singedInPlayersIdsArray.length === 0)) ?
      <button onClick={this.handleDeleteClick}>Delete</button> :
      null;
  }

  showJoinButton() {
    return this.props.gameInfo.isGameStart || this.props.gameInfo.isGameOver ?//this.props.gameInfo.singedInPlayersIdsArray.length < this.props.gameInfo.numberOfPlayers ?
      null :
      <button onClick={this.handleJoinClick}>Join</button>;
  }

  render() {
    const gameName = this.props.gameInfo.gameName;
    const creatorName = this.props.gameInfo.host.name;
    const numberOfPlayers = this.props.gameInfo.numberOfPlayers;
    const numberOfSignedInPlayers = this.props.gameInfo.singedInPlayersIdsArray.length;
    const isGameStart = this.props.gameInfo.isGameStart;
    const isGameOver = this.props.gameInfo.isGameOver;

    return (
      <div>
        <p>Game Name: {gameName}</p>
        <p>Creator: {creatorName}</p>
        <p>Number of Players: {numberOfPlayers}</p>
        <p>SignedIn: {numberOfSignedInPlayers}</p>
        <p>{isGameStart || isGameOver ? "Game In Progress" : "Waiting For Players"}</p>
        <div>
          {this.showJoinButton()}
          {this.showDeleteButton()}
        </div>
      </div>
    )
  }
}