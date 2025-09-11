import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CiCircleChevLeft } from "react-icons/ci";
import * as d3 from "d3";

export default function Drawer({
  expandDrawer,
  setExpandDrawer,
  ministerDictionary,
  departmentDictionary,
  ministerToDepartments,
  onMinistryClick,
  drawerData,
  setDrawerData,
}) {
  const containerRef = useRef(null);

  //specify initial chart
  useEffect(() => {

    if (!ministerDictionary || Object.keys(ministerDictionary).length === 0 || !ministerToDepartments || Object.keys(ministerToDepartments).length === 0) return;
    console.log('minister to department', ministerToDepartments)

    const data = {
      name: "Ministers",
      value: 1,
      children: Object.keys(ministerDictionary).map((ministerId) => ({
        name: ministerDictionary[ministerId].name,
        children: [{
          name: "Data",
          value: 1,
        }, {
          name: "Departments",
          children: (ministerToDepartments[ministerId] || []).map((departmentId) => {
            const department = departmentDictionary[departmentId];
            return {
              name: department ? department.name : "Unknown Department",
              value: 1,
            };
          })

        }],
      })),
    };

    // Specify the chart’s dimensions.
    const width = 928;
    const height = 1500;

    // Create the color scale.
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    console.log('color scale : ', color)

    // Compute the layout.
    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    console.log('hierarchy : ', hierarchy)

    const root = d3
      .partition()
      .size([height, ((hierarchy.height + 1) * width) / 2])(hierarchy);

    // Create the SVG container.
    const svg = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

    // Append cells.
    const cell = svg
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.y0},${d.x0})`);

    const rect = cell
      .append("rect")
      .attr("width", (d) => d.y1 - d.y0 - 1)
      .attr("height", (d) => 50)
      .attr("fill-opacity", 1)
      .attr("fill", "white")
      .style("cursor", "pointer")
      .on("click", clicked);

    const format = d3.format(",d");

    cell.append("foreignObject")
      .attr("x", 4)
      .attr("y", 4)
      .attr("width", (d) => d.y1 - d.y0 - 8)
      .attr("height", 30)
      .append("xhtml:div")
      .style("width", "100%")
      .style("height", "100%")
      .style("font-size", "14px")
      .style("line-height", "1.2")
      .style("color", "#000")
      .style("word-wrap", "break-word")
      .style("overflow", "hidden")
      .style("text-overflow", "ellipsis")
      .style("white-space", "normal")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "flex-start")
      .text((d) => `${d.data.name} ${d.value !== undefined ? `(${format(d.value)})` : ''}`)
      .style("cursor", "pointer")
      .on("click", clicked);

    // On click, change the focus and transitions it into view.
    let focus = root;
    function clicked(event, p) {
      focus = focus === p ? (p = p.parent) : p;

      root.each(
        (d) =>
        (d.target = {
          x0: ((d.x0 - p.x0) / (p.x1 - p.x0)) * height,
          x1: ((d.x1 - p.x0) / (p.x1 - p.x0)) * height,
          y0: d.y0 - p.y0,
          y1: d.y1 - p.y0,
        })
      );

      const t = cell
        .transition()
        .duration(750)
        .attr("transform", (d) => `translate(${d.target.y0},${d.target.x0})`);

      rect.transition(t).attr("height", (d) => rectHeight(d.target));
      text.transition(t).attr("fill-opacity", (d) => +labelVisible(d.target));
      tspan
        .transition(t)
        .attr("fill-opacity", (d) => labelVisible(d.target) * 0.7);
    }

    function rectHeight(d) {
      return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
    }

    function labelVisible(d) {
      return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
    }

    // Append the created SVG to the container
    containerRef.current.appendChild(svg.node());

    // Optional: Cleanup on unmount
    return () => {
      containerRef.current.innerHTML = "";
    };

    // return svg.node();
  }, [ministerDictionary, ministerToDepartments]);

  return (
    <div
      className={`fixed right-0 z-[100] p-4 scroll-auto ${expandDrawer ? "w-1/2 h-screen shadow-xl" : "w-0"
        } scroll-y-auto`}
        style={{ overflowX: "auto", overflowY: "auto" }}
    >
      {!expandDrawer && (<button className={`${!expandDrawer ? "rounded-l-full bg-[#305cde] text-white text-5xl p-1 fixed right-0 top-12 cursor-pointer shadow-xl" : ""}`}
        onClick={() => setExpandDrawer(true)}><CiCircleChevLeft />
      </button>)}
      {expandDrawer && (<div className="flex item-center font-semibold"><button className={`mr-2 text-2xl rotate-180 cursor-pointer mb-4`}
        onClick={() => setExpandDrawer(false)}><CiCircleChevLeft />
      </button><p>Explore more...</p></div>)}
      <div
        ref={containerRef}

      ></div>
    </div>
  );
}
