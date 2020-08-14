import axios from 'axios'
import historyDataService from '../services/historyData'

const baseUrl = 'http://localhost:9200/gitlab-course-40-commit-data-anonymized/_search'

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

      const results = []
      const resultsCumulative = []
      const exerciseResults = []
      const exerciseResultsCumulative = []

      const weeks = moduleMapping.map((id, index) => { return { week: index + 1 } })

      weeks.forEach(week => {
        const exerciseWeek = {...week}

        const weekCumulatively = {week: week.week}
        const exerciseWeekCumulatively = {week: week.week}

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

        results.push(week)
        resultsCumulative.push(weekCumulatively)

        exerciseResults.push(exerciseWeek)
        exerciseResultsCumulative.push(exerciseWeekCumulatively)
      })

      // Parse commit data:
      const [weeklyComms, cumulativeComms, weeklySubs, cumulativeSubs]
        = getCommitData(response, moduleMapping)

      // Add history data to data set:
      return historyDataService
        .getHistoryData()
        .then(response => {
          const historyByWeeks = response
          Object.keys(historyByWeeks).forEach(weekName => {
            // Add average weekly point counts:
            let index = 0
            historyByWeeks[weekName].avg_points.forEach(gradePoints => {
              results[parseInt(weekName)-1][`avg_points_grade_${index}`] = gradePoints
              index += 1
            })
            // Add average weekly commit counts:
            index = 0
            historyByWeeks[weekName].avg_commits.forEach(gradeCommits => {
              weeklyComms[parseInt(weekName)-1][`avg_commits_grade_${index}`] = gradeCommits
              index += 1
            })
            // Add average weekly exercise counts:
            index = 0
            historyByWeeks[weekName].avg_exercises.forEach(gradeExercises => {
              exerciseResults[parseInt(weekName)-1][`avg_exercises_grade_${index}`] = gradeExercises
              index += 1
            })
            // Add average weekly submission counts:
            index = 0
            historyByWeeks[weekName].avg_submissions.forEach(gradeSubmissions => {
              weeklySubs[parseInt(weekName)-1][`avg_submissions_grade_${index}`] = gradeSubmissions
              index += 1
            })

            // Add average cumulative weekly point counts:
            index = 0
            historyByWeeks[weekName].avg_cum_points.forEach(gradePoints => {
              resultsCumulative[parseInt(weekName)][`avg_cum_points_grade_${index}`] = gradePoints
              index += 1
            })
            // Add average cumulative weekly commit counts:
            index = 0
            historyByWeeks[weekName].avg_cum_commits.forEach(gradeCommits => {
              cumulativeComms[parseInt(weekName)-1][`avg_cum_commits_grade_${index}`] = gradeCommits
              index += 1
            })
            // Add average cumulative weekly exercise counts:
            index = 0
            historyByWeeks[weekName].avg_cum_exercises.forEach(gradeExercises => {
              exerciseResultsCumulative[parseInt(weekName)][`avg_cum_exercises_grade_${index}`] = gradeExercises
              index += 1
            })
            // Add average cumulative weekly submission counts:
            index = 0
            historyByWeeks[weekName].avg_cum_submissions.forEach(gradeSubmissions => {
              cumulativeSubs[parseInt(weekName)-1][`avg_cum_submissions_grade_${index}`] = gradeSubmissions
              index += 1
            })
          })

          return [calcWeeklyAvgs(results),
            calcWeeklyAvgs(resultsCumulative),
            calcWeeklyAvgs(exerciseResults),
            calcWeeklyAvgs(exerciseResultsCumulative),
            weeklyComms, cumulativeComms, weeklySubs, cumulativeSubs]
        })
    })
    .catch(someError => [[], []])

  return request
}

const getStudentIds = (data) => {
  
  if (data === undefined || data[0] === undefined) {
    console.log("progressData.js::getStudentIds(): data is undefined. Returning empty student list.");
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

  const results = moduleMapping.map((id, index) => { return { week: index + 1 } })
  const cumulativeResults = moduleMapping.map((id, index) => { return { week: index + 1 } })

  const submissions = moduleMapping.map((id, index) => { return { week: index + 1 } })
  const cumulativeSubmissions = moduleMapping.map((id, index) => { return { week: index + 1 } })

  response.data.hits.hits.forEach(hit => {
    hit._source.results.forEach(student => {
      if (!student.username.includes("redacted")) {
        
        // Calculcate commit data (weekly & cumulative commit counts):
        const weeklyCommits = []

        results.forEach(weekObject => {
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

  return [calcWeeklyAvgs(results),
          calcWeeklyAvgs(cumulativeResults),
          calcWeeklyAvgs(submissions),
          calcWeeklyAvgs(cumulativeSubmissions)]
}

export default { getStudentIds, getData };
