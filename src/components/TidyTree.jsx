import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import "./TidyTree.css"
import { useThemeContext } from "../themeContext";

const TidyTree = ({
  data,
  onMinistryClick,
  loadingDepartments = new Set(),
  departmentData = {},
  expandedMinistries = new Set(),
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const treeRef = useRef(null);
  const rootRef = useRef(null);
  const zoomRef = useRef(null);
  const gMainRef = useRef(null);
  const { colors } = useThemeContext();

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Stabilize the tree structure
  const treeStructure = useMemo(() => {
    if (!data) return null;

    const createTreeStructure = (node) => {
      const treeNode = { ...node };

      if (node.children) {
        treeNode.children = node.children.map((child) => {
          const childNode = { ...child };
          childNode._children = child.type === "ministry" ? [] : null;
          childNode.children = null;
          return childNode;
        });
      }

      return treeNode;
    };

    return createTreeStructure(data);
  }, [data]);

  // Convert Sets to arrays for stable comparison
  const expandedMinistriesArray = useMemo(
    () => Array.from(expandedMinistries),
    [expandedMinistries]
  );
  const loadingDepartmentsArray = useMemo(
    () => Array.from(loadingDepartments),
    [loadingDepartments]
  );

  // Function to highlight nodes and their path - FIXED
  const highlightPath = (ministryId) => {
    // Remove all existing highlights
    if (gMainRef.current) {
      d3.select(gMainRef.current)
        .selectAll(".nodes circle, .nodes text, .links path")
        .classed("highlight", false);

      if (!ministryId) return;

      // Highlight the root
      d3.select(gMainRef.current)
        .selectAll(".nodes g")
        .filter(d => d.data.type === "root")
        .selectAll("circle, text")
        .classed("highlight", true);

      // Highlight the clicked ministry
      d3.select(gMainRef.current)
        .selectAll(".nodes g")
        .filter(d => d.data.id === ministryId)
        .selectAll("circle, text")
        .classed("highlight", true);

      // Highlight departments of the clicked ministry
      if (departmentData[ministryId]) {
        departmentData[ministryId].forEach((dept) => {
          d3.select(gMainRef.current)
            .selectAll(".nodes g")
            .filter(d => d.data.id === dept.id)
            .selectAll("circle, text")
            .classed("highlight", true);
        });
      }

      // Highlight the connecting links
      d3.select(gMainRef.current)
        .selectAll(".links path")
        .classed("highlight", (d) =>
          (d.source.data.type === "root" && d.target.data.id === ministryId) ||
          (d.source.data.id === ministryId && d.target.data.type === "department")
        );
    }
  };

  // Function to attach click handlers to nodes - FIXED
  const attachClickHandlers = (nodeSelection) => {
    // Remove existing click handlers first
    nodeSelection.selectAll("circle").on("click", null);
    nodeSelection.selectAll("text:not(.loading-indicator)").on("click", null);

    // Attach new click handlers with proper event handling
    nodeSelection
      .selectAll("circle")
      .on("click", function(event, d) {
        if (d.data.type === "ministry") {
          event.stopPropagation();
          onMinistryClick(d.data.id);
        }
      });

    nodeSelection
      .selectAll("text:not(.loading-indicator)")
      .on("click", function(event, d) {
        if (d.data.type === "ministry") {
          event.stopPropagation();
          onMinistryClick(d.data.id);
        }
      });
  };

  // Update function to add/remove departments for a specific ministry
  const updateDepartments = (ministryId, isExpanding) => {
    if (!rootRef.current || !treeRef.current || !gMainRef.current) return;

    const root = rootRef.current;
    const tree = treeRef.current;
    const gMain = gMainRef.current;
    const gNode = d3.select(gMain).select(".nodes");
    const gLink = d3.select(gMain).select(".links");
    const { width } = dimensions;

    const duration = 500;

    // Find the ministry node in the hierarchy
    let ministryNode = null;
    root.eachBefore((d) => {
      if (d.data.id === ministryId) {
        ministryNode = d;
      }
    });

    if (!ministryNode) return;

    if (isExpanding) {
      // Add departments to the ministry node
      const departments = departmentData[ministryId] || [];
      ministryNode.children = departments.map((dept) => ({
        data: dept,
        parent: ministryNode,
        depth: ministryNode.depth + 1,
        children: null,
        _children: null,
        id: dept.id,
      }));
    } else {
      // Remove departments
      ministryNode.children = null;
    }

    // Recompute the tree layout
    tree(root);

    // Calculate new bounds
    let left = root,
      right = root;
    root.eachBefore((node) => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const marginTop = 10;
    const marginBottom = 10;
    const marginLeft = 40;
    const height = right.x - left.x + marginTop + marginBottom;

    const nodes = root.descendants();
    const links = root.links();
    const ministersExpanded = expandedMinistriesArray.length > 0;

    // Update nodes with proper key function
    const node = gNode.selectAll("g").data(nodes, (d) => d.data.id || "root");

    // Enter new nodes (departments)
    const nodeEnter = node
      .enter()
      .append("g")
      .attr("transform", () => `translate(${ministryNode.y},${ministryNode.x})`)
      .attr("data-id", (d) => d.data.id || "root")
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0);

    // Add circles for new nodes
    nodeEnter
      .append("circle")
      .attr("r", (d) => (d.data.type === "department" ? 4 : 5))
      .attr("fill", (d) => {
        if (d.data.type === "root") return "#fff";
        if (d.data.type === "department") return "#4A9EFF";
        return "#F3F3FF";
      })
      .attr("stroke", "#2593B8")
      .attr("stroke-width", 1.5)
      .style("cursor", (d) =>
        d.data.type === "ministry" ? "pointer" : "default"
      );

    // Add text for new nodes
    nodeEnter
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", 6)
      .attr("text-anchor", "start")
      .text((d) => d.data.name.split(":")[0])
      .attr("fill", "#F4F4F4")
      .style("cursor", (d) =>
        d.data.type === "ministry" ? "pointer" : "default"
      );

    // Add loading indicators for new nodes
    nodeEnter
      .append("text")
      .attr("class", "loading-indicator")
      .attr("dy", "0.31em")
      .attr("x", -15)
      .attr("text-anchor", "middle")
      .text("⟳")
      .attr("fill", "#ffeb3b")
      .style("font-size", "12px")
      .style("opacity", 0);

    // Merge enter and update selections
    const nodeUpdate = node.merge(nodeEnter);

    // Attach click handlers to ALL nodes (both existing and new)
    attachClickHandlers(nodeUpdate);

    // Update all nodes positions with better layout
    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", (d) => {
        let adjustedY = d.y;

        // Better positioning logic to prevent departments from going off-screen
        if (d.depth === 1) {
          // Ministry nodes
          adjustedY = ministersExpanded ? width * 0.25 : width * 0.5;
        } else if (d.depth === 2) {
          // Department nodes - allow them to extend beyond screen for pan/zoom
          adjustedY = d.y;
        }

        return `translate(${adjustedY},${d.x})`;
      })
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    // Update loading indicators
    nodeUpdate
      .selectAll(".loading-indicator")
      .style("opacity", (d) => {
        return loadingDepartmentsArray.includes(d.data.id) ? 1 : 0;
      });

    // Remove exiting nodes
    node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", `translate(${ministryNode.y},${ministryNode.x})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .remove();

    // Update links
    const link = gLink
      .selectAll("path")
      .data(links, (d) => d.target.data.id || "root");

    // Enter new links
    const linkEnter = link
      .enter()
      .append("path")
      .attr("d", () => {
        const o = { x: ministryNode.x, y: ministryNode.y };
        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)({ source: o, target: o });
      });

    // Update all links with better positioning
    link
      .merge(linkEnter)
      .transition()
      .duration(duration)
      .attr("d", (d) => {
        let adjustedSourceY = d.source.y;
        let adjustedTargetY = d.target.y;

        // Apply same positioning logic as nodes
        if (d.source.depth === 1) {
          adjustedSourceY = ministersExpanded ? width * 0.25 : width * 0.5;
        }
        if (d.target.depth === 1) {
          adjustedTargetY = ministersExpanded ? width * 0.25 : width * 0.5;
        }
        if (d.target.depth === 2) {
          // Allow departments to extend beyond screen
          adjustedTargetY = d.target.y;
        }

        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)({
          source: { x: d.source.x, y: adjustedSourceY },
          target: { x: d.target.x, y: adjustedTargetY },
        });
      });

    // Remove exiting links
    link
      .exit()
      .transition()
      .duration(duration)
      .attr("d", () => {
        const o = { x: ministryNode.x, y: ministryNode.y };
        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)({ source: o, target: o });
      })
      .remove();

    // Store the old positions for transition
    root.eachBefore((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Highlight the path after animation
    setTimeout(() => {
      highlightPath(ministryId);
    }, duration + 50);
  };

  // Watch for changes in expanded ministries and update accordingly
  useEffect(() => {
    if (!rootRef.current) return;

    // Get the current expanded ministries from the tree
    const currentExpanded = new Set();
    rootRef.current.eachBefore((d) => {
      if (d.data.type === "ministry" && d.children) {
        currentExpanded.add(d.data.id);
      }
    });

    // Find ministries that need to be expanded
    expandedMinistriesArray.forEach((ministryId) => {
      if (!currentExpanded.has(ministryId) && departmentData[ministryId]) {
        updateDepartments(ministryId, true);
      }
    });

    // Find ministries that need to be collapsed
    Array.from(currentExpanded).forEach((ministryId) => {
      if (!expandedMinistriesArray.includes(ministryId)) {
        updateDepartments(ministryId, false);
      }
    });
  }, [expandedMinistriesArray, departmentData, dimensions]);

  // Reset zoom function
  const resetZoom = () => {
    if (zoomRef.current && containerRef.current) {
      const svg = d3.select(containerRef.current).select("svg");
      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity
      );
    }
  };

  // Initial tree setup
  useEffect(() => {
    if (!treeStructure || dimensions.width === 0) return;

    const { width, height } = dimensions;

    // Clear existing SVG
    d3.select(containerRef.current).selectAll("svg").remove();

    // Create SVG
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("max-width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif")
      .style("user-select", "none")
      .style("cursor", "grab");

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        if (gMainRef.current) {
          d3.select(gMainRef.current).attr("transform", event.transform);
        }
      });

    zoomRef.current = zoom;

    // Apply zoom to SVG
    svg.call(zoom);

    // Create main group for all content
    const gMain = svg.append("g").attr("class", "main-content");
    gMainRef.current = gMain.node(); // Store the actual DOM node

    // Margins
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const marginLeft = 40;

    // Create hierarchy
    const root = d3.hierarchy(treeStructure);
    rootRef.current = root;

    // Tree layout with better spacing
    const dx = 25;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    const tree = d3.tree().nodeSize([dx, dy]);
    treeRef.current = tree;

    // Create groups within main group
    const gLink = gMain
      .append("g")
      .attr("class", "links")
      .attr("fill", "none")
      .attr("stroke", "#2593B8")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = gMain
      .append("g")
      .attr("class", "nodes")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    // Initial tree computation
    tree(root);

    // Calculate bounds
    let left = root,
      right = root;
    root.eachBefore((node) => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const treeHeight = right.x - left.x + marginTop + marginBottom;

    // Set initial viewBox to show the tree centered
    svg.attr("viewBox", [-marginLeft, left.x - marginTop, width, treeHeight]);

    const nodes = root.descendants();
    const links = root.links();

    // Add initial nodes
    const nodeEnter = gNode
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d) => {
        let adjustedY = d.y;
        if (d.depth === 1) {
          adjustedY = width * 0.5;
        }
        return `translate(${adjustedY},${d.x})`;
      })
      .attr("data-id", (d) => d.data.id || "root");

    // Add circles
    nodeEnter
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d) => {
        if (d.data.type === "root") return "#fff";
        return "#F3F3FF";
      })
      .attr("stroke", "#2593B8")
      .attr("stroke-width", 1.5)
      .style("cursor", (d) =>
        d.data.type === "ministry" ? "pointer" : "default"
      );

    // Add text
    nodeEnter
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", 6)
      .attr("text-anchor", "start")
      .text((d) => d.data.name.split(":")[0])
      .attr("fill", "#F4F4F4")
      .style("cursor", (d) =>
        d.data.type === "ministry" ? "pointer" : "default"
      );

    // Add loading indicators
    nodeEnter
      .append("text")
      .attr("class", "loading-indicator")
      .attr("dy", "0.31em")
      .attr("x", -15)
      .attr("text-anchor", "middle")
      .text("⟳")
      .attr("fill", "#ffeb3b")
      .style("font-size", "12px")
      .style("opacity", 0);

    // Attach click handlers to initial nodes
    attachClickHandlers(nodeEnter);

    // Add initial links
    gLink
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const adjustedSourceY = d.source.depth === 1 ? width * 0.5 : d.source.y;
        const adjustedTargetY = d.target.depth === 1 ? width * 0.5 : d.target.y;

        return d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)({
          source: { x: d.source.x, y: adjustedSourceY },
          target: { x: d.target.x, y: adjustedTargetY },
        });
      });

    // Initialize positions
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = d.data.id || i;
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Cleanup function
    return () => {
      d3.select(containerRef.current).selectAll("svg").remove();
    };
  }, [treeStructure, dimensions]);

  return (
    <div
      style={{
        position: "relative",
        paddingTop: "30px",
        paddingBottom: "30px",
        minWidth: "100%",
        height: "100%",
        backgroundColor: colors.backgroundPrimary,
      }}
    >
      {/* Zoom Controls */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "20px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <button
          onClick={() => {
            if (zoomRef.current && containerRef.current) {
              const svg = d3.select(containerRef.current).select("svg");
              svg.transition().duration(200).call(
                zoomRef.current.scaleBy,
                1.5
              );
            }
          }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid #2593B8",
            backgroundColor: colors.backgroundPrimary,
            color: colors.textPrimary,
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => {
            if (zoomRef.current && containerRef.current) {
              const svg = d3.select(containerRef.current).select("svg");
              svg.transition().duration(200).call(
                zoomRef.current.scaleBy,
                1 / 1.5
              );
            }
          }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid #2593B8",
            backgroundColor: colors.backgroundPrimary,
            color: colors.textPrimary,
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid #2593B8",
            backgroundColor: colors.backgroundPrimary,
            color: colors.textPrimary,
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          borderRadius: "5px",
          fontSize: "12px",
          maxWidth: "200px",
        }}
      >
        <div>• Drag to pan around</div>
        <div>• Scroll to zoom in/out</div>
        <div>• Click ministry nodes to expand</div>
        <div>• Use controls to zoom/reset</div>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          overflowX: "hidden",
          overflowY: "hidden",
        }}
      ></div>
    </div>
  );
};

export default TidyTree;