import React from 'react'

const parseName = (name) => {
  const index = name.indexOf("|fi:")
  return name.slice(index+"|fi:".length, name.length-1)
}

const ProjectDisplay = (project) => {

  project = project["project"]

  const exerciseNumber = project.name.split("|")[0]
  const projectGitName = project.project_git_name
  const projectName = parseName(project.name).split("|en:")[0]
  const commitCount = project.commit_count
  const commitHashes = project.commit_meta
  const maxPoints = project.max_points
  const passed = project.passed
  const receivedPts = project.points
  const pointsToPass = project.points_to_pass
  const submissionCount = project.submission_count
  const submissions = project.submissions
  const isGitProject = !projectGitName.includes("(K)")

  return (
    <div className="partial-border" style={{width: "25vw"}}>
      <h3>{exerciseNumber} {projectName}</h3>
      <div style={{paddingLeft: "8vh"}}>
        Gathered points: {receivedPts}/{maxPoints}
        <br></br>
        Exercise passed: {passed ? "true" : "false"}
        <br></br>
        Submissions: {submissionCount}
        <br></br>
        <div style={{ paddingTop: "0.5em",
                      color: isGitProject ? "black" : "lightgrey",
                      fontStyle: isGitProject ? "normal" : "italic"}}>
          Qt project name: {isGitProject ? projectGitName : " –"}
          <br></br>
          Commits: {commitCount}
        </div>
      </div>
    </div>
  )
}

const ModuleDisplay = (data) => {

  data = data["data"]

  const repoFolder = data.commit_module_name
  const moduleName = parseName(data.name)
  const exerciseList = data.exercises
  const maxPoints = data.max_points
  const gatheredPts = data.points
  const passed = data.passed
  const pointsToPass = data.points_to_pass
  const submissionCount = data.submission_count
  const moduleNumber = (data.commit_module_name === "01-14") ? 14 : parseInt(data.commit_module_name)

  const handleClick = () => {
    document.querySelectorAll(`#module-${repoFolder}`).forEach(obj => {
      obj.style.display = obj.style.display === "none" ? "block" : "none"
    })
  }

  return (
    <div className="fit-row" 
         style={{ padding: "0.5em",
                  borderRadius: "0.5em",
                  border: "solid 1px darkgrey",
                  marginBottom: "0.5em",
                  marginLeft: "4vh"}}>

      <button style={{ color: "darkgrey",
                       border: "lightgrey 1px solid",
                       borderRadius: "3px"}}
              onClick={handleClick}>
      </button>

      <div>
        <h3>Module {moduleNumber}: {moduleName}</h3>
        <div id={`module-${repoFolder}`} style={{ paddingLeft: "4vh", marginTop: "1em", marginBottom: "1.2em", width: "25vw"}}>
          Gathered points: {gatheredPts}/{maxPoints}
          <br></br>
          Module passed: {passed ? "true" : "false"}
          <br></br>
          Total submissions: {submissionCount}
        </div>
      </div>

      <div id={`module-${repoFolder}`}>
        <div className="fit-row" style={{flexWrap: "wrap", paddingBottom: "1em"}}>
          {exerciseList.map(exercise => <ProjectDisplay key={exercise.name} project={exercise} />)}
        </div>
      </div>
    </div>
  )
}

const PointsDisplay = (data) => {
  return (
    <div>{
      data["data"].modules.map(module => 
        <ModuleDisplay key={module.commit_module_name} data={module}></ModuleDisplay>
      )}
    </div>
  )
}

const parseStudentData = (studentData) => {

  const commitModules = studentData.commits

  if (commitModules === undefined || studentData.points === undefined) {
    return studentData
  }

  const pointModules = studentData.points.modules.filter(module => module.max_points > 0 || module.id === 570)

  const mergedModules = pointModules
  commitModules.forEach(commitModule => {
    
    const pointModuleIndex = pointModules.findIndex(pointModule => {
      const pointModuleName = (pointModule.name[1] === ".") ? pointModule.name.slice(0, 1) : pointModule.name.slice(0, 2)
      const commitModuleName = (commitModule.module_name === "01-14") ? 14 : parseInt(commitModule.module_name)

      return parseInt(pointModuleName) === commitModuleName
    })

    if (pointModuleIndex > -1) {
      mergedModules[pointModuleIndex]["commit_module_name"] = commitModule.module_name
      const newExercises = mergedModules[pointModuleIndex].exercises
      
      let i = 0
      commitModule.projects.forEach(project => {
        newExercises[i].project_git_name = project.name
        newExercises[i].commit_count = project.commit_count
        newExercises[i].commit_meta = project.commit_meta
        i += 1
      })
      mergedModules[pointModuleIndex].exercises = newExercises
    }
  })

  studentData.points.modules = mergedModules
  delete studentData.commits

  return studentData
}

const StudentDetailView = ({selectedStudentID, students}) => {
  
  const title = "Exercise completion details"

  if (selectedStudentID !== "" && students.length > 0) {
    const studentData = parseStudentData(students.find(student => student.student_id === selectedStudentID))

    return (
      <div style={{marginBottom: document.documentElement.clientHeight*0.1}}>
        <h2>{title}</h2>
        <h3><strong>{studentData.email}</strong>, {selectedStudentID}</h3>
        <PointsDisplay data={studentData.points}></PointsDisplay>
      </div>
    )
  }
  else {
    return (
      <div style={{marginBottom: document.documentElement.clientHeight*0.1}}>
        <h2>{title}</h2>
        <div className="intended">Click a student to view details.</div>
      </div>
    )
  }
}

export default StudentDetailView
