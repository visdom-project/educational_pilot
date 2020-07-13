import React from 'react'
import { ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Area, Bar, Cell, ReferenceLine } from 'recharts';

const CustomTooltip = (props) => {

  if (props.active) {

    const tooltipState = { weekPts: -99, weekTot: -99, cumulativePts: -99, maxPts: -99 }

    props.data.forEach(element => {
      if (element.id===props.label) {
        tooltipState.weekPts = element.tooltipWeek
        tooltipState.weekTot = element.tooltipWeekTot
        tooltipState.cumulativePts = element.tooltipCPts
        tooltipState.maxPts = element.tooltipCPtsTot
      }
    })

    return (
      <div style={{background: "white", padding: "10px", border: "1px solid darkgrey", borderRadius: "5px"}}>
        <strong>Id: {props.label}</strong>
        <br></br>
        Week: {tooltipState.weekPts}/{tooltipState.weekTot} pts
        <br></br>
        Total: {tooltipState.cumulativePts}/{tooltipState.maxPts} pts
      </div>
    )
  }
  return <></>
}

const CustomLabel = (props) => {
  return (
    <text style={{textAnchor: "end"}}
          x={props.viewBox.x + props.chartWidth - 105}
          y={props.viewBox.y}
          fill={props.color}
          dy={"0.4em"}
          fontSize={12}
          textAnchor="left">
      {props.title}
    </text>
  )
}

const MultiChart = ({ chartWidth, chartHeight, data, commonData, axisNames, dataKeys, max, handleClick }) => {

  const tickCount = 10
  const ticks = Object.keys(new Array(tickCount).fill(0)).map(key => Math.floor(key * max/tickCount))
  ticks.push(max)

  const averageColor = "black"
  const mediumExpectedColor = "#000073"
  const minimumExpectedColor = "#000073"

  const barWidth = 10

  if (data === undefined || commonData === undefined) {
    console.log("Either student data or common student data is undefined.")
    console.log("data:", data)
    console.log("commond data:", commonData)
    return (
      <div className="intended">No data to display.</div>
    )
  }

  const mapping = [{
    key: dataKeys["maxPoints"],
    color: "white",
    stroke: "darkgrey"
  },
  {
    key: dataKeys["week"],
    color: "#4cce4c",
    stroke: "#4cce4c"
  },
  {
    key: dataKeys["totalPoints"],
    color: "green",
    stroke: "green"
  },
  {
    key: dataKeys["missed"],
    color: "red",
    stroke: "red"
  }]

  return (
    <div className="intended">
      <ComposedChart width={chartWidth} height={chartHeight} data={data}
                     margin={{ top: 10, right: 20, left: 45, bottom: 25 }}
                     barGap={-barWidth}>
        
        <XAxis dataKey="id"
               padding={{left: 0, right: 0}}
               label={{ value: axisNames[0], position: 'bottom' }}/>
        <YAxis label={{ value: axisNames[1], position: 'left', offset: 0 }}
               type="number"
               domain={['dataMin', 'dataMax']}
               ticks={ticks}/>
        
        <Tooltip content={<CustomTooltip data={data}/>} />

        <CartesianGrid stroke="#f5f5f5" />

        <Area type="monotone" dataKey="totPts" fill="#c3c3c3" stroke="#c3c3c3" />

        {mapping.map(obj => 
          <Bar key={obj.key} dataKey={obj.key} barSize={barWidth} fill={obj.color} stroke={obj.stroke} >{
            data !== undefined ?
              data.map((entry, index) => 
                <Cell key={`cell-${index}`} onClick={() => handleClick(entry, index)}/>) :
              ""}
          </Bar>
        )}

        <ReferenceLine y={commonData[dataKeys["average"]]}
                       stroke={averageColor}
                       label={<CustomLabel
                                title="Avg"
                                color={averageColor}
                                pos={"above"}
                                chartWidth={chartWidth}/>}
                       strokeDasharray="2 4" />

        <ReferenceLine y={commonData[dataKeys["expectedMedium"]]}
                       stroke={mediumExpectedColor}
                       label={<CustomLabel
                                title={"Mid"}
                                color={mediumExpectedColor}
                                pos={"above"}
                                chartWidth={chartWidth}/>}
                       strokeDasharray="3 3" />

        <ReferenceLine y={commonData[dataKeys["expectedMinimum"]]}
                       stroke={minimumExpectedColor}
                       label={<CustomLabel
                                title={"Min"}
                                color={minimumExpectedColor}
                                pos={"below"}
                                chartWidth={chartWidth}/>}
                       strokeDasharray="3 3" />

      </ComposedChart>
    </div>
  )
}

export default MultiChart