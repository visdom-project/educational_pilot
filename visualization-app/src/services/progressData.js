import axios from "axios"
import historyDataService from "../services/historyData"
import { SERVER_URL } from "./constants.js";

const baseUrl = `${SERVER_URL}/gitlab-course-40-commit-data-anonymized/_search`

const getModuleMapping = (modules) => {
  const corrects = []
  modules.forEach(module => {
    if (module.exercises.length > 0 || module.id === 570) { // Hard coding: ID 570 is a special case: git-course-module that has no points in Programming 2.
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
    const exercises = correct_week.exercises.reduce((sum, exercise) => {
      sum += (exercise.submission_count > 0) ? 1 : 0
      return sum
    }, 0)
    return [correct_week.points, exercises]
  }
  console.error("progressData.js::getPointsForWeek(): Could not find points for a student!");
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
    const reduce = (week.week !== undefined) ? week.week : 0
    week.weeklyAvgs = (pointSum - reduce) / (len - 1)
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
        result.cumulativeExercises = calcCumulatives(newModules.map(module => module.exercises.reduce((sum, exercise) => {
          sum += (exercise.submission_count > 0) ? 1 : 0
          return sum
        }, 0)))
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

      const weeklyPoints = []
      const cumulativePoints = []
      const weeklyExercises = []
      const cumulativeExercises = []

      const weeks = moduleMapping.map((id, index) => { return { week: index + 1 } })

      weeks.forEach(week => {
        const exerciseWeek = {...week}

        const weekCumulatively = {}
        const exerciseWeekCumulatively = {}

        response.data.hits.hits.forEach(hit => {
          hit._source.results.forEach(result => {
            if (!result.username.includes("redacted")) {

              const [weekPoints, weekExercises] = getPointsForWeek(result, moduleMapping[week.week-1])
              week[result.student_id] = weekPoints
              exerciseWeek[result.student_id] = weekExercises

              weekCumulatively[result.student_id] = result.cumulativePoints[week.week-1]
              exerciseWeekCumulatively[result.student_id] = result.cumulativeExercises[week.week-1]
            }
          })
        })

        weeklyPoints.push(week)
        cumulativePoints.push(weekCumulatively)

        weeklyExercises.push(exerciseWeek)
        cumulativeExercises.push(exerciseWeekCumulatively)
      })

      // Parse commit data:
      const [weeklyCommits, cumulativeCommits, weeklySubmissions, cumulativeSubmissions]
        = getCommitData(response, moduleMapping)

      // Add history data to data set:
      return historyDataService
        .getHistoryData()
        .then(response => {
          const historyByWeeks = response
          Object.keys(historyByWeeks).forEach(weekName => {

            const datastructures = {
              'points': weeklyPoints,
              'exercises': weeklyExercises,
              'commits': weeklyCommits,
              'submissions': weeklySubmissions,
              'cum_commits': cumulativeCommits,
              'cum_submissions': cumulativeSubmissions
            }
            const keys = Object.keys(datastructures)

            // Add average weekly and cumulative point/exercise/commit/submission counts:
            let index = 0
            keys.forEach(key => {
              index = 0
              historyByWeeks[weekName][`avg_${key}`].forEach(gradeValues => {
                datastructures[key][parseInt(weekName)-1][`avg_${key}_grade_${index}`] = gradeValues
                index += 1
              })
            })
            
            // Add average cumulative weekly point and exercise counts:
            index = 0
            historyByWeeks[weekName].avg_cum_points.forEach(gradePoints => {
              cumulativePoints[parseInt(weekName)][`avg_cum_points_grade_${index}`] = gradePoints
              index += 1
            })
            index = 0
            historyByWeeks[weekName].avg_cum_exercises.forEach(gradeExercises => {
              cumulativeExercises[parseInt(weekName)][`avg_cum_exercises_grade_${index}`] = gradeExercises
              index += 1
            })
          })

          const grades = ['0', '1', '2', '3', '4', '5']
          grades.forEach(grade => {
            cumulativePoints[0][`avg_cum_points_grade_${grade}`] = 0
            cumulativeExercises[0][`avg_cum_exercises_grade_${grade}`] = 0
            cumulativeCommits[cumulativeCommits.length-1][`avg_cum_commits_grade_${grade}`] 
              = cumulativeCommits[cumulativeCommits.length-2][`avg_cum_commits_grade_${grade}`]
            cumulativeSubmissions[cumulativeSubmissions.length-1][`avg_cum_submissions_grade_${grade}`]
              = cumulativeSubmissions[cumulativeSubmissions.length-2][`avg_cum_submissions_grade_${grade}`]
          })
          delete cumulativeCommits[cumulativeCommits.length-1].week
          delete cumulativeSubmissions[cumulativeSubmissions.length-1].week

          return [calcWeeklyAvgs(weeklyPoints),
            calcWeeklyAvgs(cumulativePoints),
            calcWeeklyAvgs(weeklyExercises),
            calcWeeklyAvgs(cumulativeExercises),
            weeklyCommits, cumulativeCommits,
            weeklySubmissions, cumulativeSubmissions]
        })
    })
    .catch(someError => [[], []])

  return request
}

