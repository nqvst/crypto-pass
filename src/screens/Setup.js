import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { completeSetup } from '../redux/actions';
import classnames from 'classnames';

import { setupNewSecretKey, sha256 } from '../core/crypto';

const MIN_ENTROPY_VALUE = 400;

function Seed({ seedString }) {
    return (
        <div className="Seed">
            <p >{seedString}</p>
        </div>
    );
}

class Setup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pw1: '',
            pw2: '',
            matching: false,
            mouseInput: [],
            seed: '',
            recoveryMode: false,
        }
    }

    handleInput1 = (e) => {
        console.log(e);
        this.setState({
            pw1: e.target.value
        });
    }

    handleInput2 = (e) => {
        console.log(e);
        this.setState({
            pw2: e.target.value
        });
    }

    checkMatch = () => {
        const { pw1, pw2 } = this.state;
        const matching = pw1.toString() === pw2.toString() && pw1.length > 0;
        console.log('pw1', pw1, 'pw2', pw2, matching);

        this.setState({ matching });
    }

    createInputHandler = (identifier) => {
        return (e) => {
            console.log(e);
            this.setState({
                [identifier]: e.target.value
            });
            setTimeout(this.checkMatch, 100);
        }
    }

    mouseMoveHandler = ({ clientX, clientY, screenX, screenY }) => {
        const productOfPositions = clientX * clientY * screenX * screenY;
        const finalValue = Date.now() % productOfPositions;
        console.log(clientX * clientY * screenX * screenY, productOfPositions, finalValue);
        this.setState({
            mouseInput: [...this.state.mouseInput, finalValue],
        });
    }

    setupHandler = (e) => {
        const { pw1, pw2, mouseInput } = this.state;
        e.preventDefault();
        console.log(e);

        const seed = setupNewSecretKey({
            password: pw1,
            entropy: sha256(mouseInput.join())
        });

        this.setState({ seed });
        window.removeEventListener('mousemove', this.mouseMoveHandler);

    }

    doneHandler = (e) => {
        const { done } = this.props;
        e.preventDefault()
        done(this.state.seed);
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.mouseMoveHandler);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.mouseMoveHandler);
    }

    renderForm(matching) {
        return (
            <form className={classnames({ validInput: matching })}>
                <div>
                    <input
                        autoFocus
                        type="password"
                        onInput={this.createInputHandler('pw1')}
                        placeholder="Choose a password..."
                    />
                </div>
                <div>
                    <input
                        type="password"
                        onInput={this.createInputHandler('pw2')}
                        placeholder="Confirm a password..."
                    />
                </div>
            </form>
        );
    }

    renderButton(hasSeed) {
        return (
            hasSeed ?
                <button className="primary" onClick={this.doneHandler}>
                    Done
                </button>
                :
                <button className="success" onClick={this.setupHandler}>
                    Setup secret key
                </button>
        );
    }

    renderRecoveryBox() {
        return(
            <textarea cols="31" rows="4"  ref="recoveryText"/>
        );
    }

    checkboxHandler = (e) => {
        if (e.target.checked) {
            window.removeEventListener('mousemove', this.mouseMoveHandler);
        } else {
            window.addEventListener('mousemove', this.mouseMoveHandler);
        }

        this.setState({recoveryMode: e.target.checked });
    }

    render() {
        const {
            pw1, pw2,
            matching,
            seed,
            mouseInput,
            recoveryMode,
        } = this.state;

        const entropyProgress = Math.min(mouseInput.length / MIN_ENTROPY_VALUE, 1) * 100;

        return (
            <div className="Setup">
                <div>
                    <input type="checkbox" value="apa" onChange={this.checkboxHandler}/> recover
                </div>
                { !seed && this.renderForm(matching) }
                { !seed && recoveryMode && this.renderRecoveryBox() }
                { !seed && !recoveryMode &&
                    <div className="progress">
                        <div className={classnames('innerProgress', {success: (entropyProgress >= 100), info: (entropyProgress < 100) })} style={{ width: `${entropyProgress}%`, textAlign: 'center' }}>
                            {(entropyProgress >= 100) ? <span style={{ color: '#FFF' }}>Done</span> : <span style={{ color: '#FFF', overflow:'hidden' }}>{sha256(mouseInput.join())}</span> }
                        </div>
                    </div>
                }

                { seed && <Seed seedString={seed} /> }

                <div>
                    { this.renderButton(!!seed) }
                </div>

            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        done: completeSetup,
    }, dispatch);
};

export default connect(state => state, mapDispatchToProps)(Setup);
