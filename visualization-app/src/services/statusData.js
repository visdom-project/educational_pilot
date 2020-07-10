import axios from 'axios'
const baseUrl = 'http://localhost:9200/plussa-course-40-students/_search'

const getWeeklyPoints = (modules, mapping) => {
  
  const weeklyPts = {}
  const weeklyMaxes = []

  modules.forEach(module => {
    if (mapping.indexOf(module.id) > -1) {
      let week = module.name.slice(0, 2)
      if (week[1] === ".") {
        week = week.slice(0, 1)
      }

      weeklyPts[week] = module.points

      // TODO: get rid of this:
      if (week === "14") {
        weeklyPts["15"] = 0
        weeklyMaxes.push(0)
      }

      weeklyMaxes.push(module.max_points)
    }
  })

  return [weeklyPts, weeklyMaxes]
}

const getModuleMapping = (modules) => {

  const corrects = []
  modules.forEach(module => {
    if (module.max_points > 0) {
      let module_number = module.name.slice(0, 2)
      if (module_number[1] === ".") {
        module_number = module_number[0]
      }
      const newModule = {...module, week: module_number}
      corrects.push(newModule)
    }
  })

  const mapped = new Array(corrects.length).fill("")
  corrects.forEach(module => {
    mapped[parseInt(module.week)-1] = module.id
  })

  return mapped
}

const getData = () => {

  const request = axios
    .get(baseUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {

      // Map modules to weeks:
      const first_non_empty = response.data.hits.hits[0]._source.results.find(result => !result.student_id.includes("redacted"))
      const moduleMapping = getModuleMapping(first_non_empty.points.modules)

      const results = []
      // Map student data into weeks:
      response.data.hits.hits.forEach(hit => {
        hit._source.results.forEach(result => {
          if (!result.username.includes("redacted")) {

            const [weeklies, weeklyMaxes] = getWeeklyPoints(result.points.modules, moduleMapping)

            const formattedResult = {
              name: result.username,
              id: result.student_id,
              weeklyPoints: weeklies,
              maxPts: 0,  // TODO: get value for this
              weeklyMaxes: weeklyMaxes,
              cumulativeMaxes: [],
              cumulativePoints: {}
            }
            results.push(formattedResult)
          }
        })
      })

      return results
    })
    .catch(someError => [])

  return request
}

const getWeeks = (data) => {
  if (data.length > 0 && data[0].weeklyPoints !== undefined) {
    return [...Object.keys(data[0].weeklyPoints)]
  }
  else {
    console.log("progressData.js::calcWeeks(): data does not contain non-empty field: weeklyPoints!");
    return []
  }
}

const calcCumulativePoints = (data) => {
  if (data.length > 0 && data[0].weeklyPoints !== undefined) {
    
    // Calculate weekly cumulative sum of points for each student:
    data.forEach(student => {
      let sum = 0
      Object.keys(student.weeklyPoints).forEach(week => {
        sum += student.weeklyPoints[week]
        student.cumulativePoints[week] = sum
      })
    });
  
  } else { console.log("progressData.js::calcCumulativePoints(): data does not contain non-empty field: weeklyPoints!");}

  return data
}

const calcCumulatives = (pointArray) => {
  return Object.keys(pointArray).map(key => {
    return pointArray.slice(0, key).reduce((sum, val) => {
      return sum + val
    }, 0)
  })
}

const calcAvgs = (data) => {
  const weeks = getWeeks(data)
  const avgs = new Array(weeks.length).fill(0)
  // TODO: get real values for the expecteds:
  const midExpected = [30, 100, 77, 83, 37, 70, 45, 41, 74, 40, 40, 120, 5, 30, 0, 0] // From history data
  const minExpected = [30, 100, 30, 40, 30, 80,  0, 30, 36, 25,  0,   0, 0, 30, 0, 0] // From history data
  
  // Calculate weekly cumulative maxes from weeklyMaxes:
  const cumulativeMaxes = (data.length > 0) ? 
    calcCumulatives(data[0].weeklyMaxes.concat(0)).slice(1, data[0].weeklyMaxes.length+1)
    : []

  // Calculate weekly averages:
  weeks.forEach(week => {
    data.forEach(student => {
      avgs[week-1] += student.weeklyPoints[week]
    })
    avgs[week-1] = Math.round(avgs[week-1] / data.length)
  })

  const commonData = {
    cumulativeAvgs: calcCumulatives(avgs),
    cumulativeMinExpected: calcCumulatives(minExpected),
    cumulativeMidExpected: calcCumulatives(midExpected)
  }

  data.forEach(student => {
    student.weeklyAvgs = avgs
    student.weeklyMins = minExpected
    student.weeklyMids = midExpected

    student.cumulativeMaxes = cumulativeMaxes
  })
  
  return [data, commonData]
}

const dataByWeeks = (data) => {
  return getWeeks(data).map(week => {
    const newData = data.map(student => {
      return {
        id: student.id,
        maxPts: student.cumulativeMaxes[week-1],
        totPts: student.cumulativeMaxes[week-1] - student.weeklyMaxes[week-1],
        week: student.cumulativeMaxes[week-1] - student.weeklyMaxes[week-1] + student.weeklyPoints[week],
        missed: (student.cumulativeMaxes[week-2] || 0) - (student.cumulativePoints[week-1] || 0),
        tooltipWeek: student.weeklyPoints[week],
        tooltipWeekTot: student.weeklyMaxes[week-1],
        tooltipCPts: student.cumulativePoints[week],
        tooltipCPtsTot: student.cumulativeMaxes[week-1]
      }
    })
    return {week: week, data: newData}
  })
}

const formatProgressData = (pData) => {
  const [data, commonData] = calcAvgs(calcCumulativePoints(pData))
  return [dataByWeeks(data), commonData]
}

export default { formatProgressData, getData };
