// Home.js
import React from "react";
import "./Home.css";
import Globe from "react-globe.gl";
import moonTexture from "../../Image/moon.jpeg"; // Use your downloaded image

function Home() {
  return (
    <>
      <div className="mainpage">
        <div className="page1">
          <div style={{ width: "100vw", height: "100vh" }}>
            <Globe
              globeImageUrl={moonTexture}
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            />
          </div>
          {/* Add text content here */}
          <div className="page1-content">
            <h1>Welcome to the Moon</h1>
            <p>Explore the lunar surface in detail!</p>
          </div>
        </div>

        <div className="page2">
          <span>Page 2</span>
        </div>
        <div className="page3">
          <span>Page 3</span>
        </div>
        <div className="page4">
          <span>Page 4</span>
        </div>
      </div>
    </>
  );
}

export default Home;
