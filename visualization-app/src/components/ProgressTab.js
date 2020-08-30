import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Brush } from 'recharts';
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

const ExpectedLabel = ({index, x, y, strokeColor, grade, expectedIndex}) => {
  if (index % 2 === 1) {
    return (
      <text x={x+4} y={y} dy={4} fill={strokeColor} fontSize={12} textAnchor="start">{grade}</text>
    )
  }
  return (<></>)
}

const ProgressTab = () => {

  const [ studentIds, setStudentIds ] = useState([])
  const [ weeklyPoints, setWeeklyPoints ] = useState([])
  const [ cumulativePoints, setCumulativePoints ] = useState([{name: "init"}])
  const [ weeklyExercises, setWeeklyExercises ] = useState([])
  const [ cumulativeExercises, setCumulativeExercises ] = useState([{name: "init"}])
  const [ weeklyCommits, setWeeklyCommits ] = useState([])
  const [ cumulativeCommits, setCumulativeCommits ] = useState([{name: "init"}])
  const [ weeklySubmissions, setWeeklySubmissions ] = useState([])
  const [ cumulativeSubmissions, setCumulativeSubmissions ] = useState([{name: "init"}])

  const modes = ["points", "exercises", "commits", "submissions"]
  const [ selectedMode, setSelectedMode ] = useState(modes[0])
  const [ displayedModes, setdisplayedModes ] = useState(modes.filter(mode => mode !== selectedMode))

  const showableLines = ["Average", "Expected"]
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const [ displayedStudents, setDisplayedStudents ] = useState([])
  const [ displayedData, setDisplayedData ] = useState([])
  const [ displayedCumulativeData, setDisplayedCumulativeData ] = useState([{name: "init"}])

  const axisNames = ['Week', 'Points']
  const syncKey = 'syncKey'
  const avgDataKey = 'weeklyAvgs'
  const dataKey = 'name'
  const chartWidth = document.documentElement.clientWidth * 0.9
  const chartHeight = document.documentElement.clientHeight * 0.5
  const selectorHeight = 40
  const avgStrokeWidth = 3
  const studentStrokeWidth = 2
  const studentStrokeColor = '#8884d861'
  const expectedStrokeColor = '#46ddae82'
  const avgStrokeColor = '#b1b1b1'

  const grades = ["0", "1", "2", "3", "4", "5"]

  useEffect(
    () => {
      dataService
      .getData()
      .then(response => {
        const [ weeklyPts, cumulativePts, weeklyExers, cumulativeExers,
                weeklyComms, cumulativeComms, weeklySubs, cumulativeSubs ]
          = response

        setWeeklyPoints(weeklyPts)
        setCumulativePoints(cumulativePts)
        setWeeklyExercises(weeklyExers)
        setCumulativeExercises(cumulativeExers)

        const ids = dataService.getStudentIds(weeklyPts)
        setStudentIds(ids)
        setDisplayedStudents(ids)

        setDisplayedData(weeklyPts)
        setDisplayedCumulativeData(cumulativePts)

        setWeeklyCommits(weeklyComms)
        setCumulativeCommits(cumulativeComms)
        setWeeklySubmissions(weeklySubs)
        setCumulativeSubmissions(cumulativeSubs)
      })
    }, []
  )

  // Toggle selection of a student that is clicked in the student list:
  const handleListClick = (id) => {
    const targetNode = document.querySelector(`#li-${id}`)

    if (targetNode === null) {
      console.log(`Node with id: ${id} was null!`);
      return
    }

    if (targetNode.style.color === "grey") {
      setDisplayedStudents(displayedStudents.concat(targetNode.textContent))
      targetNode.style.color = "black"
    }
    else {
      handleStudentLineClick(id)
    }
  }

  // Hide student that was clicked from the chart:
  const handleStudentLineClick = (id) => {
    setDisplayedStudents(displayedStudents.filter(student => !student.includes(id.slice(0, 6))))
    document.querySelector(`#li-${id}`).style.color = "grey"
  }

  const handleModeClick = (newMode) => {
    if (selectedMode === newMode) { return }
    
    setSelectedMode(newMode)
    setdisplayedModes(modes.filter(name => name !== newMode))
    
    if (newMode === "points") {
      setDisplayedData(weeklyPoints)
      setDisplayedCumulativeData(cumulativePoints)
    }
    else if (newMode === "exercises") {
      setDisplayedData(weeklyExercises)
      setDisplayedCumulativeData(cumulativeExercises)
    }
    else if (newMode === "commits") {
      setDisplayedData(weeklyCommits)
      setDisplayedCumulativeData(cumulativeCommits)
    }
    else if (newMode === "submissions") {
      setDisplayedData(weeklySubmissions)
      setDisplayedCumulativeData(cumulativeSubmissions)
    }
    else {
      console.log("Selected unimplemented mode:", newMode);
    }
  }

  const handleToggleRefLineVisibilityClick = (targetLine) => {
    
    const lines = document.querySelectorAll("g.recharts-layer.recharts-line>path.recharts-curve.recharts-line-curve")
    
    // Toggle the visibility of drawn reference lines:
    if (targetLine === "Expected") {
      lines.forEach(node => {
        if (node.outerHTML.includes(`stroke="${expectedStrokeColor}"`)) {
          node.style.display = showExpected ? "none" : ""
        }
      })
      document.querySelectorAll(".recharts-layer .recharts-label-list")
        .forEach(node => node.style.display = showExpected ? "none" : "")
      setShowExpected(!showExpected)
    }
    else {
      lines.forEach(node => {
        if (node.outerHTML.includes(`stroke="${avgStrokeColor}"`)) {
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
        <h2>{`Weekly ${selectedMode}`}</h2>
        <Controls handleClick={handleModeClick}
                  modes={displayedModes} selectedMode={selectedMode}
                  showableLines={showableLines}
                  handleToggleRefLineVisibilityClick={handleToggleRefLineVisibilityClick}
                  showAvg={showAvg} showExpected={showExpected}>
        </Controls>
      </div>

      <LineChart className="intendedChart"
                 width={chartWidth} height={chartHeight}
                 data={displayedData} syncId={syncKey}
                 margin={{ top: 10, right: 15, left: 25, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} label={{ value: axisNames[0], position: 'bottom' }} />
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>
        
        {// Draw average point lines for each grade from history data:
        grades.map(index =>
          <Line key={`avg_${selectedMode}_grade_${index}`}
                type="linear" dot={false}
                label={<ExpectedLabel grade={index} strokeColor={"#78b5a2"} expectedIndex={12}/>}
                dataKey={`avg_${selectedMode}_grade_${index}`}
                stroke={expectedStrokeColor}
                strokeWidth={avgStrokeWidth}>
          </Line>
        )}

        {displayedStudents.map(student => 
          <Line key={student}
                onClick={() => handleStudentLineClick(student)}
                className="hoverable" 
                type="linear" dot={false}
                dataKey={student}
                stroke={studentStrokeColor}
                strokeWidth={studentStrokeWidth}>
          </Line>
        )}
        
        <Line id={avgDataKey} type="linear" dataKey={avgDataKey} dot={false}
              stroke={avgStrokeColor} strokeWidth={avgStrokeWidth}/>

      </LineChart>

      <h2>{`Cumulative weekly ${selectedMode}`}</h2>
      
      <LineChart className="intendedChart"
                 width={chartWidth} height={chartHeight+selectorHeight}
                 data={displayedCumulativeData} syncId={syncKey}
                 margin={{ top: 10, right: 15, left: 25, bottom: selectorHeight }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} label={{ value: axisNames[0], position: 'bottom' }} />
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>

        {// Draw average point lines for each grade from history data:
        grades.map(index =>
          <Line key={`avg_cum_${selectedMode}_grade_${index}`}
                label={<ExpectedLabel grade={index} strokeColor={"#78b5a2"} expectedIndex={15}/>}
                type="linear" dot={false}
                dataKey={`avg_cum_${selectedMode}_grade_${index}`}
                stroke={expectedStrokeColor}
                strokeWidth={avgStrokeWidth}>
          </Line>
        )}

        {// Draw student lines:
        displayedStudents.map(key =>
          <Line key={key}
                onClick={() => handleStudentLineClick(key)}
                className="hoverable"
                type="linear" dot={false}
                dataKey={key}
                stroke={studentStrokeColor}
                strokeWidth={studentStrokeWidth}>
          </Line>
        )}

        <Line type="linear" dataKey={avgDataKey} dot={false}
              stroke={avgStrokeColor} strokeWidth={avgStrokeWidth}/>
        
        <Brush y={chartHeight-5} tickFormatter={(tick) => tick + 1}></Brush>
      </LineChart>
    </>
  )
}

export default ProgressTab
