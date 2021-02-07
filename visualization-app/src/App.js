import React, { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import StatusTab from "./components/StatusTab";
import StudentTab from "./components/StudentTab";
import ProgressTab from "./components/ProgressTab";
import ResultTab from "./components/ResultTab";
import CoursesTab from "./components/CoursesTab";
import Footer from "./components/Footer";

const VisuTab = ({ tab }) => {
  return (
    <div className="view">
      <h1>{tab.name}</h1>
      {tab.visu}
    </div>
  );
}

/**
 * App component manages which view aka. "tab" the user sees. 
 * Views are components, too, but only one of the is displayed 
 * at a time.
 *
 * Switching betweeen views happens by the user clicking on
 * a button in the navigation panel shown in the upper edge of 
 * the page.
 *
 * Once a view is selected, the application tries to render it.
 */
function App() {
  const [ currentTab, setCurrentTab ] = useState(0)

  const tabs = [
    { name: 'Status view', visu: <StatusTab /> },
    { name: 'Progress view', visu: <ProgressTab /> },
    { name: 'Student view', visu: <StudentTab /> },
    { name: 'Result view', visu: <ResultTab /> },
    { name: 'Course view', visu: <CoursesTab /> },
  ]

  // Handle switching between tabs:
  const handleClick = (name) =>
    setCurrentTab(tabs.findIndex(tab => tab.name === name))

  return (
    <div className="App">
      <Header tabs={tabs} handleClick={handleClick}/>
      <VisuTab tab={tabs[currentTab]} visuIndex={currentTab} />
      <Footer />
    </div>
  );
}

export default App;
