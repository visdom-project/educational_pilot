const studentToId = (student) => {
  
  const idLength = "123456".length
  const prefixTUT = "tut.fi:"
  const prefixUTA = "uta.fi:"
  const prefixTAMK = "tamk.fi:"

  if (student.includes(prefixTUT)) {
    const startIndex = student.indexOf(prefixTUT) + prefixTUT.length
    return student.slice(startIndex, startIndex + idLength).concat("-TUT")
  }
  else if (student.includes(prefixUTA)) {
    const startIndex = student.indexOf(prefixUTA) + prefixUTA.length
    return student.slice(startIndex, startIndex + idLength).concat("-UTA")
  }
  else if (student.includes(prefixTAMK)) {
    const startIndex = student.indexOf(prefixTAMK) + prefixTAMK.length
    return student.slice(startIndex, startIndex + idLength).concat("-TAMK")
  }
}

const compare = (a, b) => {
  const aVal = a.totPts - a.missed + a.week
  const bVal = b.totPts - b.missed + b.week

  if (aVal < bVal) {
    return -1;
  }
  if (aVal > bVal) {
    return 1;
  }
  return 0;
}

const orderData = (data) => {
  const orderedData = []

  data.forEach(week => {
    orderedData.push({"week": week.week, "data": week.data.sort(compare)})
  });

  return orderedData
}

const compareCounts = (a, b) => {
  const aVal = a.cumulativePoints
  const bVal = b.cumulativePoints

  if (aVal < bVal) {
    return -1;
  }
  if (aVal > bVal) {
    return 1;
  }
  return 0;
}

const orderCountData = (data) => {
  const orderedData = []

  data.forEach(week => {
    orderedData.push({"week": week.week, "data": week.data.sort(compareCounts)})
  });

  return orderedData
}

export default { studentToId, orderData, orderCountData };
