import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CiCircleChevLeft } from "react-icons/ci";
import * as d3 from "d3";
import { useThemeContext } from "../../themeContext";
import Dashboard from "../../pages/StatComparison";
import LoadingComponent from "../common_components/loading_component";
import { useSelector } from "react-redux";
import { color } from "highcharts";
import { IoChevronBack } from "react-icons/io5";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  ministerDictionary,
  selectedNode,
  ministerToDepartments,
  onMinistryClick,
  mode,
  setMode
}) {
  const { colors, isDark } = useThemeContext();
  const [drawerMinisterDictionary, setDrawerMinisterDictionary] = useState({});
  const [showDepartment, setShowDepartment] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [departmentListtoShow, setDepartmentListtoShow] = useState([]);

  //redux access
  const { selectedPresident } = useSelector((state) => state.presidency);

  //clear data
  useEffect(() => {
    setDrawerMinisterDictionary({});
  }, [selectedPresident]);

  useEffect(()=>{
    console.log('this is from the selected name from drawer',selectedNode)
  },[selectedNode])
  
  //set new data
  useEffect(() => {
    setDrawerMinisterDictionary(ministerDictionary);
  }, [ministerDictionary]);

  // const containerRef = useRef(null);

  // // Helper function to get icon SVG and color based on node type
  // function getNodeStyle(nodeName, nodeData) {
  //   if (nodeName === "Data") {
  //     return {
  //       iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
  //         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  //       </svg>`,
  //       color: isDark ? colors.success : colors.green,
  //       backgroundColor: isDark ? `${colors.success}20` : `${colors.green}20`
  //     };
  //   } else if (nodeName === "Departments") {
  //     return {
  //       iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
  //         <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  //       </svg>`,
  //       color: isDark ? colors.secondary : colors.purple,
  //       backgroundColor: isDark ? `${colors.secondary}20` : `${colors.purple}20`
  //     };
  //   } else if (nodeData && nodeData.node) {
  //     // This is a ministry or department with actual data
  //     if (nodeData.node.name && ministerDictionary && Object.values(ministerDictionary).some(m => m.name === nodeData.node.name)) {
  //       return {
  //         iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
  //           <path d="M21 7a1 1 0 1 1 0 2v10a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2V9a1 1 0 0 1 0-2h18ZM7 11a1 1 0 0 0-1 1v7h2v-7a1 1 0 0 0-1-1Zm5 0a1 1 0 0 0-1 1v7h2v-7a1 1 0 0 0-1-1Zm5 0a1 1 0 0 0-1 1v7h2v-7a1 1 0 0 0-1-1Zm1-7a1 1 0 1 1 0 2H6a1 1 0 0 1 0-2h12Z"/>
  //         </svg>`,
  //         color: isDark ? colors.primary : colors.textSecondary,
  //         backgroundColor: isDark ? `${colors.primary}20` : `${colors.textSecondary}20`
  //       };
  //     } else {
  //       return {
  //         iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
  //           <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  //         </svg>`,
  //         color: isDark ? colors.secondary : colors.purple,
  //         backgroundColor: isDark ? `${colors.secondary}20` : `${colors.purple}20`
  //       };
  //     }
  //   }
  //   return {
  //     iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
  //       <path d="M21 7a1 1 0 1 1 0 2v10a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2V9a1 1 0 0 1 0-2h18ZM7 11a1 1 0 0 0-1 1v7h2v-7a1 1 0 0 0-1-1Zm5 0a1 1 0 0 0-1 1v7h2v-7a1 1 0 0 0-1-1Zm5 0a1 1 0 0 0-1 1v7h2v-7a1 1 0 0 0-1-1Zm1-7a1 1 0 1 1 0 2H6a1 1 0 0 1 0-2h12Z"/>
  //     </svg>`,
  //     color: colors.textPrimary,
  //     backgroundColor: 'transparent'
  //   };
  // }

  // //specify initial chart
  // useEffect(() => {

  //   if (!ministerDictionary || Object.keys(ministerDictionary).length === 0 || !ministerToDepartments || Object.keys(ministerToDepartments).length === 0) return;
  //   console.log('minister to department', ministerToDepartments)

  //   const data = {
  //     name: "Ministers",
  //     children: Object.keys(ministerDictionary).map((ministerId) => ({
  //       name: ministerDictionary[ministerId].name,
  //       node: ministerDictionary[ministerId],
  //       children: [{
  //         name: "Data",
  //         value: 1,
  //       }, {
  //         name: "Departments",
  //         children: (ministerToDepartments[ministerId] || []).map((departmentId) => {
  //           const department = departmentDictionary[departmentId];
  //           return {
  //             name: department ? department.name : "Unknown Department",
  //             node: department,
  //             children: [{
  //               name: "Data",
  //               value: 1,
  //             }]
  //           };
  //         })

  //       }],
  //     })),
  //   };

  //   // Specify the chart's dimensions.
  //   const width = 928;
  //   const height = 1200;

  //   // Compute the layout.
  //   const hierarchy = d3
  //     .hierarchy(data)
  //     .sum((d) => d.value)
  //     .sort((a, b) => b.height - a.height || b.value - a.value);

  //   const root = d3
  //     .partition()
  //     .size([height, ((hierarchy.height + 1) * width) / 2])(hierarchy);

  //   // Layout spacing constants
  //   const OUTER_GAP = 1;      // space between rect border and cell group frame
  //   const INNER_PADDING = 3;   // padding inside the label container

  //   function nodeLabel(d) {
  //     return `${d.data.name}`;
  //   }

  //   // Allocate sibling heights proportional to their text height so cells fit labels
  //   function allocateChildrenHeightsByText(node, measurer) {
  //     if (!node.children || node.children.length === 0) return;
  //     // child width is constant for this depth due to icicle orientation
  //     const childWidth = (node.children[0].y1 - node.children[0].y0 - 2 * OUTER_GAP - 2 * INNER_PADDING);
  //     measurer.style.width = `${Math.max(0, childWidth)}px`;

  //     const requiredHeights = [];
  //     for (let i = 0; i < node.children.length; i++) {
  //       const child = node.children[i];
  //       // Measure text height
  //       measurer.textContent = nodeLabel(child);
  //       const textHeight = measurer.scrollHeight || 0;
  //       const paddingContribution = 2 * OUTER_GAP + 2 * INNER_PADDING; // vertical padding + gaps
  //       const minCell = 24; // ensure minimum clickable size
  //       const required = Math.max(minCell, textHeight + paddingContribution);
  //       requiredHeights.push(required);
  //     }

  //     const totalRequired = requiredHeights.reduce((a, b) => a + b, 0) || 1;
  //     const available = node.x1 - node.x0;
  //     let cursor = node.x0;
  //     for (let i = 0; i < node.children.length; i++) {
  //       const child = node.children[i];
  //       const portion = (requiredHeights[i] / totalRequired) * available;
  //       child.x0 = cursor;
  //       child.x1 = cursor + portion;
  //       cursor = child.x1;
  //     }

  //     for (let i = 0; i < node.children.length; i++) {
  //       allocateChildrenHeightsByText(node.children[i], measurer);
  //     }
  //   }

  //   // Create an offscreen measurer for text sizing
  //   const containerEl = containerRef.current;
  //   const measurer = document.createElement("div");
  //   measurer.style.position = "absolute";
  //   measurer.style.visibility = "hidden";
  //   measurer.style.pointerEvents = "none";
  //   measurer.style.top = "-9999px";
  //   measurer.style.left = "-9999px";
  //   measurer.style.fontSize = "14px";
  //   measurer.style.lineHeight = "1.2";
  //   measurer.style.whiteSpace = "normal";
  //   measurer.style.wordWrap = "break-word";
  //   measurer.style.fontFamily = "inherit";
  //   // measurer.style.boxSizing = "border-box";
  //   measurer.style.padding = `${INNER_PADDING}px`;
  //   (containerEl || document.body).appendChild(measurer);

  //   allocateChildrenHeightsByText(root, measurer);

  //   // Create the SVG container.
  //   const svg = d3
  //     .create("svg")
  //     .attr("viewBox", [0, 0, width, height])
  //     .attr("width", width)
  //     .attr("height", height)
  //     .attr("style", "max-width: 100%; height: auto; ");

  //   // Append cells.
  //   const cell = svg
  //     .selectAll("g")
  //     .data(root.descendants())
  //     .join("g")
  //     .attr("transform", (d) => `translate(${d.y0},${d.x0})`);

  //   const rect = cell
  //     .append("rect")
  //     .attr("width", (d) => d.y1 - d.y0 - 1)
  //     .attr("height", d => rectHeight(d))
  //     .attr("fill-opacity", 1)
  //     .attr("fill", (d) => {
  //       const style = getNodeStyle(d.data.name, d.data);
  //       return style.backgroundColor;
  //     })
  //     .attr("rx", 6)
  //     .attr("ry", 6)
  //     .attr("stroke", "#d5ecff")
  //     .attr("stroke-width", 1)
  //     .style("cursor", "pointer")
  //     .on("mouseenter", function () {
  //       d3.select(this)
  //         .style("filter", "drop-shadow(0 5px 20px rgba(0,0,0,0.1))");
  //     })
  //     .on("mouseleave", function () {
  //       d3.select(this)
  //         .style("filter", null);
  //     })
  //     .on("click", (event, d) => {
  //       clicked(event, d);
  //       if (d && d.data && d.data.node) {
  //         onMinistryClick(d.data.node);
  //       }
  //     });

  //   // Create foreign object for text with icon
  //   const foreignObject = cell.append("foreignObject")
  //     .attr("x", OUTER_GAP)
  //     .attr("y", OUTER_GAP)
  //     .attr("width", (d) => d.y1 - d.y0 - 2 * OUTER_GAP)
  //     .attr("height", (d) => Math.max(30, rectHeight(d) - 2 * OUTER_GAP))
  //     .style("pointer-events", "none");

  //   // Create container div for each cell
  //   const cellDiv = foreignObject.append("xhtml:div")
  //     .style("width", "100%")
  //     .style("height", "100%")
  //     .style("display", "flex")
  //     .style("align-items", (d) => {
  //       // Check if this is a title/label node or an actual data item
  //       if (d.data.name === "Ministers" || d.data.name === "Departments" || d.data.name === "Data") {
  //         return "flex-start";
  //       } else {
  //         return "center";
  //       }
  //     })
  //     .style("padding", `${INNER_PADDING}px`)
  //     .style("padding-top", (d) => {
  //       // Check if this is a title/label node or an actual data item
  //       if (d.data.name === "Ministers" || d.data.name === "Departments" || d.data.name === "Data") {
  //         return "10px";
  //       } else {
  //         return "5px";
  //       }
  //     })
  //     .style("gap", "8px");

  //   // Add icon
  //   cellDiv.append("xhtml:div")
  //     .style("flex-shrink", "0")
  //     .style("display", "flex")
  //     .style("align-items", (d) => {
  //       // Icon alignment should match the container alignment
  //       if (d.data.name === "Ministers" || d.data.name === "Departments" || d.data.name === "Data") {
  //         return "flex-start"; // Top alignment for titles
  //       } else {
  //         return "center"; // Center alignment for actual list items
  //       }
  //     })
  //     .style("justify-content", "center")
  //     .style("padding-left", "10px")
  //     .style("color", (d) => {
  //       const style = getNodeStyle(d.data.name, d.data);
  //       return style.color;
  //     })
  //     .html((d) => {
  //       const style = getNodeStyle(d.data.name, d.data);
  //       return style.iconSvg;
  //     });

  //   // Add text
  //   cellDiv.append("xhtml:div")
  //     .style("flex", "1")
  //     .style("font-size", "14px")
  //     .style("line-height", "1")
  //     .style("color", (d) => {
  //       const style = getNodeStyle(d.data.name, d.data);
  //       return style.color;
  //     })
  //     .style("word-wrap", "break-word")
  //     .style("overflow", "visible")
  //     .style("white-space", "normal")
  //     .style("font-weight", (d) => d.data.name === "Data" ? "500" : "400")
  //     .style("display", "flex")
  //     .style("align-items", (d) => {
  //       // Text alignment should match the container alignment
  //       if (d.data.name === "Ministers" || d.data.name === "Departments" || d.data.name === "Data") {
  //         return "flex-start"; // Top alignment for titles
  //       } else {
  //         return "center"; // Center alignment for actual list items
  //       }
  //     })
  //     .text((d) => nodeLabel(d))
  //     .style("cursor", "default");

  //   // On click, change the focus and transitions it into view.
  //   let focus = root;

  //   function clicked(event, p) {
  //     focus = focus === p ? (p = p.parent) : p;

  //     root.each(
  //       (d) =>
  //       (d.target = {
  //         x0: ((d.x0 - p.x0) / (p.x1 - p.x0)) * height,
  //         x1: ((d.x1 - p.x0) / (p.x1 - p.x0)) * height,
  //         y0: d.y0 - p.y0,
  //         y1: d.y1 - p.y0,
  //       })
  //     );

  //     const t = cell
  //       .transition()
  //       .duration(750)
  //       .attr("transform", (d) => `translate(${d.target.y0},${d.target.x0})`);

  //     rect.transition(t).attr("height", (d) => rectHeight(d.target));
  //     cell.selectAll("foreignObject")
  //       .transition(t)
  //       .attr("height", (d) => Math.max(30, rectHeight(d.target) - 2 * OUTER_GAP))
  //       .attr("y", OUTER_GAP)
  //       .attr("x", OUTER_GAP)
  //       .attr("width", (d) => d.target ? d.target.y1 - d.target.y0 - 2 * OUTER_GAP : d.y1 - d.y0 - 2 * OUTER_GAP);
  //   }

  //   function rectHeight(d) {
  //     return d.x1 - d.x0;
  //   }

  //   // Append the created SVG to the container
  //   containerEl && containerEl.appendChild(svg.node());

  //   // Optional: Cleanup on unmount

  //   // return () => {
  //   //   containerRef.current.innerHTML = "";
  //   // };
  //   return () => {
  //      measurer.remove();
  //      if (containerEl) {
  //        d3.select(containerEl).selectAll("*").remove();
  //      }
  //   };

  //   // return svg.node();
  // }, [ministerDictionary, ministerToDepartments, departmentDictionary, onMinistryClick]);

  return (
    <div
      className={`fixed right-0 z-[100] p-4 transition-all duration-300  ease-in-out ${
        expandDrawer ? `w-1/2 h-screen shadow-xl` : "w-0"
      }`}
      style={{
        backgroundColor: colors.backgroundPrimary,
        color: colors.textPrimary,
      }}
    >
      {!expandDrawer && (
        <button
          className={`${
            !expandDrawer
              ? "rounded-l-full bg-[#305cde] text-white text-5xl p-1 fixed right-0 top-12 cursor-pointer shadow-xl"
              : ""
          }`}
          onClick={() => setExpandDrawer(true)}
        >
          <CiCircleChevLeft />
        </button>
      )}
      {expandDrawer && (
        <div className="flex item-center font-semibold">
          <button
            className={`mr-2 text-3xl rotate-180 cursor-pointer mb-4`}
            onClick={() => setExpandDrawer(false)}
          >
            <CiCircleChevLeft />
          </button>
          <p className="text-2xl">Explore more...</p>
        </div>
      )}
      {/* <div
        ref={containerRef}
      ></div> */}
      {expandDrawer && (
        <div className="flex">
          {["Structure", "Statistics"].map((category) => {
            return (
              <div
                key={category}
                className={`px-4 py-2 m-1 rounded-md cursor-pointer transition-all duration-300 ease-in-out ${
                  category == mode
                    ? `${
                        isDark
                          ? "bg-white text-black border-1 border-white"
                          : "bg-black text-white border-1 border-black"
                      }`
                    : `${
                        isDark
                          ? `bg-black text-white border-1 border-gray-300`
                          : "bg-white text-black border-1 border-gray-300"
                      }`
                }`}
                onClick={() => setMode(category)}
              >
                {category}
              </div>
            );
          })}
        </div>
      )}

      {expandDrawer && (
        <div className="flex flex-col h-[90%] p-2">
          {mode === "Structure" ? (
            !showDepartment ? (
              <>
                {/* Header (stays visible) */}
                <h2 className="text-xl font-semibold mb-2 mt-4 shrink-0">
                  {Object.keys(drawerMinisterDictionary).length} Active
                  Ministries
                </h2>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pr-2">
                  {drawerMinisterDictionary &&
                    Object.entries(drawerMinisterDictionary).map(
                      ([key, minister], index) => (
                        <div
                          key={key}
                          className={`my-2 p-2 rounded-md cursor-pointer ${
                            isDark
                              ? colors.backgroundWhite
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                          style={{
                            backgroundColor: isDark
                              ? colors.backgroundWhite
                              : "bg-gray-200",
                          }}
                          onClick={() => {
                            onMinistryClick(minister);
                            setSelectedMinistry(minister);
                            setShowDepartment(true);
                            setDepartmentListtoShow(
                              ministerToDepartments[minister.id]
                            );
                          }}
                        >
                          <span className="font-semibold mr-2">
                            {index + 1}.
                          </span>
                          {minister.name}
                        </div>
                      )
                    )}
                </div>
              </>
            ) : departmentListtoShow &&
              departmentListtoShow.length > 0 &&
              showDepartment ? (
              <>
                {/* Header */}
                <div className="shrink-0">
                  <button
                    onClick={() => setShowDepartment(false)}
                    className="mt-4 mb-2 cursor-pointer"
                    style={{ color: colors.textMuted }}
                  >
                    <div className="flex justify-center items-center">
                      <IoChevronBack className="mr-1" /> <p>Back to previous</p>
                    </div>
                  </button>
                  <p className="text-xl font-semibold">
                    {selectedMinistry.name}
                  </p>
                  <p style={{ color: colors.textPrimary }}>
                    {departmentListtoShow.length} departments
                  </p>
                </div>

                {/* Scrollable department list */}
                <div className="flex-1 overflow-y-auto mt-2">
                  {departmentListtoShow.map((department, index) => (
                    <div
                      key={index}
                      className={`my-2 p-2 rounded-md cursor-pointer ${
                        isDark
                          ? colors.backgroundWhite
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      style={{
                        backgroundColor: isDark
                          ? colors.backgroundWhite
                          : "red",
                      }}
                      onClick={() => onMinistryClick(department.target)}
                    >
                      <span className="font-semibold mr-2">{index + 1}.</span>
                      {department.target.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <LoadingComponent message="Data Loading" OsColorMode={false} />
            )
          ) : (
            <Dashboard selectedNode={selectedNode} />
          )}
        </div>
      )}
    </div>
  );
}
