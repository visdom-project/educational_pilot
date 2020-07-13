import React from 'react'
import service from '../services/helpers'

const StudentSelector = ({students, handleClick}) => {
  return (
    <>
      <h2>Selected students</h2>
      <ul style={{columns: Math.round(students.length / 20 + 1), width: "fit-content"}}>
        {students.map(student =>
          <li key={service.studentToId(student)}
              onClick={() => handleClick(service.studentToId(student))}
              id={`li-${service.studentToId(student)}`}>
            {student}
          </li>)}
      </ul>
    </>
  )
}

export default StudentSelector
