import React from 'react'

const TresholdSelector = ({handleTresholdChange, chartWidth, treshold, title}) => {

  return (
    <div style={{display: "flex", flexDirection: "row"}} className="intended">
      <label htmlFor="treshold-slider">{title}:</label>
      
      <div style={{display: "block", paddingLeft: "1em", paddingRight: "0.5em"}}>0 %</div>
      
      <input min="0" max="1" type="range" step="0.01" value={treshold}
             onChange={(event) => handleTresholdChange(event.target.value)}
             style={{width: chartWidth*0.1}} id="treshold-slider"></input>
      
      <div style={{display: "block", paddingLeft: "0.5em", paddingRight: "0.5em"}}>100 %,</div>
      
      <label htmlFor="treshold-slider">current: {Math.round(treshold*100)} %</label>
    </div>
  )
}

export default TresholdSelector