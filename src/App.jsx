import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Error404 from "./components/404Error";
import './animations.css';
import './components/TidyTree.variables.css';
import './components/TidyTree.css';
import { useThemeContext } from "./themeContext";
import DataLoadingAnimatedComponent from "./pages/dataLoadingAnimatedComponent";

const App = () => {

  const {isDark} = useThemeContext();
  
  return(
    <div className={isDark ? "dark-mode" : ""}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orgchart" element={<DataLoadingAnimatedComponent mode="orgchart"/>} />
        <Route path="/statistics" element={<DataLoadingAnimatedComponent mode="statistics"/>}/>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App
