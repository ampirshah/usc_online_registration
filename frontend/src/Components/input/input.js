import React from "react";

import "./input.css";

const Input = (props) =>{
    return(
        <div className="inputContainer">
            <label>{props.label}</label>
            <input value={props.value} onChange={(event)=> props.inputHandler(props.tag , event)} />
            {props.error && <span>{props.error}</span> }
        </div>
    )
}

export default Input;