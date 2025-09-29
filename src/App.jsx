import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Error404 from "./components/404Error";
import './animations.css';
import './components/TidyTree.variables.css';
import './components/TidyTree.css';
import { useThemeContext } from "./themeContext";
import DataLoadingAnimatedComponent from "./pages/dataLoadingAnimatedComponent";
import TouristGlobe from "./components/statistics_components/TouristGlobe";
import DistrictMap from "./components/statistics_components/DistrictMap";
import XploreGovHomepage from "./pages/XploreGovHome";
import YearRangeSelector from "./components/common_components/Timeline";
import Dashboard from "./pages/StatComparison";
import XploreDataHomepage from "./pages/XploreGovData";

const App = () => {

  const {isDark} = useThemeContext();
  
  return(
    <div className={isDark ? "dark-mode" : ""}>
    <Router>
      <Routes>
        <Route path="/" element={<XploreGovHomepage />} />
        <Route path="/orgchart" element={<DataLoadingAnimatedComponent mode="orgchart"/>} />
        {/* <Route path="/statistics" element={<DataLoadingAnimatedComponent mode="statistics"/>}/> */}
        <Route path="/statistics" element={<Dashboard/>}/>
        <Route path="*" element={<Error404 />} />
        <Route path="/globe" element={<TouristGlobe/>}/>
        <Route path="/map" element={<DistrictMap/>}/>
        <Route path="/timeline" element={<YearRangeSelector/>}/>
        <Route path="/xploredata" element={<XploreDataHomepage/>}/>
        <Route path="/person-profile/:personId" element={<DataLoadingAnimatedComponent mode="person-profile"/>}/>
      </Routes>          
    </Router>
    </div>
  );
}

export default App
