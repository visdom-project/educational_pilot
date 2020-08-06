import axios from 'axios'
import helpers from './helpers'

const baseUrl = 'http://localhost:9200/gitlab-course-40-commit-data/_search'

/*const getData = () => {

  const request = axios
    .get(baseUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {

      const results = []

      // Map student data into weeks:
      response.data.hits.hits.forEach(hit => {
        hit._source.results.forEach(student => {
          if (!student.username.includes("redacted")) {

            results.push(student)

          }
        })
      })

      return results
    })
    .catch(someError => [[], []])

  return request
}*/

const getCommitData = () => {

  const request = axios
    .get(baseUrl, {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {

      // TODO: remove hard-coding from this mapping of modules and corresponding project names:
      const PROJECT_MAPPING = {
        "01": ["first_submission", "gitignore"],
        "02": ["(K) Hello, World! (Tehtävä Aloitus)", "(K) Staattinen tyypitys (Tehtävä Tyypitys)", "temperature", "number_series_game", "mean", "cube"],
        "03": ["lotto", "swap", "encryption", "errors", "molkky"],
        "04": ["container", "split", "random_numbers", "game15", "(K) Peli 15 -projektin palaute (Tehtävä Palaute1)"],
        "05": ["line_numbers", "mixing_alphabets", "points", "wordcount"],
        "06": ["palindrome", "sum", "vertical", "network"],
        "07": ["library", "(K) Kirjastoprojektin palaute (Tehtävä Palaute2)"],
        "08": ["(K) Osoittimien_tulostukset (Tehtävä Osoittimet)", "student_register", "arrays", "reverse_polish"],
        "09": ["cards", "traffic", "task_list"],
        "10": ["valgrind", "calculator", "reverse"],
        "11": ["family", "(K) Sukuprojektin palaute (Tehtävä Palaute3)"], 
        "12": ["zoo", "colorpicker_designer", "find_dialog", "timer", "bmi"], 
        "13": ["moving_circle2/hanoi", "tetris", "(K) Hanoin torni -projektin palaute (Tehtävä Palaute4)"], 
        "01-14": ["command_line"],
        "15": [],
        "16": ["(K) Tutkimussuostumus (Tehtävä gdpr)"]}

      const results = Object.keys(PROJECT_MAPPING).map(moduleName => {
        return {"week": moduleName, data: []}
      })

      const studentData = []

      // Parse fetched commit data into proper format and fill in missing data:
      response.data.hits.hits.forEach(hit => {
        hit._source.results.forEach(result => {

          // Which exercises the student has passed:
          const passedExercises = result.points.modules
            .filter(module => module.max_points > 0 || module.id === 570)
            .map(module => module.exercises.map(exercise => exercise.passed))

          const modulePoints = result.points.modules
            .filter(module => module.max_points > 0 || module.id === 570)
            .map(module => module.points)
          
          const cumulativePoints = Object.keys(modulePoints).map(key => {
            return modulePoints.slice(0, parseInt(key)+1).reduce((sum, val) => {
              return sum + val
            }, 0)
          })

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
                if (projectIndex < newProjects.length && projectIndex > -1) {
                  newProjects[projectIndex] = studentProject
                }
                else {
                  //console.log("Excluding a project from commit data; it was not recognized as submittable exercise:", studentProject);
                }
              })
              newModule.projects = newProjects
              newCommits[moduleIndex] = newModule
            }
          })

          result.commits = newCommits
          studentData.push(result)

          // Map each student's commit data to correct weeks in result data:
          result.commits.forEach(module => {
            const moduleInd = module.module_name === "01-14" ? 14 : (parseInt(module.module_name)-1)

            // Format student data into displayable format:
            const student = {
              id: result.student_id,
              commit_counts: module.projects.map(project => project.commit_count),
              project_names: module.projects.map(project => project.name),
              passed: passedExercises[moduleInd],
              weekPts: modulePoints[moduleInd],
              cumulativePoints: cumulativePoints[moduleInd]
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

      return [helpers.orderCountData(results), studentData]
    })
    .catch(someError => [[], []])

  return request
}

export default { /*getData,*/ getCommitData };
