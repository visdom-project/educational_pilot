import React from 'react'
import { ComposedChart, XAxis, YAxis, CartesianGrid, Area, Bar, Cell, ReferenceLine } from 'recharts';

const StudentProgressChart = ({selectedStudentID}) => {

  return (
    <div className="intended" style={{display: "flex", flexDirection:"column"}}>
      Student Progress Chart for {selectedStudentID}
    </div>
  )
}

export default StudentProgressChart
