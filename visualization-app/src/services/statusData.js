import axios from 'axios'
import helpers from './helpers'
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
              maxPts: 1060,  // TODO: get value for this
              weeklyMaxes: weeklyMaxes,
              cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060], // TODO: get real value for this
              cumulativePoints: {},
              weeklyAvgs: [],
              weeklyMins: [],
              weeklyMids: []
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

const getStudentIds = (data) => {
  // const request = axios.get(baseUrl)
  // return request.then(response => response.data)
  return data.map(student => student.id)
}

const calcAvgs = (data) => {
  const weeks = getWeeks(data)
  const avgs = new Array(weeks.length).fill(0)
  const midExpected = [30, 100, 77, 83, 37, 70, 45, 41, 74, 40, 40, 120, 5, 30, 0, 0]
  const minExpected = [30, 100, 30, 40, 30, 80,  0, 30, 36, 25,  0,   0, 0, 30, 0, 0]
  
  // Calculate weekly averages:
  weeks.forEach(week => {
    data.forEach(student => {
      avgs[week-1] += student.weeklyPoints[week]
    })
    avgs[week-1] = Math.round(avgs[week-1] / data.length)
  })

  data.forEach(student => {
    student.weeklyAvgs = avgs
    student.weeklyMins = minExpected
    student.weeklyMids = midExpected

    student.cumulativeAvgs = helpers.calcCumulatives(avgs)
    student.cumulativeMinExpected = helpers.calcCumulatives(minExpected)
    student.cumulativeMidExpected = helpers.calcCumulatives(midExpected)
  })
  
  return data
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
        avg: student.cumulativeAvgs[week-1],
        mid: student.cumulativeMidExpected[week-1],
        min: student.cumulativeMinExpected[week-1],
        tooltipWeek: student.weeklyPoints[week],
        tooltipWeekTot: student.weeklyMaxes[week-1],
        tooltipCPts: student.cumulativePoints[week],
        tooltipCPtsTot: student.cumulativeMaxes[week-1]
      }
    })
    return {week: week, data: newData}
  })
}

const getProgressData = (pData) => {
  return dataByWeeks(calcAvgs(calcCumulativePoints(pData)))
}

export default { getStudentIds, getWeeks, getProgressData, getData };
