import React from 'react'
import { ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Area, Bar, Line } from 'recharts';

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

  const newDy = (props.pos === "above") ? "-0.5em" : "1em"
  
  if (props.index === 0) {
    return (
      <text x={props.x} y={props.y}
            dy={newDy}
            fill={props.color}
            fontSize={10}
            textAnchor="right">
        {props.title}
      </text>
    )
  }
  return <></>
}

const MultiChart = ({ chartWidth, chartHeight, data, axisNames, dataKeys, max }) => {

  const tickCount = 10
  const ticks = Object.keys(new Array(tickCount).fill(0)).map(key => Math.floor(key * max/tickCount))
  ticks.push(max)

  const averageColor = "#ff7300"
  const mediumExpectedColor = "#000073"
  const minimumExpectedColor = "#000073"

  return (
    <div className="intended">
      <ComposedChart width={chartWidth} height={chartHeight} data={data}
                     margin={{ top: 10, right: 15, left: 25, bottom: 25 }}
                     barGap={-20}>
        
        <XAxis dataKey="id"
               padding={{left: 0, right: 0}}
               label={{ value: axisNames[0], position: 'bottom' }}/>
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}
               type="number"
               domain={['dataMin', 'dataMax']}
               ticks={ticks}/>
        
        <Tooltip content={<CustomTooltip data={data}/>} />

        <CartesianGrid stroke="#f5f5f5" />

        <Area type="monotone" dataKey="totPts" fill="#c3c3c3" stroke="#c3c3c3" />
        
        <Bar dataKey={dataKeys["maxPoints"]} barSize={20} fill="white" stroke="black"/>
        <Bar dataKey={dataKeys["week"]} barSize={20} fill="#4cce4c" />
        <Bar dataKey={dataKeys["totalPoints"]} barSize={20} fill="green" />
        <Bar dataKey={dataKeys["missed"]} barSize={20} fill="red" />

        <Line type="monotone"
              dataKey={dataKeys["average"]}
              stroke={averageColor}
              dot={false}
              label={<CustomLabel title={"Average"}
                                  color={averageColor}
                                  pos={"above"}/>}/>
        <Line type="monotone"
              dataKey={dataKeys["expectedMinimum"]}
              stroke={minimumExpectedColor}
              dot={false}
              label={<CustomLabel title={"Expected Minimum"}
                                  color={minimumExpectedColor}
                                  pos={"below"}/>}/>
        <Line type="monotone"
              dataKey={dataKeys["expectedMedium"]}
              stroke={mediumExpectedColor}
              dot={false}
              label={<CustomLabel title={"Expected Medium"}
                                  color={mediumExpectedColor}
                                  pos={"above"}/>}/>

      </ComposedChart>
    </div>
  )
}

export default MultiChart