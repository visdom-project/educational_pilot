
const pairPointsToWeeks = (pointArray, resultArray, student) => {
  pointArray.forEach(pointObject => {
    const keyname = Object.keys(pointObject)[0]
    resultArray[keyname -1][student.id] = pointObject[keyname]
  })
}

const formatPointData = (pointdata, weeks) => {
  const formatted = weeks.map(weekname => {return {name: weekname}})
  const formattedCumulative = weeks.map(weekname => {return {name: weekname}})

  pointdata.forEach(student => {
    pairPointsToWeeks(student.points, formatted, student)
    pairPointsToWeeks(student.cumulativePoints, formattedCumulative, student)
  });
  return [formatted, formattedCumulative]
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
    return {...wPoints, "avg": averages[wPoints.name-1]}
  })
}

export default { formatPointData, calculateWeeklyAvgs, catenateAvgsToPts };
