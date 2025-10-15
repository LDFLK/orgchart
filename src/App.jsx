import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Error404 from "./pages/ErrorBoundaries/screens/404Error";
import { useThemeContext } from "./themeContext";
import TouristGlobe from "./components/statistics_components/TouristGlobe";
import DistrictMap from "./components/statistics_components/DistrictMap";
import XploreGovHomepage from "./pages/XploreGovHome/screens/XploreGovHome";
import Dashboard from "./pages/StatComparison";
import "./index.css";
import XploreDataHomepage from "./pages/XploreGovData/screens/XploreGovData";
import DataLoadingAnimatedComponent from "./pages/SplashPage/screens/dataLoadingAnimatedComponent";
import ShareLinkButton from "./components/ShareLinkButton";

const App = () => {

  const { isDark } = useThemeContext();

  return (
    <div className={isDark ? "dark-mode" : ""}>
      <Router>
        <Routes>
          <Route path="/" element={<XploreGovHomepage />} />
          <Route path="/orgchart" element={<DataLoadingAnimatedComponent mode="orgchart" />} />
          <Route path="/statistics" element={<Dashboard />} />
          <Route path="*" element={<Error404 />} />
          <Route path="/globe" element={<TouristGlobe />} />
          <Route path="/map" element={<DistrictMap />} />
          <Route path="/xploredata" element={<XploreDataHomepage />} />
          <Route path="/person-profile/:personId" element={<DataLoadingAnimatedComponent mode="person-profile" />} />
          <Route path="/department-profile/:departmentId" element={<DataLoadingAnimatedComponent mode="department-profile" />} />
        </Routes>
      </Router>
      {/* <div
        style={{
          position: "fixed",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
        }}
      >
        <ShareLinkButton />
      </div> */}
    </div>
  );
}

export default App
