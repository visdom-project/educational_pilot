import React, { useState, useEffect } from 'react'
import dataService from '../services/studentData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts';

const ProgressTab = () => {

  const [ studentIds, setStudentIds ] = useState([])
  const [ weeklyPoints, setWeeklyPoints ] = useState([])
  const [ cumulativeWeeklyPoints, setcumulativeWeeklyPoints ] = useState([])
  const [ weeks, setWeeks ] = useState([])
  const [ weeksToShow, setWeeksToShow ] = useState()

  useEffect(
    () => {
      setStudentIds(dataService.getStudentIds())

      const weeks = dataService.getWeeks()
      setWeeks(weeks)

      const formatted = weeks.map(weekname => {
        return {name: weekname}
      })
      const formattedCumulative = weeks.map(weekname => {
        return {name: weekname}
      })

      const pointData = dataService.getAllPoints()
      
      pointData.forEach(student => {
        student.points.forEach(pointObject => {
          let keyname = Object.keys(pointObject)[0]
          formatted[keyname -1][student.id] = pointObject[keyname]
        })
        student.cumulativePoints.forEach(pointObject => {
          let keyname = Object.keys(pointObject)[0]
          formattedCumulative[keyname -1][student.id] = pointObject[keyname]
        })
      });
      setWeeklyPoints(formatted)
      setcumulativeWeeklyPoints(formattedCumulative)

      setWeeksToShow(weeks)
    }, []
  )

  const filterWeeks = (formattedData) => {
    return formattedData.filter(week => {
      return weeksToShow.includes(week.name)
    })
  }

  const axisNames = ['Week', 'Points']
  const syncKey = 'syncKey'

  return (
    <>
      <h2>{'Weekly Points'}</h2>
      
      <LineChart className="intendedChart" width={document.documentElement.clientWidth*0.9} height={260}
        data={filterWeeks(weeklyPoints)} syncId={syncKey}
        margin={{ top: 10, right: 15, left: 25, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: axisNames[0], position: 'bottom' }} />
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>
        <Tooltip />
        {studentIds.map(key => <Line key={key} type="linear" dataKey={key} stroke="#8884d8" />)}
      </LineChart>

      <h2>{'Cumulative Weekly Points'}</h2>
      
      <LineChart className="intendedChart" width={document.documentElement.clientWidth*0.9} height={300}
        data={filterWeeks(cumulativeWeeklyPoints)} syncId={syncKey}
        margin={{ top: 10, right: 15, left: 25, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: axisNames[0], position: 'bottom' }} />
        <YAxis label={{ value: axisNames[1], position: 'left', offset: -20 }}/>
        <Tooltip />
        {studentIds.map(key => <Line key={key} type="linear" dataKey={key} stroke="#8884d8" />)}
        <Brush y={255}></Brush>
      </LineChart>
    </>
  )
}

export default ProgressTab
