import React from "react";
import ReactDOM from "react-dom";

export default class UsersList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            usersList: {}
        };

        this.fetchUserList = this.fetchUserList.bind(this);

        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.fetchUserList();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.fetchUserListTimeout) {
            (() => {
                clearTimeout(this.fetchUserListTimeout);
            })();
        }
    }

    fetchUserList() {
        const interval = 200;
        return fetch('/users/allUsers', { method: 'GET', credentials: 'include' })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }

                this.fetchUserListTimeout = setTimeout(this.fetchUserList, interval);
                return response.json();
            })
            .then(usersList => {
                this.setState(() => ({ usersList }));
            })
            .catch(err => { throw err });
    }

    getUsersListItems() {
        return (
            Object.keys(this.state.usersList).map(index => (
                <li key={index}>{this.state.usersList[index]}</li>
            ))
        );
    }

    render() {
        return (
            <div>
                <h3>Connected Players:</h3>
                <ul>
                    {this.getUsersListItems()}
                </ul>
            </div>
        );
    }
}