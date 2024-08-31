import React from 'react'
import './Navbar.css'

function Navbar() {
  return (
    <>
      <div className="nav">
          <div className="navmain">
            <div className="left">
              <span>GeekPie</span>
            </div>
            <div className="right ">
              <a href="/upload">
                <span>
                  upload
                </span>
              </a>
            </div>
          </div>
      </div>
    </>
  )
}

export default Navbar
