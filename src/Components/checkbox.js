import React from 'react'

export default function Checkbox(props) {
  return (
    <div>
        <input type="checkbox" value={props.value} onChange={(e) => props.handleClick(e.target.value, e.target.checked)} checked={props.isChecked}/>
        <label>{props.name}</label>
    </div>
  );
}
