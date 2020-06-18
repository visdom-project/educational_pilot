import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const SubHeader = ({title}) => 
  <header className="App-subheader">{title}</header>

const LineChartVisu = ({data, title}) => {
  return (
    <>
      <SubHeader title={title} />
      <div className="intended">
        <LineChart width={400} height={400} data={data}>
          <Line class="basic-line" type="monotone" dataKey="uv" />
          <CartesianGrid class="basic-grid" />
          <XAxis dataKey="name" />
          <YAxis />
        </LineChart>
      </div>
    </>
  )
}

export default LineChartVisu;
