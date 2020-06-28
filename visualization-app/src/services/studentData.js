import axios from 'axios'

const baseUrl = 'TODO'

const studentData = [
  {
    name: 'Matti Meikäläinen',
    studentId: "123456",
    weeklyPoints: [
      {1: 50},
      {2: 30}, 
      {3: 70}, 
      {4: 95},
      {5: 50},
      {6: 65}
    ]
  },
  {
    name: 'Liisa Leviä',
    studentId: "234567",
    weeklyPoints: [
      {1: 25},
      {2: 25}, 
      {3: 45}, 
      {4: 30},
      {5: 70},
      {6: 70}
    ]
  },
  {
    name: 'Teemu Teekkari',
    studentId: "345678",
    weeklyPoints: [
      {1: 0},
      {2: 10}, 
      {3: 20}, 
      {4: 15},
      {5: 50},
      {6: 30}
    ]
  },
  {
    name: 'Tuija Tarmokas',
    studentId: "456789",
    weeklyPoints: [
      {1: 20},
      {2: 20}, 
      {3: 30}, 
      {4: 50},
      {5: 20},
      {6: 60}
    ]
  }
]

const getWeeks = () => {
  return [1, 2, 3, 4, 5, 6]
}

const getStudentIds = () => {
  // const request = axios.get(baseUrl)
  // return request.then(response => response.data)

  return studentData.map(student => student.studentId)
}

const getAllPoints = () => {
  // Add cumulative weekly points to the student data:
  return studentData.map(student => {
    const newStudent = {...student, 'cumulativePoints': []}

    student.weeklyPoints.map(pointObj => {
      const key = Object.keys(pointObj)[0]
      
      const pointObject = newStudent['cumulativePoints'][key-1] = {}

      // Calculate sums and push them to the cumulativePoints field:
      pointObject[key] = student.weeklyPoints.slice(1, key).reduce(
        (sum, tempPointObj) => {
          return Object.values(tempPointObj)[0] + sum
        }, student.weeklyPoints[0][1]
      )
    })
    return newStudent
  })
  .map((student) => {
    return {
      id: student.studentId, 
      points: student.weeklyPoints,
      cumulativePoints: student.cumulativePoints
    }
  })
}

export default { getStudentIds, getAllPoints, getWeeks };
