import React, { useEffect, useRef } from "react";
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
}) {
  const containerRef = useRef(null);

  //specify initial chart
  useEffect(() => {

    if (!ministerDictionary || Object.keys(ministerDictionary).length === 0 || !ministerToDepartments || Object.keys(ministerToDepartments).length === 0) return;
    console.log('minister to department', ministerToDepartments)

    const data = {
      name: "Ministers",
      children: Object.keys(ministerDictionary).map((ministerId) => ({
        name: ministerDictionary[ministerId].name,
        node: ministerDictionary[ministerId],
        children: [{
          name: "Data",
          value: 1,
        }, {
          name: "Departments",
          children: (ministerToDepartments[ministerId] || []).map((departmentId) => {
            const department = departmentDictionary[departmentId];
            return {
              name: department ? department.name : "Unknown Department",
              node: department,
              children: [{
                name: "Data",
                value: 1,
              }]
            };
          })

        }],
      })),
    };

    // Specify the chart’s dimensions.
    const width = 928;
    const height = 2000;

    // Compute the layout.
    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    const root = d3
      .partition()
      .size([height, ((hierarchy.height + 1) * width) / 2])(hierarchy);

    // Layout spacing constants
    const OUTER_GAP = 1;      // space between rect border and cell group frame
    const INNER_PADDING = 3;   // padding inside the label container

    function nodeLabel(d) {
      return `${d.data.name}`;
    }

    // Allocate sibling heights proportional to their text height so cells fit labels
    function allocateChildrenHeightsByText(node, measurer) {
      if (!node.children || node.children.length === 0) return;
      // child width is constant for this depth due to icicle orientation
      const childWidth = (node.children[0].y1 - node.children[0].y0 - 2 * OUTER_GAP - 2 * INNER_PADDING);
      measurer.style.width = `${Math.max(0, childWidth)}px`;

      const requiredHeights = [];
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        // Measure text height
        measurer.textContent = nodeLabel(child);
        const textHeight = measurer.scrollHeight || 0;
        const paddingContribution = 2 * OUTER_GAP + 2 * INNER_PADDING; // vertical padding + gaps
        const minCell = 24; // ensure minimum clickable size
        const required = Math.max(minCell, textHeight + paddingContribution);
        requiredHeights.push(required);
      }

      const totalRequired = requiredHeights.reduce((a, b) => a + b, 0) || 1;
      const available = node.x1 - node.x0;
      let cursor = node.x0;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const portion = (requiredHeights[i] / totalRequired) * available;
        child.x0 = cursor;
        child.x1 = cursor + portion;
        cursor = child.x1;
      }

      for (let i = 0; i < node.children.length; i++) {
        allocateChildrenHeightsByText(node.children[i], measurer);
      }
    }

    // Create an offscreen measurer for text sizing
    const containerEl = containerRef.current;
    const measurer = document.createElement("div");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.pointerEvents = "none";
    measurer.style.top = "-9999px";
    measurer.style.left = "-9999px";
    measurer.style.fontSize = "14px";
    measurer.style.lineHeight = "1.2";
    measurer.style.whiteSpace = "normal";
    measurer.style.wordWrap = "break-word";
    measurer.style.fontFamily = "inherit";
    // measurer.style.boxSizing = "border-box";
    measurer.style.padding = `${INNER_PADDING}px`;
    (containerEl || document.body).appendChild(measurer);

    allocateChildrenHeightsByText(root, measurer);

    // Create the SVG container.
    const svg = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; ");

    // Append cells.
    const cell = svg
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.y0},${d.x0})`);

    const rect = cell
      .append("rect")
      .attr("width", (d) => d.y1 - d.y0 - 1)
      .attr("height", d => rectHeight(d))
      .attr("fill-opacity", 1)
      .attr("fill", "#F1F1F1")
      .attr("rx", 6)
      .attr("ry", 6)
      // .attr("stroke", "#d5ecff")
      // .attr("stroke-width", 1)
      .style("transition", "fill 150ms ease, stroke 150ms ease, filter 150ms ease")
      .style("cursor", "pointer")
      .on("mouseenter", function () {
        d3.select(this)
          .attr("fill", "#eaf6ff")
          .attr("stroke", "#9ed1ff")
          .style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.2))");
      })
      .on("mouseleave", function () {
        d3.select(this)
          .attr("fill", "#f5fbff")
          .attr("stroke", "#d5ecff")
          .style("filter", null);
      })
      .on("click", (event, d) => {
        clicked(event, d);
        if (d && d.data && d.data.node) {
          onMinistryClick(d.data.node);
        }
      });

    cell.append("foreignObject")
      .attr("x", OUTER_GAP)
      .attr("y", OUTER_GAP)
      .attr("width", (d) => d.y1 - d.y0 - 2 * OUTER_GAP)
      .attr("height", (d) => Math.max(30, rectHeight(d) - 2 * OUTER_GAP))
      .style("pointer-events", "none")
      .append("xhtml:div")
      .style("width", "100%")
      .style("height", "auto")
      .style("font-size", "14px")
      .style("line-height", "1.2")
      .style("color", "#000")
      .style("word-wrap", "break-word")
      .style("overflow", "visible")
      .style("white-space", "normal")
      .style("display", "block")
      .style("padding", `${INNER_PADDING}px`)
      .text((d) => nodeLabel(d))
      .style("cursor", "default");

    // On click, change the focus and transitions it into view.
    let focus = root;
    
    function clicked(event, p) {
      focus = focus === p ? (p = p.parent) : p;

      console.log('clicked node from drawer : ', p)

      

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
      cell.selectAll("foreignObject")
        .transition(t)
        .attr("height", (d) => Math.max(30, rectHeight(d.target) - 2 * OUTER_GAP))
        .attr("y", OUTER_GAP)
        .attr("x", OUTER_GAP)
        .attr("width", (d) => d.target ? d.target.y1 - d.target.y0 - 2 * OUTER_GAP : d.y1 - d.y0 - 2 * OUTER_GAP);
    }

    function rectHeight(d) {
      return d.x1 - d.x0;
    }

    // Append the created SVG to the container
    containerEl && containerEl.appendChild(svg.node());

    // Optional: Cleanup on unmount

    // return () => {
    //   containerRef.current.innerHTML = "";
    // };
    return () => {
       measurer.remove();
       if (containerEl) {
         d3.select(containerEl).selectAll("*").remove();
       }
    };

    // return svg.node();
  }, [ministerDictionary, ministerToDepartments, departmentDictionary, onMinistryClick]);

  return (
    <div
      className={`fixed right-0 z-[100] p-4 scroll-auto ${expandDrawer ? "w-1/2 h-screen bg-white shadow-xl" : "w-0"
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
