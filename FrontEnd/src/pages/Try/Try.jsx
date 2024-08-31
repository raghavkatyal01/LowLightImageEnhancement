import React, { useEffect, useState } from "react";
import "./Try.css";
import stars from "../../assets/stars.jpg";
import stars1 from "../../assets/stars.png";
import scroll from "../../Image/scroll.jpg"; 
import clouds from "../../assets/clouds.png";
import moon from "../../assets/moon.png";
import ModelViewer from "../../components/crat3d/ModelViewer";

function Try() {
  const [isButton, setIsButton] = useState(false);
  const scrollToSection = () => {
    const section = document.getElementById('page_2');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const page1 = document.querySelector('.page_1');
      const page2 = document.querySelector('.page_2');
      const moonElement = document.querySelector('.moon');
      const page1Height = page1.clientHeight;
      const page2Top = page2.getBoundingClientRect().top;
      const scrollPosition = window.scrollY;

      // Limit scroll effect to page_1 only
      if (scrollPosition <= page1Height) {
        const scale = 1 - (scrollPosition / (page1Height * 1.2)); // Slow down the rate of scaling
        moonElement.style.width = `${50 * Math.max(scale, 0.2)}vw`; // Ensure moon doesn't disappear, min scale 0.2
      }

      // Check if the moon has reached the bottom of page_2
      if (page2Top <= window.innerHeight) {
        setIsButton(true); // Convert moon to button
        moonElement.style.pointerEvents = 'auto'; // Enable clickability when at the bottom
      } else {
        setIsButton(false); // Keep moon as an image
        moonElement.style.pointerEvents = 'none'; // Disable clickability while scrolling
      }
    };

    const handleMoonClick = () => {
      if (isButton) {
        window.location.href = '/upload'; // Redirect to the /upload route
      }
    };

    window.addEventListener('scroll', handleScroll);

    const moonElement = document.querySelector('.moon');
    moonElement.addEventListener('click', handleMoonClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      moonElement.removeEventListener('click', handleMoonClick);
    };
  }, [isButton]);

  return (
    <>
      <div className="main">
        <div className="page_1">
          <div className="stars">
            <img src={stars} alt="stars" />
          </div>
          <div className="cloud">
            <img src={clouds} alt="clouds" />
            <img src={clouds} alt="clouds" />
          </div>
          <button className={`moon ${isButton ? 'moon-button' : ''}`}>
            <img src={moon} alt="moon" />
          </button>
          <div className="text-container">
            <p className="heading">
            The Moon is magic for the soul and light for the senses..
            </p>
            
          </div>
          <button
            onClick={scrollToSection}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "10px 10px",
              backgroundColor: "Transparent",
              color: "white",
              border: "none",
              borderRadius: "545px",
              cursor: "pointer",
              zIndex: "5"
            }}
          >
            <img
              src={scroll}
              alt="Scroll to Section"
              style={{ width: "50px", height: "50px" }}
            />
          </button> 
        </div>

        <div id="page_2" className="page_2">
          {/* Content for page 2 */}
          <div style={{ width: '40vw', height: '30vh', zIndex:'10'}}>
          </div>
          <div className="stars1">
            <img src={stars1} alt="stars" />
            
          </div>
        </div>
        

      </div>
    </>
  );
}

export default Try;
