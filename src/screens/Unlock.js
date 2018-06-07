import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { unlock } from '../redux/actions';
class Unlock extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pw: '',
        }
    }

    handleInput = (e) => {
        this.setState({
            pw: e.target.value
        });
    }

    submitHandler = (e) => {
        e.preventDefault();
        console.log('submit?');

        this.props.unlock(this.state.pw);
    }

    render() {
        return (
            <div className="App">
                <form onSubmit={this.submitHandler}>
                    <input
                        autoFocus
                        type="password"
                        onInput={this.handleInput}
                        placeholder="Enter password"
                    />
                </form>

                <div>{this.state.inp}</div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) =>
    bindActionCreators({ unlock }, dispatch);


export default connect(state => state, mapDispatchToProps)(Unlock);