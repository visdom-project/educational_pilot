import React, { useState, useEffect } from 'react'
import dataService from '../services/studentData'
import { ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Area, Bar, Line } from 'recharts';
import DropdownMenu from './DropdownMenu'
import CheckBoxMenu from './CheckBoxMenu'
import helperService from '../services/helpers'

const MultiChart = ({ chartWidth, chartHeight, data, axisNames, avgDataKey, expectedDataKey, ids }) => {
  return (
    <div className="intended">
      <ComposedChart width={chartWidth} height={chartHeight} data={data}
                     margin={{ top: 10, right: 15, left: 25, bottom: 25 }}
                     barGap={-20}>
        
        <XAxis dataKey="name"
               padding={{left: 0, right: 0}}
               label={{ value: axisNames[0], position: 'bottom' }}/>
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>
        
        <Tooltip />
        
        <CartesianGrid stroke="#f5f5f5" />

        <Area type="monotone" dataKey="cum" fill="#e5e7ff" stroke="#e5e7ff" />
        
        <Bar dataKey="maxCum" barSize={20} fill="#EEEEEE" stroke="lightgrey"/>
        <Bar dataKey="week" barSize={20} fill="#413ea0" stroke="lightgrey"/>
        <Bar dataKey="cum" barSize={20} fill="#BBBBFF" stroke="lightgrey"/>
        <Bar dataKey="missed" barSize={20} fill="#FFFFFF" stroke="lightgrey"/>

        <Line type="monotone" dataKey={avgDataKey} stroke="#ff7300" />
        <Line type="monotone" dataKey={expectedDataKey} stroke="#000073" />
      </ComposedChart>
    </div>
  )
}

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

const StudentDetailView = () => {
  return (
    <h2>{'Student Details'}</h2>
  )
}

const StatusTab = () => {

  /*const [ studentIds, setStudentIds ] = useState([])
  const [ weeklyPoints, setWeeklyPoints ] = useState([])
  const [ cumulativeWeeklyPoints, setCumulativeWeeklyPoints ] = useState([])*/

  const [ weeks, setWeeks ] = useState([])
  const [ displayedWeeks, setdisplayedWeeks ] = useState([])
  const [ selectedWeek, setSelectedWeek ] = useState("")

  const [ modes, setModes ] = useState([])
  const [ displayedModes, setdisplayedModes ] = useState([])
  const [ selectedMode, setSelectedMode ] = useState("")

  const [ showableLines, setShowableLines ] = useState([])
  const [ showAvg, setShowAvg ] = useState(true)
  const [ showExpected, setShowExpected ] = useState(true)

  const axisNames = ['Students', 'Points']
  const avgDataKey = 'avg'
  const expectedDataKey = 'exp'
  const chartWidth = document.documentElement.clientWidth*0.9
  const chartHeight = document.documentElement.clientHeight*0.5
  useEffect(
    () => {
      /*
      const ids = dataService.getStudentIds()
      const weeks = dataService.getWeeks()
      const pointData = dataService.getAllPoints()
      
      const [points, cumulativePoints] = helperService.formatPointData(pointData, weeks)

      const weekAvgs = helperService.calculateWeeklyAvgs(points, ids)
      const weekCumulativeAvgs = helperService.calculateWeeklyAvgs(cumulativePoints, ids)
      
      const catenatedPoints = helperService.catenateAvgsToPts(points, weekAvgs)
      const catenatedCumulative = helperService.catenateAvgsToPts(cumulativePoints, weekCumulativeAvgs)

      setStudentIds(ids)
      setWeeklyPoints(catenatedPoints)
      setCumulativeWeeklyPoints(catenatedCumulative)*/
      
      setModes(["points", "exercises", "commits"])
      setSelectedMode("points")
      setdisplayedModes(["exercises", "commits"])
      
      setWeeks(["1", "2", "3", "4", "5", "6", "7"])
      setSelectedWeek("1")
      setdisplayedWeeks(["2", "3", "4", "5", "6", "7"])

      setShowableLines(["Average", "Expected"])
    }, []
  )

  const handleStudentClick = (key) => {
    /*setDisplayedStudents(displayedStudents.filter(student => student !== key))
    document.querySelector(`#li-${key}`).style.color = "grey"*/
  }

  const handleModeSwitchClick = (newMode) => {
    setSelectedMode(newMode)
    setdisplayedModes(modes.filter(name => name !== newMode))
  }

  const handleWeekSwitchClick = (newWeek) => {
    setSelectedWeek(newWeek)
    setdisplayedModes(weeks.filter(week => week !== newWeek))
  }

  const handleToggleRefLineVisibilityClick = (targetLine) => {
    if (targetLine === "Expected") { setShowExpected(!showExpected) }
    else {
      // Toggle average lines visibility:
      /*const lines = document.querySelectorAll("g.recharts-layer.recharts-line>path.recharts-curve.recharts-line-curve")
      lines.forEach(node => {
        if (node.outerHTML.includes(`stroke-width="${avgStrokeWidth}"`)) {
          node.style.display = showAvg ? "none" : ""
        }
      })*/
      setShowAvg(!showAvg)
    }
  }

  // Data format: maxCum: maksimipistekertymä viikon loppuun mennessä
  //                week: tämän viikon pistemäärä + maksimikertymä viikon alkuun mennessä
  //                 cum: maksimikertymä viikon alkuun mennessä
  //                 out: maksimikertymä viikon alkuun mennessä - kertymä viikon alkuun mennessä
  const data = [
    {
      "name": "123456",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    },
    {
      "name": "234567",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    },
    {
      "name": "345678",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    },
    {
      "name": "456789",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    },
    {
      "name": "567890",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    },
    {
      "name": "678901",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    },
    {
      "name": "789012",
      "maxCum": 550,
      "week": 500,
      "cum": 460,
      "missed": 20,
      "avg": 348,
      "exp": 230
    }
  ]

  return (
    <>
      <div className="fit-row">
        <h2>{'Current Student Statuses'}</h2>
        <Controls handleClick={handleModeSwitchClick}
                  modes={displayedModes} selectedMode={selectedMode}
                  showableLines={showableLines}
                  handleToggleRefLineVisibilityClick={handleToggleRefLineVisibilityClick}
                  showAvg={showAvg} showExpected={showExpected}
                  handleWeekClick={handleWeekSwitchClick} weeks={weeks} selectedWeek={selectedWeek} >
        </Controls>
      </div>

      <MultiChart chartWidth={chartWidth} chartHeight={chartHeight}
                  data={data} avgDataKey={avgDataKey} expectedDataKey={expectedDataKey}
                  axisNames={axisNames}>
      </MultiChart>

      <StudentDetailView></StudentDetailView>
    </>
  )
}
  
export default StatusTab
