import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from '../src/components/Navbar/Navbar'
import Home from '../src/pages/Home/Home'
import Upload from '../src/pages/Upload/Upload'
import Footer from '../src/components/Footer/Footer'


function App() {
  return (
    <>
      <Router>
        <div className="fixed-top">
          <Navbar />
        </div>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/upload" element={<Upload />}></Route>
        </Routes>
        <div className="fixed-bottom">
          <Footer />
        </div>
      </Router>
    </>
  )
}

export default App
