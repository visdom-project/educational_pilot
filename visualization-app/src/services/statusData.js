import axios from 'axios'
import helpers from './helpers'

const baseUrl = 'http://localhost:9200/plussa-course-40-students/_search'
const gitlabUrl = 'http://localhost:9200/gitlab-course-40-commit-data/_search'

const getWeeklyPoints = (modules, mapping) => {
  
  const weeklyPts = {}
  const weeklyMaxes = []
  const weeklyExercises = {}
  const weeklyExerciseMaxes = []
  const weeklySubmissions = {}
  const weeklyPassed = {}
  
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
      weeklySubmissions[week] = module.exercises.map(exercise => exercise.submission_count)

      // Which exercises the student has completed successfully:
      weeklyPassed[week] = module.exercises.map(exercise => exercise.points > exercise.points_to_pass)
    }
  })

  return [weeklyPts, weeklyMaxes, weeklyExercises, weeklyExerciseMaxes, weeklySubmissions, weeklyPassed]
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
        submissions: student.weeklySubmissions[week.week],
        passed: student.weeklyPassed[week.week]
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
              weeklySubmissions, weeklyPassed
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
              weeklySubmissions: weeklySubmissions,
              weeklyPassed: weeklyPassed
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

const getCommitData = () => {

  const request = axios
    .get(gitlabUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {

      // TODO: remove hard-coding from this mapping of modules and corresponding project names:
      const PROJECT_MAPPING = {
        "01": ["first_submission", "gitignore"],
        "02": ["(K)/(N)", "(K)/(N)", "temperature", "number_series_game", "mean", "cube"],
        "03": ["lotto", "swap", "encryption", "errors", "molkky"],
        "04": ["container", "split", "random_numbers", "game15", "waterdrop_game_v1/feedback"],
        "05": ["line_numbers", "mixing_alphabets", "points", "wordcount"],
        "06": ["palindrome", "sum", "vertical", "network"],
        "07": ["library", "(K) feedback"],
        "08": ["osoittimien_tulostukset (K)/(N)", "student_register", "arrays", "reverse_polish"],
        "09": ["cards", "traffic", "task_list"],
        "10": ["valgrind", "calculator", "reverse"],
        "11": ["family", "bus_timetables/(K)/(N)/feedback"], 
        "12": ["zoo", "colorpicker_designer", "find_dialog", "timer", "bmi"], 
        "13": ["moving_circle2/hanoi", "tetris", "waterdrop_game_v3/(K)/(N)/feedback"], 
        "01-14": ["command_line"],
        "15": [],
        "16": ["(K)/(N)"]}

      const results = Object.keys(PROJECT_MAPPING).map(moduleName => {
        return {"week": moduleName, data: []}
      })

      // Parse fetched commit data into proper format and fill in missing data:
      response.data.hits.hits.forEach(hit => {
        hit._source.results.forEach(result => {

          // Which exercises the student has passed:
          const passedExercises = result.points.modules
            .filter(module => module.max_points > 0 || module.id === 570)
            .map(module => module.exercises.map(exercise => exercise.passed))

          // Start with a data stucture with proper default values:
          const newCommits = Object.keys(PROJECT_MAPPING).map(moduleName => {
            return {module_name: moduleName, projects: PROJECT_MAPPING[moduleName].map(projectName => {
              return {name: projectName, commit_count: 0, commit_meta: []}
            })}
          })

          // Override default values with student data wherever there is any:
          result.commits.forEach(module => {

            const newModule = module
            const moduleIndex = newCommits.findIndex(commitModule => commitModule.module_name === module.module_name)

            if (moduleIndex > -1) {  // Ignore modules with erroneous names

              // Fill in missing project data:
              const newProjects = newCommits[moduleIndex].projects
              module.projects.forEach(studentProject => {
                const projectIndex = newProjects.findIndex(project => project.name.includes(studentProject.name))
                if (projectIndex < newProjects.length) {
                  newProjects[projectIndex] = studentProject
                }
                else {
                  console.log("Over-indexing:", projectIndex, "of", newProjects);
                }
              })
              newModule.projects = newProjects

              newCommits[moduleIndex] = newModule
            }
          })

          result.commits = newCommits

          // Map each student's commit data to correct weeks in result data:
          result.commits.forEach(module => {
            const moduleInd = module.module_name === "01-14" ? 14 : (parseInt(module.module_name)-1)

            // Format student data into displayable format:
            const student = {
              id: result.username,
              commit_counts: module.projects.map(project => project.commit_count),
              project_names: module.projects.map(project => project.name),
              passed: passedExercises[moduleInd]
            }

            // Separate commit counts to their own fields:
            let i = 1
            student.commit_counts.forEach(commit_count => {
              student[`exercise-${i}`] = i
              i += 1
            })

            results[results.findIndex(week => week.week === module.module_name)].data.push(student)
          })
        })
      })

      return results
    })
    .catch(someError => [[], []])

  return request
}

export default { getData, getCommitData };
