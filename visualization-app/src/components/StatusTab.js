import React, { useState, useEffect } from 'react'
import dataService from '../services/statusData'
import MultiChart from './StatusChart'
import DropdownMenu from './DropdownMenu'
import CheckBoxMenu from './CheckBoxMenu'

const Controls = (props) => {
  const {handleModeClick, modes, selectedMode, showableLines,
          handleToggleRefLineVisibilityClick, showAvg, showExpected,
          handleWeekClick, weeks, selectedWeek} = props
  return (
    <div className="fit-row">
      <CheckBoxMenu options={showableLines}
                    handleClick={handleToggleRefLineVisibilityClick}
                    showAvg={showAvg}
                    showExpected={showExpected}/>
      <DropdownMenu handleClick={handleModeClick}
                    options={modes}
                    selectedOption={selectedMode}
                    title={'Visualization mode:'}/>
      <DropdownMenu handleClick={handleWeekClick}
                    options={weeks}
                    selectedOption={selectedWeek}
                    title={'Visualize week:'}/>
      <button id={"showGradesButton"} onClick={() => console.log("TODO: Show grades")}>Show grades</button>
    </div>
  )
}

const StudentDetailView = ({student}) => {
  
  if (student === "") {
    return (
      <div style={{marginBottom: document.documentElement.clientHeight*0.1}}>
        <h2>{'Student Details'}</h2>
        <div className="intended">Click a student to view details.</div>
      </div>
    )
  }

  return (
    <div style={{marginBottom: document.documentElement.clientHeight*0.1}}>
      <h2>{'Student Details'}</h2>
      <div className="intended">Student: {student}</div>
    </div>
  )
}

const StatusTab = () => {

  const [ progressData, setProgressData ] = useState([])
  const [ commonData, setCommonData ]  = useState([])
  const [ commonDataToDisplay, setcommonDataToDisplay ] = useState({})
  const [ max, setMax ] = useState(0)

  const [ weeks, setWeeks ] = useState(["1"])
  const [ selectedWeek, setSelectedWeek ] = useState("1")
  const [ weekData, setWeekData ] = useState([])

  const [ modes, setModes ] = useState([])
  const [ displayedModes, setdisplayedModes ] = useState([])
  const [ selectedMode, setSelectedMode ] = useState("")

  const [ showableLines, setShowableLines ] = useState([])
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const [ selectedStudent, setSelectedStudent ] = useState("")

  const axisNames = ['Students', 'Points']
  const dataKeys = {
    studentId: "id",
    maxPoints: "maxPts",
    week: "week",
    totalPoints: "totPts",
    missed: "missed",
    average: 'avg',
    expectedMinimum: 'min',
    expectedMedium: 'mid'
  }
  const chartWidth = document.documentElement.clientWidth*0.9
  const chartHeight = document.documentElement.clientHeight*0.5
  
  useEffect(
    () => {
      dataService
        .getData()
        .then(response => {
          const [pData, commons] = dataService.formatProgressData(response)
          setCommonData(commons)

          const weeks = pData.map(week => week.week)
          const selected = weeks[weeks.length-1]
          const weekIndex = selected-1
          setWeeks(weeks)
          setSelectedWeek(selected)

          setcommonDataToDisplay({
            'avg': commons.cumulativeAvgs[weekIndex],
            'mid': commons.cumulativeMidExpected[weekIndex],
            'min': commons.cumulativeMinExpected[weekIndex]
          })

          if (pData[weekIndex] !== undefined) {
            setMax(pData[weekIndex]["data"][0].maxPts)
            setWeekData(pData[weekIndex]["data"])
          }

          setProgressData(pData)
        })

      setModes(["points", "exercises", "commits"])
      setSelectedMode("points")
      setdisplayedModes(["exercises", "commits"])
      
      setShowableLines(["Average", "Expected"])
    }, []
  )

  const handleStudentClick = (data, index) => {
    if (data !== undefined) {
      const newSelected = data.id
      setSelectedStudent(newSelected)
      console.log("Selected student:", newSelected);
    }
  }

  const handleModeSwitchClick = (newMode) => {
    setSelectedMode(newMode)
    setdisplayedModes(modes.filter(name => name !== newMode))
  }

  const handleWeekSwitch = (newWeek) => {
    setSelectedWeek(newWeek)

    if (progressData[newWeek-1] !== undefined) {
      setMax(progressData[newWeek-1]["data"][0].maxPts)
      setWeekData(progressData[newWeek-1]["data"])

      setcommonDataToDisplay({
        'avg': commonData.cumulativeAvgs[newWeek-1],
        'mid': commonData.cumulativeMidExpected[newWeek-1],
        'min': commonData.cumulativeMinExpected[newWeek-1]
      })
    }
  }

  const handleToggleRefLineVisibilityClick = (targetLine) => {
    
    // Find reference lines:
    const lines = document.querySelectorAll("g.recharts-layer.recharts-reference-line")
    
    // Toggle line visibility:
    lines.forEach(node => {
    
      const textContent = node.firstChild.nextSibling.textContent

      if (targetLine === "Expected" && !textContent.includes("Av")) {
        setShowExpected(!showExpected)
        node.style.display = showExpected ? "none" : ""
      }
      else if (targetLine === "Average" && textContent.includes("Av")) {
        setShowAvg(!showAvg)
        node.style.display = showAvg ? "none" : ""
      }
    })
  }

  return (
    <>
      <div className="fit-row">
        <h2>{'Current Student Statuses'}</h2>
        <Controls handleModeClick={handleModeSwitchClick}
                  modes={displayedModes} selectedMode={selectedMode}
                  showableLines={showableLines}
                  handleToggleRefLineVisibilityClick={handleToggleRefLineVisibilityClick}
                  showAvg={showAvg} showExpected={showExpected}
                  handleWeekClick={handleWeekSwitch} weeks={weeks} selectedWeek={selectedWeek} >
        </Controls>
      </div>

      <MultiChart chartWidth={chartWidth} chartHeight={chartHeight}
                  data={weekData} commonData={commonDataToDisplay} dataKeys={dataKeys}
                  axisNames={axisNames} max={max}
                  handleClick={handleStudentClick}>
      </MultiChart>

      <StudentDetailView student={selectedStudent}></StudentDetailView>
    </>
  )
}
  
export default StatusTab
