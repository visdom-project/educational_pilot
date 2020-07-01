import React from 'react'

const CheckBoxMenu = ({options, handleClick, showAvg, showExpected}) => {
  const labelStyle = {paddingRight: "10px"}
  return (
    <div className="fit-row"
         style={{border: "1px #c7c7c7b5 solid",
                 borderRadius: "0.25em",
                 padding: "0.25em 0.5em"}}>
      
      <label style={labelStyle} >Show: </label>
      
      <div>
        {options.map(option => {
          return (
            <div key={option}>
              <input onClick={() => handleClick(option)}
                     type="checkbox"
                     id={option}
                     defaultChecked={(option === 'Average') ? showAvg : showExpected}>
              </input>
              <label htmlFor={option} style={labelStyle} >{option}</label>
              <br></br>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default CheckBoxMenu
