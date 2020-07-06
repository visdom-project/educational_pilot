//import axios from 'axios'
import helpers from './helpers'
//const baseUrl = 'TODO'

const progressData = [
  {
    name: 'Matti Meikäläinen',
    id: "123456",
    weeklyPoints: {1: 30, 2: 90, 3: 55, 4: 90, 5: 40, 6: 55, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    maxPts: 695,
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  },
  {
    name: 'Liisa Leviä',
    id: "234567",
    weeklyPoints: {1: 30, 2: 50, 3: 30, 4: 55, 5: 40, 6: 50, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    maxPts: 695,
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  },
  {
    name: 'Teemu Teekkari',
    id: "345678",
    weeklyPoints: {1: 0, 2: 10, 3: 20, 4: 15, 5: 50, 6: 30, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    maxPts: 695,
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  },
  {
    name: 'Tuija Tarmokas',
    id: "456789",
    weeklyPoints: {1: 20, 2: 20, 3: 30, 4: 50, 5: 20, 6: 40, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    maxPts: 695,
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  },
  {
    name: "Jaska Jokunen",
    id: "567890",
    maxPts: 695,
    weeklyPoints: {1: 20, 2: 80, 3: 68, 4: 41, 5: 50, 6: 10, 7: 6, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  },
  {
    id: "678901",
    maxPts: 695,
    weeklyPoints: {1: 30, 2: 100, 3: 110, 4: 41, 5: 0, 6: 72, 7: 5, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  },
  {
    id: "789012",
    maxPts: 695,
    weeklyPoints: {1: 30, 2: 100, 3: 110, 4: 30, 5: 60, 6: 90, 7: 5, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0},
    weeklyMaxes: [30, 100, 110, 95, 60, 90, 55, 70, 90, 40, 55, 120, 105, 30, 0, 10],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  }
]

const calcWeeks = (data) => {
  if (data.length > 0 && data[0].weeklyPoints !== undefined) {
    return [...Object.keys(data[0].weeklyPoints)]
  }
  else {
    console.log("progressData.js::calcWeeks(): data does not contain non-empty field: weeklyPoints!");
    return []
  }
}

const calcCumulativePoints = (data) => {
  if (data.length > 0 && data[0].weeklyPoints !== undefined) {
    
    // Calculate weekly cumulative sum of points for each student:
    data.forEach(student => {
      let sum = 0
      Object.keys(student.weeklyPoints).forEach(week => {
        sum += student.weeklyPoints[week]
        student.cumulativePoints[week] = sum
      })
    });
  
  } else { console.log("progressData.js::calcCumulativePoints(): data does not contain non-empty field: weeklyPoints!");}

  return data
}

const getStudentIds = () => {
  // const request = axios.get(baseUrl)
  // return request.then(response => response.data)
  return progressData.map(student => student.id)
}

const getWeeklyProgressPoints = (avgDataKey) => {
  const pointData = calcCumulativePoints(progressData)
  const weeks = calcWeeks(pointData)
  const ids = getStudentIds()

  const [pointsByWeek, cumulativePointsByWeek] = helpers.pointsByWeek(pointData, weeks)

  const weekAvgs = helpers.calculateWeeklyAvgs(pointsByWeek, ids)
  const weekCumulativeAvgs = helpers.calculateWeeklyAvgs(cumulativePointsByWeek, ids)
  
  const catenatedpointsByWeek = helpers.catenateAvgsToPts(pointsByWeek, weekAvgs)
  const catenatedCumulative = helpers.catenateAvgsToPts(cumulativePointsByWeek, weekCumulativeAvgs, avgDataKey)

  return [catenatedpointsByWeek, catenatedCumulative]
}

export default { getStudentIds, getWeeklyProgressPoints };
