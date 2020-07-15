import React from 'react'
import { ComposedChart, XAxis, YAxis, CartesianGrid, Area, Bar, Cell, ReferenceLine } from 'recharts';
import '../stylesheets/studentbar.css'

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

const MultiChart = ({ chartWidth, chartHeight, data, commonData, axisNames, dataKeys, commonKeys, max, handleClick }) => {

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
    key: dataKeys["maxPts"],
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

        <Area type="monotone" dataKey={dataKeys.totalPoints} fill="#c3c3c3" stroke="#c3c3c3" />

        {mapping.map(bar => 
          <Bar className={"hoverable-bar"} key={bar.key} dataKey={bar.key} barSize={barWidth} fill={bar.color} stroke={bar.stroke} >{
            data !== undefined ?
              data.map((entry, index) => 
                <Cell key={`cell-${index}`} onClick={() => handleClick(entry, index)}/>) :
              ""}
          </Bar>
        )}

        <CartesianGrid stroke="#808e9625" vertical={false}/>

        <ReferenceLine y={commonData[commonKeys.average]}
                       stroke={averageColor}
                       label={<CustomLabel
                                title="Avg"
                                color={averageColor}
                                pos={"above"}
                                chartWidth={chartWidth}/>}
                       strokeDasharray="2 4" />

        <ReferenceLine y={commonData[commonKeys.expectedMedium]}
                       stroke={mediumExpectedColor}
                       label={<CustomLabel
                                title={"Mid"}
                                color={mediumExpectedColor}
                                pos={"above"}
                                chartWidth={chartWidth}/>}
                       strokeDasharray="3 3" />

        <ReferenceLine y={commonData[commonKeys.expectedMinimum]}
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