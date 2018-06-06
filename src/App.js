import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { completeSetup } from './redux/actions';

import Main from './screens/Main';
import Setup from './screens/Setup';
import Unlock from './screens/Unlock';
import { privateKeyExists } from './core/config';

import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        if (privateKeyExists()) {
            props.completeSetup()
        }
    }

    render() {

        const { showSetup, locked, pass } = this.props;
        const ActiveScreen = (showSetup ? Setup : (locked || !pass ? Unlock : Main));
        console.log(this.props)

        return (
            <div className="App">
                <ActiveScreen/>
            </div>
        );
    }
}

const mapStateToProps = ({ app }) => ({
    showSetup: app.showSetup,
    locked: app.locked,
    pass: app.pass,
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators({ completeSetup }, dispatch);



export default connect(mapStateToProps, mapDispatchToProps)(App);
