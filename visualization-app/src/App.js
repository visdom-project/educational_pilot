import React, { useState } from 'react';
import './App.css';

import Header from './components/Header'
import StatusTab from './components/StatusTab'
import StudentTab from './components/StudentTab'
import ProgressTab from './components/ProgressTab'
import ResultTab from './components/ResultTab'
import CoursesTab from './components/CoursesTab'

const VisuTab = ({tabs, visuIndex}) =>
  <>{tabs[visuIndex].visu}</>

function App() {

  const [currentTab, setCurrentTab] = useState(0)

  const tabs = [
    { name: 'Status view', 
      visu: <StatusTab />
    },
    { name: 'Student view',
      visu: <StudentTab />
    },
    { name: 'Progress view',
      visu: <ProgressTab />
    },
    { name: 'Result view',
      visu: <ResultTab />
    },
    { name: 'Course view',
      visu: <CoursesTab />
    }
  ]

  // Handle switching between tabs:
  const handleClick = (name) =>
    setCurrentTab(tabs.findIndex(tab => tab.name === name))

  return (
    <div className="App">
      <Header tabs={tabs} handleClick={handleClick}/>
      <VisuTab tabs={tabs} visuIndex={currentTab} />
    </div>
  );
}

export default App;
