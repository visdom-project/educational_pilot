import React from 'react'

const StudentSelector = ({students, handleClick}) => {
  return (
    <>
      <h2>Selected students</h2>
      <ul style={{columns: Math.round(students.length / 20 + 1), width: "fit-content"}}>
        {students.map(student =>
          <li key={student}
              onClick={() => handleClick(student)}
              id={`li-${student}`}>
            {student}
          </li>)}
      </ul>
    </>
  )
}

export default StudentSelector
