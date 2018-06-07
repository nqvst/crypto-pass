import React, { Component } from 'react';

export default class Form {
    constructor(props) {
        super(props);
        this.state = {
            inp: '',
        }
    }

    handleInput = (e) => {
        console.log(e);
        this.setState({
            inp: e.target.value
        });
    }

    render() {

        return (
            <div className="form">
                <form>
                    <input autoFocus type="text" onInput={this.handleInput}/>
                </form>

                <div>{this.state.inp}</div>
            </div>
        );
    }
}