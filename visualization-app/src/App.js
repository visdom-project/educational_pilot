import React from 'react';
import './App.css';

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const LineChartVisu = ({data}) => {
  return (
    <LineChart width={400} height={400} data={data}>
      <Line class="basic-line" type="monotone" dataKey="uv" />
      <CartesianGrid class="basic-grid" />
      <XAxis dataKey="name" />
      <YAxis />
    </LineChart>
  )
}

function App() {

  const data = [{name: '1', uv: 0, pv: 0, amt: 0},
                {name: '2', uv: 200, pv: 0, amt: 0},
                {name: '3', uv: 300, pv: 0, amt: 0},
                {name: '4', uv: 500, pv: 0, amt: 0}]

  return (
    <div className="App">
      <header className="App-header">
        Visu-App
      </header>
      <LineChartVisu data={data} />
    </div>
  );
}

export default App;
