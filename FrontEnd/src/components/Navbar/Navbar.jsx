import React from 'react'
import './Navbar.css'

function Navbar() {
  return (
    <>
      <div style={{marginTop:"2vmin"}} className="nav">
          <div className="navmain">
            <div className="left">
              <span style={{marginLeft:"3vmin"}}>GeekPie</span>
            </div>
            <div className="right ">
              <a href="/upload">
                <span>
                  Upload
                </span>
              </a>
            </div>
          </div>
      </div>
    </>
  )
}

export default Navbar
