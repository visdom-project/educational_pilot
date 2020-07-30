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

/** Chooses a fitting color code for given exercise and student.
 * 
 * For commit data:
 *   - white for exercises with 0 commits
 *   - lightblue for exercises with commits in it, shade by commit count.
 * 
 * For submission data:
 * 
 *   Green for passed exercises;
 *     - Light green for completing the task with at most 5 submissions,
 *     - darker green for exceeding 5 submissions.
 * 
 *   White or red for uncompleted exercises;
 *     - White if student has not submitted anything,
 *     - red if the exercise is uncompleted in spite of submitting answers.
 */
const selectColor = (data, index, key) => {
  if (key === "commit_counts") {
    return data.passed[index] ? 
            ( data.commit_counts[index] < 3 ? "lightblue" : 
              data.commit_counts[index] < 6 ? "#89cee4" : 
              data.commit_counts[index] < 9 ? "#509ab3" : 
              data.commit_counts[index] < 15 ? "#286482" : "#1e4a61" ) :
            ( data.commit_counts[index] < 1 ? "white" : "#e65a67" )
  }

  return data.passed[index] ? 
    ( data.submissions[index] > 5 ? "green" : "#62ce4b") :
    ( data.submissions[index] < 1 ? "white" : "#e65a67" )
}

const MultiChart = ({ chartWidth, chartHeight, data, commonData, axisNames, dataKeys, commonKeys, max, handleClick, visuMode, countData }) => {

  const tickCount = 10
  const ticks = Object.keys(new Array(tickCount).fill(0)).map(key => Math.floor(key * max/tickCount))
  ticks.push(max)

  const averageColor = "black"
  const mediumExpectedColor = "#000073"
  const minimumExpectedColor = "#000073"

  const barWidth = 10

  if (data === undefined || commonData === undefined) {
    console.log("Either student data or common student data is undefined. Data:", data, "common data:", commonData)
    return <div className="intended">No data to display.</div>
  }

  if (axisNames === undefined) {
    axisNames = ["x-axis", "y-axis"]
  }

  if (["submissions", "commits"].includes(visuMode)) {
    
    let submissionMapping = []
    let submissionTicks = []
    let key = (visuMode === "submissions") ? "submissions" : "commit_counts"
    const alphabets = "abcdefghijklmnopqrstuvwxyz"
    if (countData !== undefined && countData.length > 0) {
      let i = 0
      submissionMapping = countData[0][key].map(item => {
        i += 1
        submissionTicks.push(i)
        return {key: "exercise-".concat(i), stackId: alphabets[i-1]}
      })
    }

    return (
      <div className="intended" style={{display: "flex", flexDirection:"column"}}>
        <ComposedChart width={chartWidth} height={chartHeight} data={countData}
                       margin={{ top: 10, right: 20, left: 45, bottom: 25 }}
                       barGap={-barWidth}>
          
          <XAxis dataKey="id"
                 padding={{ left: 0, right: 0 }}
                 label={{ value: axisNames[0], position: 'bottom' }}/>
          <YAxis label={{ value: axisNames[1], position: 'left', offset: -21 }}
                 type="number"
                 domain={['dataMin', 'dataMax']}
                 ticks={submissionTicks}/>

          {submissionMapping.reverse().map(bar => 
            <Bar className={"hoverable-bar"} key={bar.key} dataKey={bar.key} stackId={bar.stackId} fill="#c1ff9e69" stroke="#00000045" >{
              countData !== undefined ?
              countData.map((entry, index) => {
                  const name = `cell-${bar.stackId}-${index}`
                  return <Cell key={name}
                               onClick={() => handleClick(entry, index)}
                               fill={selectColor(entry, alphabets.indexOf(bar.stackId), key)}>
                        </Cell>
                }) : ""}
            </Bar>
          )}
        </ComposedChart>

        <div style={{position: "absolute", paddingLeft:`${chartWidth * 0.06}px`, pointerEvents: "none"}}>
          <table style={{ fontSize: `${barWidth-2}px`,
                          textAlign: "center",
                          borderSpacing: "0px",
                          paddingTop: "1em",
                          color: "white",
                          fontWeight: "bold"
                        }}><tbody>{
            
            // Draws a table on top of visu bars to display submission counts

            submissionMapping.map(item => {
              const i = alphabets.indexOf(item.stackId)

              /** Math magic to calculate close enough spacing for table 
               * elements that show submission counts for each exercise: */
              const totalWidth = chartWidth * 0.9
              const barCount = countData.length
              const barsWidth = barCount * barWidth
              const totalWidthAfterBars = totalWidth - barsWidth
              const paddingWidth = Math.floor(totalWidthAfterBars / barCount)
              const leftovers = totalWidthAfterBars - barCount * paddingWidth
              const additionalPadding = Math.round(barCount / leftovers)
              const additionalLeftovers = Math.floor(leftovers - barCount / additionalPadding) -2

              const totalHeight = chartHeight * 0.85
              const cellHeight = totalHeight / submissionMapping.length

              // Create the table content:
              let counter = 1
              return <tr key={item.stackId}>
                {countData.map(student => {
                  
                  // Divide spacing evenly between table columns:
                  let pad = paddingWidth
                  pad = (counter % additionalPadding === 0) ? pad+1 : pad
                  pad = (counter % additionalLeftovers === 0) ? pad+1 : pad
                  counter += 1

                  const style = {
                    width: `${barWidth}px`,
                    paddingLeft: `${pad}px`,
                    paddingRight: "0px",
                    height: `${cellHeight}px`
                  }
                  
                  // Make the font size smaller if a submission count has more than 1 digit:
                  if (student[key[i]] > 9) {
                    style.fontSize = `${barWidth-2}px`
                  }

                  return <td style={style} key={student.id}>{student[key][i]}</td>
                })}
              </tr>
            })}
          </tbody></table>
        </div>

      </div>
    )
  }

  const mapping = [{
    key: dataKeys["max"],
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
               padding={{ left: 0, right: 0 }}
               label={{ value: axisNames[0], position: 'bottom' }}/>
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -21 }}
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
