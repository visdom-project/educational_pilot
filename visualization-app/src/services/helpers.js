
const pairPointsToWeeks = (studentPoints, allPoints, id) => {
  Object.keys(studentPoints).forEach(week => {
    allPoints[parseInt(week)-1][id] = studentPoints[week]
  })
}

const pointsByWeek = (pointdata, weeks) => {
  const allWeeklyPoints = weeks.map(weekname => {return {week: weekname}})
  const allWeeklyCumulatives = weeks.map(weekname => {return {week: weekname}})

  pointdata.forEach(student => {
    pairPointsToWeeks(student.weeklyPoints, allWeeklyPoints, student.id)
    pairPointsToWeeks(student.cumulativePoints, allWeeklyCumulatives, student.id)
  });
  return [allWeeklyPoints, allWeeklyCumulatives]
}

const calculateWeeklyAvgs = (points, studentIds) => {
  const weekAvgs = []
  points.forEach(weekPoints => {
    let weekAvg = 0
    studentIds.forEach(studentId => {
      weekAvg += weekPoints[studentId]
    })
    weekAvgs.push(weekAvg/studentIds.length)
  })
  return weekAvgs
}

const catenateAvgsToPts = (points, averages) => {
  return points.map(wPoints => {
    return {...wPoints, 'weeklyAvgs': averages[wPoints.week-1]}
  })
}

const calcCumulatives = (pointArray) => {
  return Object.keys(pointArray).map(key => {
    return pointArray.slice(0, key).reduce((sum, val) => {
      return sum + val
    }, 0)
  })
}

export default { pointsByWeek, calculateWeeklyAvgs, catenateAvgsToPts, calcCumulatives };
