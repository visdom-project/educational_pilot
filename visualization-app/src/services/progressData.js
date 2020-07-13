import axios from 'axios'
const baseUrl = 'http://localhost:9200/plussa-course-40-students/_search'

const getModuleMapping = (modules) => {

  const corrects = []
  modules.forEach(module => {
    if (module.max_points > 0 || module.id === 570) { // Hard coding: ID 570 is a special case: git-course-module that has no points in Programming 2.
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

const getPointsForWeek = (data, moduleId) => {

  const correct_week = data.points.modules.find( module => module.id === moduleId )

  if (correct_week !== undefined) {
    return correct_week.points
  }
  console.log("progressData.js::getPointsForWeek(): Could not find points for a student!");
  return 0
}

const calcWeeklyAvgs = (weeklyPointData) => {

  weeklyPointData.forEach(week => {

    let len = 0
    const pointSum = Object.keys(week).reduce((sum, student) => {
      len += 1
      return sum += week[student]
    }, 0)

    // Avg calculation takes into account that week-field is calculated in the point sum
    week.weeklyAvgs = (pointSum - week.week) / (len - 1)
  })

  return weeklyPointData
}

const calcCumulatives = (pointArray) => {
  return Object.keys(pointArray).map(key => {
    return pointArray.slice(0, key).reduce((sum, val) => {
      return sum + val
    }, 0)
  })
}

const addCumulativePointData = (data, correctModules) => {
  data.data.hits.hits.forEach(hit => {
    hit._source.results.forEach(result => {
      if (!result.username.includes("redacted")) {

        // Remove modules that have uninteresting data:
        const newModules = []
        result.points.modules.forEach(module => {

          const foundModule = correctModules.find( cmp => cmp === module.id)

          if (foundModule !== undefined) {
            newModules.push(module)
          }
        })
        result.modules = newModules

        // Calculate cumulative points for student into a list:
        result.cumulativePoints = calcCumulatives(newModules.map(module => module.points))
      }
    })
  })
}

const getData = () => {

  const request = axios
    .get(baseUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {

      const first_non_empty = response.data.hits.hits[0]._source.results.find(result => !result.student_id.includes("redacted"))
      const moduleMapping = getModuleMapping(first_non_empty.points.modules)

      addCumulativePointData(response, moduleMapping) // Data preprocessing: add cumulative point data, remove excess modules

      const results = []
      const resultsCumulative = []
      
      const weeks1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] // TODO
      const weeks = weeks1.map(week => { return { week: week } })

      weeks.forEach(week => {
        const weekCumulatively = {week: week.week}

        response.data.hits.hits.forEach(hit => {
          hit._source.results.forEach(result => {
            if (!result.username.includes("redacted")) {

              week[result.student_id] = getPointsForWeek(result, moduleMapping[week.week-1])
              weekCumulatively[result.student_id] = result.cumulativePoints[week.week-1]
            }
          })
        })
        results.push(week)
        resultsCumulative.push(weekCumulatively)
      })

      return [calcWeeklyAvgs(results), calcWeeklyAvgs(resultsCumulative)]
    })
    .catch(someError => [])

  return request
}

const getStudentIds = (data) => {
  
  if (data === undefined || data[0] === undefined) {
    console.log("progressData.js::getStudentIds(): data is undefined. Returning empty student list.");
    return []
  }
  const list = Object.keys(data[0]).map(key => key)   // Note/TODO; Contains excess keys: "week" and "weeklyAvgs"

  const toRemove =  ["week", "weeklyAvgs"]
  toRemove.forEach(item => {
    const indexOfItem = list.indexOf(item)
    if (indexOfItem > -1) {
      list[indexOfItem] = list[list.length -1]
      list.pop()
    }
  })
  
  return list
}

export default { getStudentIds, getData };
