import React, { useEffect, useState } from "react";
import "./Try.css";
import stars from "../../assets/stars.jpg";
import stars1 from "../../assets/stars.png";
import scroll from "../../Image/scroll.jpg";
import clouds from "../../assets/clouds.png";
import moon from "../../assets/moon.png";


function Try() {
  const [isButton, setIsButton] = useState(false);

  const scrollToSection = () => {
    const section = document.getElementById("page_2");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const page1 = document.querySelector(".page_1");
      const page2 = document.querySelector(".page_2");
      const moonElement = document.querySelector(".moon");
      const page1Height = page1.clientHeight;
      const page2Top = page2.getBoundingClientRect().top;
      const scrollPosition = window.scrollY;

      if (scrollPosition <= page1Height) {
        const scale = 1 - scrollPosition / (page1Height * 1.2);
        moonElement.style.width = `${50 * Math.max(scale, 0.2)}vw`;
      }

      if (page2Top <= window.innerHeight) {
        setIsButton(true);
        moonElement.style.pointerEvents = "auto";
      } else {
        setIsButton(false);
        moonElement.style.pointerEvents = "none";
      }
    };

    const handleMoonClick = () => {
      if (isButton) {
        window.location.href = "/upload";
      }
    };

    window.addEventListener("scroll", handleScroll);

    const moonElement = document.querySelector(".moon");
    moonElement.addEventListener("click", handleMoonClick);

    // Intersection Observer for slide-in effect
    const slideImages = document.querySelectorAll(".slide-left, .slide-right");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("slide-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    slideImages.forEach((img) => observer.observe(img));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      moonElement.removeEventListener("click", handleMoonClick);
      slideImages.forEach((img) => observer.unobserve(img));
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
          <button className={`moon ${isButton ? "moon-button" : ""}`}>
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
              zIndex: "5",
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
          <div className="stars1">
            <img src={stars1} alt="stars" />
          </div>
          {/* Updated images for sliding animation */}
          <img className="slide-left" src={moon} alt="Image sliding in from left" />
          <img className="slide-right" src={clouds} alt="Image sliding in from right" />
        </div>
      </div>
    </>
  );
}

export default Try;
