import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Brush, Tooltip } from 'recharts';
import DropdownMenu from './DropdownMenu'
import CheckBoxMenu from './CheckBoxMenu'
import StudentSelector from './StudentSelector'
import dataService from '../services/progressData'

const Controls = (props) => {
  const {handleClick, modes, selectedMode, showableLines,
         handleToggleRefLineVisibilityClick, showAvg, showExpected} = props
  return (
    <div className="fit-row">
      <CheckBoxMenu options={showableLines}
                    handleClick={handleToggleRefLineVisibilityClick}
                    showAvg={showAvg}
                    showExpected={showExpected}/>
      <DropdownMenu handleClick={handleClick}
                    options={modes}
                    selectedOption={selectedMode}
                    title={'Visualization mode:'}/>
      <button id={"showGradesButton"} onClick={() => console.log("TODO: Show grades")}>Show grades</button>
    </div>
  )
}

const ProgressTab = () => {

  const [ studentIds, setStudentIds ] = useState([])
  const [ weeklyPoints, setWeeklyPoints ] = useState([])
  const [ cumulativeWeeklyPoints, setCumulativeWeeklyPoints ] = useState([])

  const [ modes, setModes ] = useState([])
  const [ displayedModes, setdisplayedModes ] = useState([])
  const [ selectedMode, setSelectedMode ] = useState("")

  const [ showableLines, setShowableLines ] = useState([])
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const [ displayedStudents, setDisplayedStudents ] = useState([])

  const axisNames = ['Week', 'Points']
  const syncKey = 'syncKey'
  const avgDataKey = 'weeklyAvgs'
  const dataKey = 'name'
  const chartWidth = document.documentElement.clientWidth*0.9
  const chartHeight = 320
  const selectorHeight = 40
  const avgStrokeWidth = 1
  const studentStrokeWidth = 2

  useEffect(
    () => {
      const ids = dataService.getStudentIds()
      const [weeklyPoints, cumulativePoints] = dataService.getWeeklyProgressPoints(avgDataKey)
      
      setStudentIds(ids)
      setWeeklyPoints(weeklyPoints)
      setCumulativeWeeklyPoints(cumulativePoints)

      setModes(["points", "exercises", "commits"])
      setSelectedMode("points")
      setdisplayedModes(["exercises", "commits"])
      setShowableLines(["Average", "Expected"])

      setDisplayedStudents(ids)
    }, []
  )

  // Toggle selection of a student that is clicked in the student list:
  const handleListClick = (id) => {
    const targetNode = document.querySelector(`#li-${id}`)
    if (targetNode.style.color === "grey") {
      setDisplayedStudents(displayedStudents.concat(id))
      targetNode.style.color = "black"
    }
    else {
      handleStudentLineClick(id)
    }
  }

  // Hide student that was clicked from the chart:
  const handleStudentLineClick = (key) => {
    setDisplayedStudents(displayedStudents.filter(student => student !== key))
    document.querySelector(`#li-${key}`).style.color = "grey"
  }

  const handleModeClick = (newMode) => {
    setSelectedMode(newMode)
    setdisplayedModes(modes.filter(name => name !== newMode))
  }

  const handleToggleRefLineVisibilityClick = (targetLine) => {
    if (targetLine === "Expected") { setShowExpected(!showExpected) }
    else {
      // Toggle average lines visibility:
      const lines = document.querySelectorAll("g.recharts-layer.recharts-line>path.recharts-curve.recharts-line-curve")
      lines.forEach(node => {
        if (node.outerHTML.includes(`stroke-width="${avgStrokeWidth}"`)) {
          node.style.display = showAvg ? "none" : ""
        }
      })
      setShowAvg(!showAvg)
    }
  }

  return (
    <>
      <StudentSelector students={studentIds} handleClick={handleListClick} />

      <div className="fit-row">
        <h2>{'Weekly Points'}</h2>
        <Controls handleClick={handleModeClick}
                  modes={displayedModes} selectedMode={selectedMode}
                  showableLines={showableLines}
                  handleToggleRefLineVisibilityClick={handleToggleRefLineVisibilityClick}
                  showAvg={showAvg} showExpected={showExpected}>
        </Controls>
      </div>

      <LineChart className="intendedChart"
                 width={chartWidth} height={chartHeight}
                 data={weeklyPoints} syncId={syncKey}
                 margin={{ top: 10, right: 15, left: 25, bottom: 25 }}>
        
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} label={{ value: axisNames[0], position: 'bottom' }} />
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>
        
        <Line id={avgDataKey} type="linear" dataKey={avgDataKey} dot={false}
              stroke="#b1b1b1" strokeWidth={avgStrokeWidth}/>
        {displayedStudents.map(key => 
          <Line key={key}
                onClick={() => handleStudentLineClick(key)}
                className="hoverable" 
                type="linear"
                dataKey={key}
                stroke="#8884d8"
                strokeWidth={studentStrokeWidth}>
          </Line>
        )}
        
        <Tooltip></Tooltip>
      </LineChart>

      <h2>{'Cumulative Weekly Points'}</h2>
      
      <LineChart className="intendedChart"
                 width={chartWidth} height={chartHeight+selectorHeight}
                 data={cumulativeWeeklyPoints} syncId={syncKey}
                 margin={{ top: 10, right: 15, left: 25, bottom: selectorHeight }}>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} label={{ value: axisNames[0], position: 'bottom' }} />
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>
        
        <Line type="linear" dataKey={avgDataKey} dot={false}
              stroke="#b1b1b1" strokeWidth={avgStrokeWidth}/>
        {displayedStudents.map(key =>
          <Line key={key}
                onClick={() => handleStudentLineClick(key)}
                className="hoverable"
                type="linear"
                dataKey={key}
                stroke="#8884d8"
                strokeWidth={studentStrokeWidth}>
          </Line>
        )}
        
        <Tooltip></Tooltip>
        
        <Brush y={chartHeight-5} tickFormatter={(tick) => tick + 1}></Brush>
      </LineChart>
    </>
  )
}

export default ProgressTab
