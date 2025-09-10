import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Error404 from "./components/404Error";
import Navbar from "./components/NavBar";
import './animations.css';
import './components/TidyTree.variables.css';
import './components/TidyTree.css';
import { useThemeContext } from "./themeContext";
import DataLoadingAnimatedComponent from "./pages/dataLoadingAnimatedComponent";
import TouristGlobe from "./components/TouristGlobe";
import DistrictMap from "./components/DistrictMap";

const App = () => {

  const {isDark} = useThemeContext();
  
  return(
    <div className={isDark ? "dark-mode" : ""}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orgchart" element={<DataLoadingAnimatedComponent/>} />
        <Route path="*" element={<Error404 />} />
        <Route path="/globe" element={<TouristGlobe/>}/>
        <Route path="/map" element={<DistrictMap/>}/>
      </Routes>
    </Router>
    </div>
  );
}

export default App
