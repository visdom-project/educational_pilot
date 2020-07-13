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

export default { studentToId };
