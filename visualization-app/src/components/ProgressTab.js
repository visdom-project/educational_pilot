import React, { useState, useEffect } from 'react'
import LineChartVisu from './LineChartVisu';
import dataService from '../services/studentData'

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

  return (
    <>
      <LineChartVisu data={filterWeeks(weeklyPoints)}
                     title={'Weekly Points'}
                     keys={studentIds}
                     axisNames={['Week', ''/*'Points'*/]}>
      </LineChartVisu>
      
      <LineChartVisu data={filterWeeks(cumulativeWeeklyPoints)}
                     title={'Cumulative Weekly Points'}
                     keys={studentIds}
                     axisNames={['Week', ''/*'Points'*/]}>
      </LineChartVisu>
    </>
  )
}

export default ProgressTab
