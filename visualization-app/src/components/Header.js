import React from 'react'

const Tab = ({tabInfo, handleClick}) => {
  return (
    <button className="Header-button"
            onClick={() => handleClick(tabInfo.name)}>
      {tabInfo.name}
    </button>
  )
}

const Header = ({tabs, handleClick}) => {
  return (
    <header className="App-header">
      <p>Visu-App</p>
      {tabs.map(tab => <Tab key={tab.name} tabInfo={tab} handleClick={handleClick}/>)}
    </header>
  )
}

export default Header