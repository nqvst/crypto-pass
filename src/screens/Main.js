import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { lock, addDomain, getDomains, useDomain } from '../redux/actions';
import { getPassword } from '../core/crypto';
import { updateDomain } from '../core/config';

const { clipboard } = window.require('electron')

const TAB_KEY_CODE = 9;
const ARROW_RIGHT_KEY_COKDE = 39;

class Main extends Component {

    constructor(props) {
        super(props);
        props.getDomains();

        this.state = {
            domain: '',
            suggestions: [],
            currentSuggestion: 0,
        }
    }

    handleInput = (e) => {
        console.log(e);
        const { domains } = this.props;

        const hasTargetValue = e.target.value && e.target.value.length;
        const suggestions = hasTargetValue &&
            domains.filter(val => {
                return val &&
                    val.domain
                    .toLowerCase()
                    .startsWith(e.target.value.toLowerCase())
        })
        .sort((a, b) => a.domain.lastUsed > b.domain.lastUsed);

        this.setState({
            suggestions,
            currentSuggestion: 0,
            domain: e.target.value,
        });
    }

    submitHandler = (e) => {
        e.preventDefault();
        const { localPassword } = this.props;
        const { domain } = this.state;
        const passwordOut = getPassword(localPassword, domain);
        clipboard.writeText(passwordOut);
        this.props.useDomain(domain);
    }

    lockHandler = (e) => {
        this.props.lock();
    }

    saveHandler = (e) => {
        this.props.addDomain(this.state.domain);
    }

    getSelectedSuggestion = () => {
        const { suggestions, currentSuggestion } = this.state;
        return suggestions &&
            suggestions.length &&
            suggestions[currentSuggestion % suggestions.length];
    }

    cycleSuggestions = (e) => {
        if (e.keyCode === TAB_KEY_CODE) {
            e.preventDefault();
            this.setState({
                currentSuggestion: this.state.currentSuggestion + 1
            });
        }

        if (e.keyCode === ARROW_RIGHT_KEY_COKDE) {
            e.preventDefault();
            if (this.state.suggestions) {
                console.log(e)
                this.refs.inp.value = this.getSelectedSuggestion().domain;
                this.setState({
                    domain: this.refs.inp.value,
                });
            }
        }
    }

    resetCurrentSuggestion = () => {
        this.setState({ currentSuggestion: 0 });
    }

    getSuggestion = (currentSuggestion, suggestions) => {
        if (suggestions.length) {
            return suggestions[currentSuggestion % suggestions.length]
        }
    }

    render() {
        const { currentSuggestion, suggestions } = this.state;
        const sugg = this.getSuggestion(currentSuggestion, suggestions);

        return (
            <div className="App">
                <form onSubmit={this.submitHandler} style={{ position: 'relative' }}>
                    <div className="suggestion">
                        {sugg && sugg.domain}
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Enter domain..."
                        onInput={this.handleInput}
                        onKeyDown={this.cycleSuggestions}
                        ref="inp"
                    />
                </form>

                <button onClick={this.saveHandler}>bookmark</button>
                <button onClick={this.lockHandler}>lock</button>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) =>
    bindActionCreators({
        lock,
        addDomain,
        getDomains,
        useDomain,
    }, dispatch);

const mapStateToProps = (state) => {
    return {
        localPassword: state.app.pass,
        domains: state.app.domains,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);

