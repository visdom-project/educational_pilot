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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
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
    cumulativeMaxes: [30, 130, 240, 335, 395, 485, 540, 610, 700, 740, 795, 915, 1020, 1050, 1050, 1060],
    cumulativePoints: {},
    weeklyAvgs: [],
    weeklyMins: [],
    weeklyMids: []
  }
]

const getWeeks = () => {
  const data = progressData
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

const calcAvgs = (data) => {
  const weeks = getWeeks()
  const avgs = new Array(weeks.length).fill(0)
  const midExpected = [30, 100, 77, 83, 37, 70, 45, 41, 74, 40, 40, 120, 5, 30, 0, 0]
  const minExpected = [30, 100, 30, 40, 30, 80,  0, 30, 36, 25,  0,   0, 0, 30, 0, 0]
  
  // Calculate weekly averages:
  weeks.forEach(week => {
    data.forEach(student => {
      avgs[week-1] += student.weeklyPoints[week]
    })
    avgs[week-1] = Math.round(avgs[week-1] / data.length)
  })

  data.forEach(student => {
    student.weeklyAvgs = avgs
    student.weeklyMins = minExpected
    student.weeklyMids = midExpected

    student.cumulativeAvgs = helpers.calcCumulatives(avgs)
    student.cumulativeMinExpected = helpers.calcCumulatives(minExpected)
    student.cumulativeMidExpected = helpers.calcCumulatives(midExpected)
  })
  
  return data
}

const dataByWeeks = (data) => {
  return getWeeks().map(week => {
    const newData = data.map(student => {
      return {
        id: student.id,
        maxPts: student.cumulativeMaxes[week-1],
        totPts: student.cumulativeMaxes[week-1] - student.weeklyMaxes[week-1],
        week: student.cumulativeMaxes[week-1] - student.weeklyMaxes[week-1] + student.weeklyPoints[week],
        missed: (student.cumulativeMaxes[week-2] || 0) - (student.cumulativePoints[week-1] || 0),
        avg: student.cumulativeAvgs[week-1],
        mid: student.cumulativeMidExpected[week-1],
        min: student.cumulativeMinExpected[week-1],
        tooltipWeek: student.weeklyPoints[week],
        tooltipWeekTot: student.weeklyMaxes[week-1],
        tooltipCPts: student.cumulativePoints[week],
        tooltipCPtsTot: student.cumulativeMaxes[week-1]
      }
    })
    return {week: week, data: newData}
  })
}

const getProgressData = () => {
  const data = calcAvgs(calcCumulativePoints(progressData))
  console.log(data);
  
  return dataByWeeks(data)
}

export default { getStudentIds, getWeeks, getProgressData };
