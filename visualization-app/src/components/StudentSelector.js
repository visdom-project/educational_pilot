import React from 'react'

const StudentSelector = ({students, handleClick}) => {
  return (
    <div style={{marginLeft: "3em", marginTop: "0em"}}>
      <ul style={{columns: Math.round(students.length / 20) +1,
                  width: "fit-content",
                  listStyleType: "none",
                  marginTop: "0em",
                  borderLeft: "1px lightgrey solid"}}>
        {students.map(student =>
          <li key={student}
              onClick={() => handleClick(student)}
              id={`li-${student}`}>
            {student}
          </li>)}
      </ul>
    </div>
  )
}

export default StudentSelector
