import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
  ReferenceArea,
  Label
} from "recharts";
import pulseData from "../services/pulseData"
import DropdownMenu from "./DropdownMenu"

const moment =require("moment")

export const StudentList = ({setStudentID, studentID}) => {
  const [studentData, setStudentData] = useState([]);
  const student = studentData.find(item => item.student_id === studentID);
  useEffect(
    () => {
      pulseData
        .getAllStudentData()
        .then(res => setStudentData(res))
        .catch(err => console.log(err))
    }, [])
  return(
    <div className="fit-row">
      <DropdownMenu handleClick={setStudentID}
                    options={studentData.map(student => student.student_id)}
                    selectedOption={studentID}
                    title={"Chosen student:"} />
      { student &&
        <div>
          <tr>
            <td><em><b>Full name:  </b></em></td>
            <td>{student.fullname}</td>
          </tr>
          <tr>
            <td><em><b>Username:  </b></em></td>
            <td>{student.username}</td>
          </tr>
          <tr>
            <td><em><b>Email:  </b></em></td>
            <td>{student.email}</td>
          </tr>
        </div>
      };
    </div>
  )
}

export const PulseVisu = () => {
  const [studentID, setStudentID] = useState("0b8d8568b1e23b1eb116");
  const [data, setData] = useState([]);
  const [courseTime, setCourseTime] = useState([]);

  const tickPosition = (tickProps) => {
    const { x, y, payload } = tickProps;
    const { value, offset } = payload;

    console.log(value)

    const isLast = value === courseTime[1] - 1;

    const pathX = Math.floor(isLast ? x + offset : x - offset) + 3;

    return <path d={`M${pathX + 15},${y - 4}v${-35}`} stroke="RED" />;
  }

  const datePosition = (tickProps) => {
    const { x, y, payload } = tickProps;
    const { value, offset } = payload;
    return <text angle={-90} x={x} y={y - 4} textAnchor="middle">{value}</text>;
  }

  // const [preferenceArea, setPreferenceArea] = useState({data: data,
  //                                                       left: "dataMin",
  //                                                       right:"dataMax",
  //                                                       refLeft: "",
  //                                                       refRight: "",
  //                                                       top: "dataMax + 1",
  //                                                       bottom: "dataMin",
  //                                                       animation: true
  //                                                     });
  
  // const getAxisYDomain = (from, to, ref, offset) => {
  //   console.log(from)
  //   console.log(to)
  //   console.log(data.slice())
  //   const refData = data.slice(from - 1, to);
  //   console.log(refData);
  //   if (refData) {
  //     const total = ref.reduce((a,b) => refData[0][a] + refData[0][b], 0);
  //     let [bottom, top] = [total, total];
  //     refData.forEach(d => {
  //       if (d[ref] > top) top = ref.reduce((a,b) => d[a] + d[b], 0);
  //       if (d[ref] < bottom) bottom = ref.reduce((a,b) => d[a] + d[b], 0);
  //     });
    
  //     return [(bottom | 0) - offset, (top | 0) + offset];}
  //   return [null, null]
  // };

  // const zoomIn = () => {
  //   let tempRefLeft = preferenceArea.refLeft;
  //   let tempRefRight = preferenceArea.refRight;
  //   if (tempRefLeft === tempRefRight 
  //       || tempRefRight === "") {
  //     setPreferenceArea({...preferenceArea, refLeft: "", refRight: ""});
  //     return;
  //   } 
  //   if (tempRefLeft > tempRefRight) {
  //      const tempValue = tempRefRight;
  //      tempRefRight = tempRefLeft;
  //      tempRefLeft = tempValue;
  //   }
  //   let [tempTop, tempBot] = getAxisYDomain(tempRefLeft, tempRefRight, ["earlyCommit", "inTimeCommit", "lateCommit"], 1);
  //   setPreferenceArea({...preferenceArea, data: data.slice(),
  //                                         left: tempRefLeft,
  //                                         right: tempRefRight,
  //                                         refLeft: "",
  //                                         refRight: "",
  //                                         top: tempTop,
  //                                         bottom: tempBot})
    
  // }

  // const zoomOut = () => {
  //   setPreferenceArea({...preferenceArea, data: data.slice(),
  //                                         left: "dataMin",
  //                                         right:"dataMax",
  //                                         refLeft: "",
  //                                         refRight: "",
  //                                         top: "dataMax + 1",
  //                                         bottom: "dataMin"});
  // }

  useEffect(
    () => {
      pulseData
        .getData(studentID)
        .then(response => {setData(response[0]); setCourseTime(response[1])})
        .catch(err => console.log(err))
    }, [studentID])
    // console.log(data)
    // console.log(courseTime)

  return (
    <div>
      <StudentList setStudentID={setStudentID} studentID={studentID}/>
      {/* <ResponsiveContainer width="100%" height={document.documentElement.clientHeight * 0.5}> */}
      {/* <button className="zoom-out-btn" onClick={zoomOut}>
        Zoom Out
      </button> */}
        <BarChart
          width={document.documentElement.clientWidth * 0.9}
          height={document.documentElement.clientHeight * 0.5 + 150}
          margin={{ top: 10, right: 15, left: 25, bottom: 100 }}
          data={data}
          // onMouseDown={e => setPreferenceArea({...preferenceArea, refLeft: e.activeLabel })}
          // onMouseMove={e =>
          //   preferenceArea.refLeft &&
          //   setPreferenceArea({...preferenceArea, refRight: e.activeLabel })
          // }
          // onMouseUp={zoomIn}
        >
          <CartesianGrid horizontal={false} />
          <XAxis 
            dataKey="dateInSecond"
            tickFormatter={(tickItem)=>moment(tickItem*(1000*60*60*24)).format('ddd MMM Do')} 
            angle={-90}
            textAnchor="end"
            scale="time"
            tickCount={7}
            interval={0}
            // tickLine={false}
            // tick={datePosition}
            // scale="band"
          />
          {/* <XAxis
            dataKey="dateInSecond"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={tickPosition}
            height={1}
            scale="band"
            xAxisId="quarter"
          /> */}
          <YAxis allowDataOverflow={true}/>
          <Tooltip labelFormatter={(label => moment(label*(1000*60*60*24)).format('ddd MMM Do'))}/>
          <Bar 
            dataKey="earlyCommit" 
            stackId="a" 
            fill="#74ee15" 
            barSize={15}/>
          <Bar 
            dataKey="inTimeCommit" 
            stackId="a" 
            fill="#ffe700" 
            barSize={15}/>
          <Bar 
            dataKey="lateCommit" 
            stackId="a" 
            fill="#e0301e" 
            barSize={15}/>
{/*           
          {(preferenceArea.refLeft && preferenceArea.refRight) && (
            <ReferenceArea
              // yAxisId="1"
              x1={preferenceArea.refLeft}
              x2={preferenceArea.refRight}
              strokeOpacity={0.3}
            />
          )} */}
          {/* <Legend iconSize={0.1} iconType='wye' /> */}
          <Brush
            tickFormatter={(tickItem)=>moment(tickItem*(1000*60*60*24)).format('ddd MMM Do')}
            y={document.documentElement.clientHeight * 0.5 + 120}
            height={25} 
            stroke="#8884d8"/>
        </BarChart>
      {/* </ResponsiveContainer> */}
    </div>
  );
}
