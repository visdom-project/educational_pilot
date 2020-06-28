import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LineChartVisu = ({data, title, keys, axisNames}) => {
  return (
    <>
      <h2>{title}</h2>
      <LineChart width={document.documentElement.clientWidth*0.9} height={250} data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: axisNames[0], position: 'insideBottomRight' }} />
        <YAxis label={{ value: axisNames[1], position: 'insideTopLeft', offset: 15 }}/>
        <Tooltip />
        {keys.map(key => <Line key={key} type="linear" dataKey={key} stroke="#8884d8" />)}
      </LineChart>
    </>
  )
}

export default LineChartVisu;
