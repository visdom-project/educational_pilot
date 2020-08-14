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

export default { orderData, orderCountData };
