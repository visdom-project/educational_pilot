import React from 'react'

const Tab = ({tabInfo}) => {
  return (
    <button className="Header-button" onClick={() => console.log(`click from ${tabInfo.name}!`)}>{tabInfo.name}</button>
  )
}

const Header = ({tabs}) => {
  return (
    <header className="App-header">
      <p>Visu-App</p>
      {tabs.map(tab => <Tab key={tab.name} tabInfo={tab}/>)}
    </header>
  )
}

export default Header