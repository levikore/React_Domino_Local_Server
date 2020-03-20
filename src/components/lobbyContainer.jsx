import React from 'react';
import ReactDOM from 'react-dom';
import UsersList from './usersList.jsx'
import GamesList from './gamesList.jsx'
import GameCreationContainer from './gameCreationContainer.jsx'

export default class LobbyContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="lobbyContainer">
                <div className="lobbyLists">
                    <div className="usersList">
                        <UsersList />
                    </div>
                    <div className="gameList">
                        <GamesList
                            host={this.props.currentUser}
                            joinGameHandler={this.props.joinGameHandler}
                        />
                    </div>
                </div>
                <div>
                    <GameCreationContainer
                        host={this.props.currentUser}
                        createNewGameErrorHandler={this.props.createNewGameErrorHandler} />
                </div>
            </div>

        );
    }
}
