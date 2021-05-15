import axios from "axios"
import { SERVER_URL }from "./constants.js";

const getStudentData = () => {

  const request = axios
    .get( `${SERVER_URL}/gitlab-course-40-commit-data-anonymized/_search`,
          {Accept: 'application/json', 'Content-Type': 'application/json' })
    .then((response) => {
      
      const resResult = response.data.hits.hits[0]._source.results
      const projects = resResult.reduce((project, e) => e.points.modules.length > project.length ? e.points.modules : project, []);
      const PROJECT_MAPPING = {}
      const pattern = /^[0-9]+/
      const exercisePattern = /en\:[^\n]*/
      projects.forEach(project => {
        const match = pattern.exec(project.name)[0];
        const exercises = project.exercises.map(exercise => {
          const exerciseName = exercisePattern.exec(exercise.name)[0];
          return exerciseName.slice(3, exerciseName.length - 1);        
        });
        PROJECT_MAPPING[match] = exercises;
      })
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
                  //console.error("Excluding a project from commit data; it was not recognized as submittable exercise:", studentProject);
                }
              })
              newModule.projects = newProjects
              newCommits[moduleIndex] = newModule
            }
          })

          result.commits = newCommits
          studentData.push(result)
        })
      })

      return studentData
    })
    .catch(someError => [[], []])

  return request
}

export default { getStudentData };
