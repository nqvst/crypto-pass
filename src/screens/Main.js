import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';
import { getPassword } from '../core/crypto';
import { lock, addDomain, getDomains, useDomain } from '../redux/actions';
const { clipboard } = window.require('electron');

const TAB_KEY_CODE = 9;
const ARROW_RIGHT_KEY_CODE = 39;
const ARROW_UP_KEY_CODE = 38;
const ARROW_DOWN_KEY_CODE = 40;

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
        .sort((a, b) => b.lastUsed - a.lastUsed);

        console.log(suggestions);

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
        this.props.addDomain(this.state.domain);
        this.props.useDomain(domain);
        this.refs.inp.value = ''
        this.setState({
            domain: '',
            suggestions: [],
            currentSuggestion: 0,
        });

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
        console.log('keyPressed:', e.keyCode);
        if (e.keyCode === ARROW_UP_KEY_CODE || e.keyCode === ARROW_DOWN_KEY_CODE) {
            e.preventDefault();
            this.setState({
                currentSuggestion: this.state.currentSuggestion + (e.keyCode === ARROW_UP_KEY_CODE ? -1 : 1)
            });
        }

        if (e.keyCode === TAB_KEY_CODE || e.keyCode === ARROW_RIGHT_KEY_CODE) {
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

    renderSecondarySuggestion(suggestions, above) {
        return (
            <div className={classnames('secondarySuggestion', { suggestionsAbove: above })}>
            <ul>
            {
                suggestions.map((s, i) => {
                    return (i !== 0 && <li key={`suggestion-${i}`}>{s.domain}</li>);
                })
            }
            </ul>
            <div className="overlay"></div>
        </div>
        );

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
        const suggestion = this.getSuggestion(currentSuggestion, suggestions);

        return (
            <div className="App">
                <form onSubmit={this.submitHandler} style={{ position: 'relative' }}>
                    <div className="suggestion">
                        {suggestion && suggestion.domain}
                    </div>

                    { suggestions && suggestions.length > 0 &&
                        this.renderSecondarySuggestion(
                            suggestions.slice(currentSuggestion % suggestions.length))
                    }

                    <input
                        autoFocus
                        type="text"
                        placeholder="Enter domain..."
                        onInput={this.handleInput}
                        onKeyDown={this.cycleSuggestions}
                        ref="inp"
                    />
                </form>
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

