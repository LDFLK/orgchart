import { useEffect, useRef } from "react";
import {
  MessageCircle,
  Users,
  ChevronRight,
  Building2,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./../index.css";
import Version from "./version";
import "../assets/chatbotCSS.css";
import ForceGraph3D from "react-force-graph-3d";
import { colors } from "@mui/material";

export function genRandomTree(N = 200, reverse = false) {
  return {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        [reverse ? "target" : "source"]: id,
        [reverse ? "source" : "target"]: Math.round(Math.random() * (id - 1)),
      })),
  };
}

const Home = () => {
  const svgRef = useRef();
  const navigate = useNavigate();

  const graphData = genRandomTree();

  const distance = 1400;
  useEffect(() => {
    svgRef.current.cameraPosition({ z: distance });

    // camera orbit
    let angle = 0;
    setInterval(() => {
      svgRef.current.cameraPosition({
        x: distance * Math.sin(angle),
        z: distance * Math.cos(angle),
      });
      angle += Math.PI / 300;
    }, 10);
  }, []);

  const handleExplore = ({ mode = "orgchart" }) => {
    if (mode == "orgchart") {
      navigate("/orgchart");
    } else if (mode == "statistics") {
      navigate("/statistics");
    }
  };

  return (

    <div className="relative min-h-screen">
      {/* Background ForceGraph3D */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <ForceGraph3D
          ref={svgRef}
          graphData={graphData}
          enableNodeDrag={false}
          enableNavigationControls={false}
          showNavInfo={false}

        />
      </div>
      {/* Overlay content */}
      <div className="relative z-10 min-h-screen px-6 overflow-x-hidden bg-gray-950/50">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="relative">

            {/* OpenGIN logo*/}
            <div className="absolute top-0 left-0 p-4 z-10">
              <h1 className="text-3xl font-bold text-white">
                Open
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GIN
                </span>
              </h1>
            </div>

            {/* Hero Section */}
            <div className="text-center pt-18">
              <Version />
              <h2 className="text-5xl font-bold text-white mb-6">
                Open{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  General Information Network
                </span>
              </h2>
              <h2 className="text-3xl font-bold text-white mb-6">
                Sri Lanka
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Understand your role, track policy implementations, and collaborate
                effectively with GovTrack
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-1">

            <div
              className="rounded-2xl p-6 bg-gray-950/70 shadow-2xl hover:scale-101 transition-transform duration-300 relative overflow-hidden"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,255,255,0.4), 0 1px 3px rgba(0,123,255,0.3), 0 1px 3px rgba(128,0,255,0.2)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-6 text-left">
                <div>
                  <span>Orgchart</span>
                  <br />
                  <span className="text-sm font-normal text-gray-400">
                    Navigate versions of organisational structures
                  </span>
                </div>
              </h3>

              <div className="space-y-3">
                {/* Ministry Level */}
                <div className="bg-gradient-to-r from-blue-950/40 to-blue-900/40 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-white">Ministry Level</h4>
                      <p className="text-sm text-gray-300">3 Active Ministries</p>
                    </div>
                  </div>
                </div>

                {/* Department Level */}
                <div className="bg-gradient-to-r from-purple-950/40 to-purple-900/40 rounded-lg p-4 border-l-4 border-purple-400">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-semibold text-white">Department Level</h4>
                      <p className="text-sm text-gray-300">8 Active Departments</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-black/50 rounded-lg p-3 mt-4 border border-gray-800/40">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-cyan-400">23</p>
                      <p className="text-xs text-gray-400">Total Ministries</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-400">847</p>
                      <p className="text-xs text-gray-400">Active Departments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/*Button */}
              <div className="flex justify-center mt-6">
                <a
                  href="/orgchart"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-1 rounded-full text-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 border border-cyan-400/20"
                >
                  Orgchart
                </a>
              </div>
            </div>


            {/* Card 2 */}
            <div
              className="rounded-2xl p-6 bg-gray-950/70 shadow-2xl hover:scale-101 transition-transform duration-300 relative overflow-hidden"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,255,255,0.4), 0 1px 3px rgba(0,123,255,0.3), 0 1px 3px rgba(128,0,255,0.2)",
              }}
            >
              <div className="flex flex-col items-start space-y-4 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white text-left">
                  <span>Xplore</span>
                  <br />
                  <span className="text-sm font-normal text-gray-400">
                    Compare data across various categories
                  </span>
                </h3>

                <img
                  src="src/assets/animatedChart.gif"
                  alt="Animated illustration"
                  className="w-full h-auto rounded-xl"
                />
              </div>

              {/* Button */}
              <div className="flex justify-center mt-6">
                <a
                  href="/statistics"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-1 rounded-full text-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 border border-cyan-400/20"
                >
                  Xplore
                </a>
              </div>
            </div>


            {/* <div className="bg-gray-950/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-800/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              <span>AI Assistant</span>
            </h3>

            <div className="space-y-3 mb-4 h-80 overflow-y-auto chat-scrollbar pr-2">
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-lg max-w-xs shadow-lg">
                  <p className="text-sm">
                    Who is the current Prime Minister of Sri Lanka?
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 p-3 rounded-lg max-w-xs shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">
                    The current Prime Minister of Sri Lanka is
                    <span className="font-semibold text-cyan-400">
                      Ranil Wickremesinghe
                    </span>
                    . He has been serving in this position and is leading the
                    government's administrative functions.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-lg max-w-xs shadow-lg">
                  <p className="text-sm">
                    What are the main ministries under his administration?
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 p-3 rounded-lg max-w-xs shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">
                    The main ministries include
                    <span className="text-blue-400 font-semibold">Finance</span>
                    <span className="text-purple-400 font-semibold">
                      Health
                    </span>
                   
                    <span className="text-green-400 font-semibold">
                      Education
                    </span>
                    
                    <span className="text-orange-400 font-semibold">
                      Defense
                    </span>
                    
                    <span className="text-pink-400 font-semibold">
                      Foreign Affairs
                    </span>
                    , and several others. Each ministry manages specific sectors
                    of governance.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-lg max-w-xs shadow-lg">
                  <p className="text-sm">
                    How many departments are there in total?
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 p-3 rounded-lg max-w-xs shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">
                    Based on the current structure, there are approximately
                    <span className="text-yellow-400 font-bold">
                      120+ departments
                    </span>
                    across all ministries, with
                    <span className="text-cyan-400 font-semibold">
                      847 total positions
                    </span>
                    in the government hierarchy.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg max-w-xs shadow-lg">
                  <p className="text-sm">
                    Can you tell me more about the Finance Ministry structure?
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 p-3 rounded-lg max-w-xs shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">
                    The Finance Ministry is structured with multiple departments
                    including
                    <span className="text-yellow-400 font-semibold">
                      Treasury Operations
                    </span>
                    <span className="text-green-400 font-semibold">
                      Budget Planning
                    </span>
                    <span className="text-blue-400 font-semibold">
                      Revenue Collection
                    </span>
                    , and
                    <span className="text-purple-400 font-semibold">
                      Economic Policy
                    </span>
                    . Each department has specialized units handling specific
                    financial functions.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-3 rounded-lg max-w-xs shadow-lg">
                  <p className="text-sm">
                    How do I contact a specific department?
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 p-3 rounded-lg max-w-xs shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">
                    You can find contact information for each department in the
                    directory section. Simply navigate to the specific ministry,
                    then select the department you need. Contact details include
                    phone numbers, email addresses, and office locations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-3 border border-gray-800/40">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask about government structure..."
                  className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-500 focus:outline-none"
                  disabled
                />
                <button className="bg-cyan-500/20 hover:bg-cyan-500/30 p-2 rounded-lg transition-colors">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Assistant Online</span>
            </div>
          </div> */}
          </div>
        </div>
      </div>
    </div>
  );

};

export default Home;