const getStudentIds = (data) => {
  if (data === undefined || data[0] === undefined) {
    console.error("progressData.js::getStudentIds(): data is undefined. Returning empty student list.");
    return []
  }
  const list = Object.keys(data[0]).map(key => key)

  const toRemove =  ["week", "weeklyAvgs", "avg_points_grade_0", "avg_points_grade_1", 
                     "avg_points_grade_2", "avg_points_grade_3", "avg_points_grade_4", "avg_points_grade_5"]
  toRemove.forEach(item => {
    const indexOfItem = list.indexOf(item)
    if (indexOfItem > -1) {
      list[indexOfItem] = list[list.length -1]
      list.pop()
    }
  })
  
  return list
}

const getCommitData = (response, moduleMapping) => {
  const weeklyPoints = moduleMapping.map((id, index) => { return { week: index + 1 } })
  const cumulativeResults = moduleMapping.map((id, index) => { return { week: index + 1 } })

  const submissions = moduleMapping.map((id, index) => { return { week: index + 1 } })
  const cumulativeSubmissions = moduleMapping.map((id, index) => { return { week: index + 1 } })

  response.data.hits.hits.forEach(hit => {
    hit._source.results.forEach(student => {
      if (!student.username.includes("redacted")) {
        
        // Calculcate commit data (weekly & cumulative commit counts):
        const weeklyCommits = []

        weeklyPoints.forEach(weekObject => {
          const index = student.commits.findIndex(module => 
            (module.moduleName === "01-14" ? 14 : parseInt(module.module_name)) === parseInt(weekObject.week))
          const commitSum = index < 0 ? 0 : student.commits[index].projects.reduce((sum, project) => sum + project.commit_count, 0)
          weekObject[student.student_id] = commitSum
          weeklyCommits.push(commitSum)
        })

        const cumulativeCommits = Object.keys(weeklyCommits).map(key => {
          return weeklyCommits.slice(0, parseInt(key)+1).reduce((sum, val) => {
            return sum + val
          }, 0)
        })

        cumulativeResults.forEach(weekObject => {
          weekObject[student.student_id] = cumulativeCommits[parseInt(weekObject.week)-1]
        })
        
        // Calculate submission data (weekly & cumulative submission counts):
        const weeklySubmissions = []
        
        submissions.forEach(weekObject => {

          const correctModule = student.points.modules.find(module => {
            const moduleNumber = parseInt(module.name.slice(0, 2))
            const weekNumber = parseInt(weekObject.week)
            const correctWeek = moduleNumber === weekNumber
            const realModule = module.exercises.length > 0 || module.id === 570
            return correctWeek && realModule
          })
          const submissionCount = correctModule !== undefined ? correctModule.submission_count : 0
          weekObject[student.student_id] = submissionCount
          weeklySubmissions.push(submissionCount)
        })

        const cumulativeSubs = Object.keys(weeklySubmissions).map(key => {
          return weeklySubmissions.slice(0, parseInt(key)+1).reduce((sum, val) => {
            return sum + val
          }, 0)
        })

        cumulativeSubmissions.forEach(weekObject => {
          weekObject[student.student_id] = cumulativeSubs[parseInt(weekObject.week)-1]
        })
      }
    })
  })

  return [calcWeeklyAvgs(weeklyPoints),
          calcWeeklyAvgs(cumulativeResults),
          calcWeeklyAvgs(submissions),
          calcWeeklyAvgs(cumulativeSubmissions)]
}

export default { getStudentIds, getData };
