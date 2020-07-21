import axios from 'axios'
import helpers from './helpers'

const baseUrl = 'http://localhost:9200/plussa-course-40-students/_search'

const getWeeklyPoints = (modules, mapping) => {
  
  const weeklyPts = {}
  const weeklyMaxes = []
  const weeklyExercises = {}
  const weeklyExerciseMaxes = []
  const weeklySubmissions = {}
  
  modules.forEach(module => {

    // Exclude all fake or ghost modules:
    if (mapping.indexOf(module.id) > -1 || module.id === 570) { // Hard coding: ID 570 is a special case: git-course-module that has no points in Programming 2.
      
      // Deduct which week the module stands for:
      let week = module.name.slice(0, 2)
      if (week[1] === ".") {
        week = week.slice(0, 1)
      }

      // How many points student has received this this module, aka. "week":
      weeklyPts[week] = module.points

      // How many points it is possible to receive from this module, aka. "week":
      weeklyMaxes.push(module.max_points)

      // How many exercises student has submitted (NOTE: submission doesn't mean any kind of success!):
      weeklyExercises[week] = module.exercises.reduce((sum, exercise) => {
        sum += (exercise.submission_count > 0) ? 1 : 0
        return sum
      }, 0)

      // How many exercises this module aka. "week" contains:
      weeklyExerciseMaxes.push(module.exercises.length)

      // How many submissions student has made in each exercise:
      weeklySubmissions[week] = module.exercises.map(exercise => {
        /*return {    // TODO: Use this is info needed about whether the exercises are passed
          passed: exercise.points > exercise.points_to_pass,
          submissions: exercise.submission_count
        }*/
        return exercise.submission_count
      })
    }
  })

  return [weeklyPts, weeklyMaxes, weeklyExercises, weeklyExerciseMaxes, weeklySubmissions]
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

const formatSubmissionData = (data) => {
  const formatted = Object.keys(data[0].weeklySubmissions).map(week => {return {"week": week}})

  return formatted.map(week => {
    week.data = data.map(student => {
      const newStudent = {
        id: student.id,
        submissions: student.weeklySubmissions[week.week]
      }

      let i = 0
      student.weeklySubmissions[week.week].forEach(submissionCount => {
        const attributeName = "exercise-".concat(i+1)
        newStudent[attributeName] = i+1
        i += 1
      })

      return newStudent
    })
    return week
  })
}

const getData = () => {

  const request = axios
    .get(baseUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {

      // Map modules to weeks:
      const first_non_empty = response.data.hits.hits[0]._source.results.find(result => !result.student_id.includes("redacted"))
      const moduleMapping = getModuleMapping(first_non_empty.points.modules)

      const results = []
      const submissionData = []

      // Map student data into weeks:
      response.data.hits.hits.forEach(hit => {
        hit._source.results.forEach(result => {
          if (!result.username.includes("redacted")) {

            const [weeklies, weeklyMaxes,
              weeklyExercises, weeklyExerciseMaxes,
              weeklySubmissions
            ] = getWeeklyPoints(result.points.modules, moduleMapping)

            const formattedResult = {
              name: result.username,
              id: result.student_id,
              weeklyPoints: weeklies,
              weeklyExercises: weeklyExercises,
              maxPts: 0,
              maxExer: 0,
              weeklyMaxes: weeklyMaxes,
              weeklyExerciseMaxes: weeklyExerciseMaxes,
              cumulativeMaxes: [],
              cumulativeExerMaxes: [],
              cumulativePoints: {},
              cumulativeExercises: {}
            }
            results.push(formattedResult)
            
            submissionData.push({
              id: result.username,
              weeklySubmissions: weeklySubmissions
            })
          }
        })
      })

      const [progress, commons] = formatProgressData(results)

      return [progress, commons, formatSubmissionData(submissionData)]
    })
    .catch(someError => [[], []])

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

const calcCumulativeScoresForStudents = (data) => {
  if (data.length > 0 && data[0].weeklyPoints !== undefined && data[0].weeklyExercises !== undefined) {

    // Calculate cumulative points and exercises for each student:
    data.forEach(student => {
      let sum = 0
      let exerciseSum = 0

      Object.keys(student.weeklyPoints).forEach(week => {

        // Weekly points:
        sum += student.weeklyPoints[week]
        student.cumulativePoints[week] = sum

        // Weekly submitted exercises:
        exerciseSum += student.weeklyExercises[week]
        student.cumulativeExercises[week] = exerciseSum
      })
    });
  
  } else { console.log("progressData.js::calcCumulativePoints(): data does not contain non-empty field: weeklyPoints or weeklyExercises!");}

  return data
}

const calcCumulatives = (pointArray) => {
  return Object.keys(pointArray).map(key => {
    return pointArray.slice(0, key).reduce((sum, val) => {
      return sum + val
    }, 0)
  })
}

const calcCommonData = (data) => {

  const weeks = getWeeks(data)
  const avgs = new Array(weeks.length).fill(0)
  const exerciseAvgs = new Array(weeks.length).fill(0)
  // TODO: get real values for the expecteds:
  const midExpected = [30, 100, 77, 83, 37, 70, 45, 41, 74, 40, 40, 120, 5, 30, 0, 0] // From history data
  const minExpected = [30, 100, 30, 40, 30, 80,  0, 30, 36, 25,  0,   0, 0, 30, 0, 0] // From history data
  const midExpectedExercises = [2, 3, 1, 2, 1, 2, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1] // From history data
  const minExpectedExercises = [2, 2, 1, 2, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0] // From history data
  
  // Calculate weekly cumulative maxes for points and exercises from weeklyMaxes and weeklyExerciseMaxes:
  const cumulativeMaxes = (data.length > 0) ? 
    calcCumulatives(data[0].weeklyMaxes.concat(0)).slice(1, data[0].weeklyMaxes.length+1)
    : []
  
  const cumulativeExerMaxes = (data.length > 0) ?
  calcCumulatives(data[0].weeklyExerciseMaxes.concat(0)).slice(1, data[0].weeklyExerciseMaxes.length+1)
  : []
  
  // TODO: Calculate cumulative points and submitted exercises for each student:
  // TODO: Move calculating students' cumulative points here:

  // Calculate weekly averages for points and exercises:
  weeks.forEach(week => {
    data.forEach(student => {
      avgs[week-1] += student.weeklyPoints[week]
      exerciseAvgs[week-1] += student.weeklyExercises[week]
    })
    avgs[week-1] = Math.round(avgs[week-1] / data.length)
    exerciseAvgs[week-1] = Math.round(exerciseAvgs[week-1] / data.length)
  })

  const commonData = {
    cumulativeAvgs: calcCumulatives(avgs),
    cumulativeMinExpected: calcCumulatives(minExpected),
    cumulativeMidExpected: calcCumulatives(midExpected),

    cumulativeAvgsExercises: calcCumulatives(exerciseAvgs),
    cumulativeMidExpectedExercises: calcCumulatives(minExpectedExercises),
    cumulativeMinExpectedExercises: calcCumulatives(midExpectedExercises)
  }

  data.forEach(student => {
    student.weeklyAvgs = avgs
    student.weeklyMins = minExpected
    student.weeklyMids = midExpected

    student.cumulativeMaxes = cumulativeMaxes
    student.cumulativeExerMaxes = cumulativeExerMaxes
  })
  
  return [data, commonData]
}

const dataByWeeks = (data) => {

  return getWeeks(data).map(week => {
    const newData = data.map(student => {
      const weekIndex = week-1

      return {
        id: student.id,

        // How many points in total there has been available on the course:
        maxPts: student.cumulativeMaxes[weekIndex],
        // For displaying how many points the student has gained in total during the course:
        totPts: student.cumulativeMaxes[weekIndex] - student.weeklyMaxes[weekIndex],
        // For displaying how many points student received this week:
        week: student.cumulativeMaxes[weekIndex] - student.weeklyMaxes[weekIndex] + student.weeklyPoints[week],
        // How many points student has missed during the course:
        missed: (student.cumulativeMaxes[weekIndex-1] || 0) - (student.cumulativePoints[weekIndex] || 0),
        
        // How many exercises in total there has been available on the course up until this week:
        maxExer: student.cumulativeExerMaxes[weekIndex],
        // For displaying how many exercises student has submitted in total during the course up until this week:
        totExer: student.cumulativeExerMaxes[weekIndex] - student.weeklyExerciseMaxes[weekIndex],
        // For displaying how many exercises student did this week:
        weekExer: student.cumulativeExerMaxes[weekIndex] - student.weeklyExerciseMaxes[weekIndex] + student.weeklyExercises[week],
        // How many exercises student has missed during the course up until this week:
        missedExer: (student.cumulativeExerMaxes[weekIndex-1] || 0) - (student.cumulativeExercises[weekIndex] || 0),
      }
    })
    return {week: week, data: newData}
  })
}

const formatProgressData = (pData) => {
  const [data, commonData] = calcCommonData(calcCumulativeScoresForStudents(pData))
  return [helpers.orderData(dataByWeeks(data)), commonData]
}

export default { formatProgressData, getData };
