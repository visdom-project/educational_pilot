import React, { useState, useEffect } from 'react'
import dataService from '../services/statusData'
import MultiChart from './StatusChart'
import DropdownMenu from './DropdownMenu'
import CheckBoxMenu from './CheckBoxMenu'
import StudentDetailView from './StudentDetailView'

const Controls = (props) => {
  const {handleModeClick, modes, selectedMode, showableLines,
          handleToggleRefLineVisibilityClick, showAvg, showExpected,
          handleWeekClick, weeks, selectedWeek} = props
  
  if (selectedMode === "submissions" || selectedMode === "commits") {
    return (
      <div className="fit-row">
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

const StatusTab = () => {

  const [ studentData, setStudentData ] = useState([])
  const [ progressData, setProgressData ] = useState([])
  const [ commonData, setCommonData ]  = useState([])
  const [ submissionData, setSubmissionData ] = useState([])
  const [ commitData, setCommitData ] = useState([])
  const [ commonDataToDisplay, setcommonDataToDisplay ] = useState({})
  const [ max, setMax ] = useState(1)

  const [ weeks, setWeeks ] = useState(["1"])
  const [ selectedWeek, setSelectedWeek ] = useState("1")
  const [ selectedWeekData, setSelectedWeekData ] = useState([])
  const [ selectedCountData, setSelectedCountData] = useState([])

  const modes = ["points", "exercises", "submissions", "commits"]
  const [ selectedMode, setSelectedMode ] = useState(modes[0])
  const [ displayedModes, setdisplayedModes ] = useState(modes.filter(mode => mode !== selectedMode))

  const [ treshold, setTreshold ] = useState(0.4)
  const [ studentsBelowTreshold, setStudentsBelowTreshold ] = useState(-99)

  const allKeys = {
    "points": {
      max: "maxPts",
      week: "week",
      totalPoints: "totPts",
      missed: "missed",

      cumulativeAvgs: 'cumulativeAvgs',
      cumulativeMidExpected: 'cumulativeMidExpected',
      cumulativeMinExpected: 'cumulativeMinExpected'
    },
    "exercises": {
      max: "maxExer",
      week: "weekExer",
      totalPoints: "totExer",
      missed: "missedExer",
      
      cumulativeAvgs: 'cumulativeAvgsExercises',
      cumulativeMidExpected: 'cumulativeMidExpectedExercises',
      cumulativeMinExpected: 'cumulativeMinExpectedExercises'
    },
    "submissions": {},
    "commits": {}
  }
  const [ dataKeys, setDataKeys ] = useState(allKeys[selectedMode])
  const commonKeys = { average: 'avg', expectedMinimum: 'min', expectedMedium: 'mid' }

  const axisNames = {
    "points": ['Students', 'Points'],
    "exercises": ['Students', 'Exercises'],
    "commits": ['Students', 'Commits'],
    "submissions": ['Students', 'Exercises']
  }

  const showableLines = ["Average", "Expected"]
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const [ selectedStudent, setSelectedStudent ] = useState("")
  
  const chartWidth = 1600
  const chartHeight = document.documentElement.clientHeight*0.7

  useEffect(
    () => {
      dataService
        .getData()
        .then(response => {
          const [pData, commons, submissions] = response

          // Fetch needed data:
          setProgressData(pData)
          setCommonData(commons)
          setSubmissionData(submissions)
          setWeeks(pData.map(week => week.week))

          // Set initial UI state:
          handleWeekSwitch(1, pData, commons, undefined, submissions)
        })

      dataService
        .getCommitData()
        .then(response => {
          const [commits, students] = response

          setCommitData(commits)
          setStudentData(students)

          // Select count data from correct week:
          const selected = (commits !== undefined && commits.length > 0) ?
            commits[commits.findIndex(module => parseInt(module.week) === parseInt(selectedWeek))]["data"]
            : []
          setSelectedCountData(selected)

         updateTreshold(treshold, undefined, commits)
        })
    }, []
  )

  const handleStudentClick = (data, barIndex) => {
    if (data !== undefined) {
      const newSelected = data.id
      setSelectedStudent(newSelected)
    }
  }

  const handleModeSwitchClick = (newMode) => {
    setSelectedMode(newMode)
    setdisplayedModes(modes.filter(name => name !== newMode))
    
    const newKeys = allKeys[newMode]
    setDataKeys(newKeys)

    handleWeekSwitch(undefined, undefined, undefined, newKeys, undefined, newMode)
  }

  const handleWeekSwitch = (newWeek, data, commons, keys, submissions, mode) => {
    
    if (newWeek === undefined) { newWeek = selectedWeek }
    if (data === undefined) { data = progressData }
    if (commons === undefined) { commons = commonData }
    if (keys === undefined ) { keys = dataKeys}
    if (submissions === undefined) { submissions = submissionData }
    if (mode === undefined) { mode = selectedMode }

    setSelectedWeek(newWeek)

    if ((["exercises", "points"].includes(mode)) &&
        (data[newWeek-1] !== undefined && data[newWeek-1]["data"] !== undefined)) {
        
      setMax(data[newWeek-1]["data"][0][keys.max])
      setSelectedWeekData(data[newWeek-1]["data"])

      setcommonDataToDisplay({
        'avg': commons[keys.cumulativeAvgs][newWeek-1],
        'mid': commons[keys.cumulativeMidExpected][newWeek-1],
        'min': commons[keys.cumulativeMinExpected][newWeek-1]
      })
    }

    let newCountData = undefined
  
    if (mode === "submissions") {
      if (submissions !== undefined) {
        newCountData = submissions[newWeek-1]["data"]
        setSelectedCountData(newCountData)
      }
    }
    else {
      if (commitData !== undefined && commitData.length > 1) {
        const weekStr = newWeek.toString()
        const key = (weekStr.length < 2) ? `0${weekStr}` : (weekStr !== "14") ? weekStr : "01-14"
        newCountData = commitData[commitData.findIndex(module => module.week === key)]["data"]
        setSelectedCountData(newCountData)
      }
    }

    if (newCountData !== undefined) {
      updateTreshold(treshold, data[newWeek-1]["data"], newCountData)
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

  const updateTreshold = (newTreshold, selectedData, selectedCountD) => {

    if (selectedData === undefined) { selectedData = selectedWeekData }
    if (selectedCountD === undefined) { selectedCountD = selectedCountData }

    setTreshold(newTreshold)

    if (selectedData[0] !== undefined) {
      
      // Calculate how many students fall below required point count:
      const requiredPts = selectedData[0].maxPts * newTreshold
      const studentCountBelowTreshold = selectedCountD
        .filter(student => student.cumulativePoints < requiredPts)
        .length

      setStudentsBelowTreshold(studentCountBelowTreshold)
    }
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
                  data={selectedWeekData} dataKeys={dataKeys}
                  commonData={commonDataToDisplay} commonKeys={commonKeys}
                  axisNames={axisNames[selectedMode]} max={max}
                  handleClick={handleStudentClick}
                  visuMode={selectedMode} countData={selectedCountData}
                  studentsBelowTreshold={studentsBelowTreshold}
                  updateTreshold={updateTreshold} treshold={treshold}>
      </MultiChart>

      <StudentDetailView selectedStudentID={selectedStudent} students={studentData}></StudentDetailView>
    </>
  )
}
  
export default StatusTab
