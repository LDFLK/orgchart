import { useRef, useEffect } from "react";
import {BarChart,Bar,PieChart,Pie,Cell,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,
} from "recharts";
import * as d3 from "d3";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"];

export const SimpleBarChart = ({ data, xDataKey, yDataKey, barFill = "#2563eb", xLabel = "", yLabel = "", showGrid = true, showLegend = false,
}) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xDataKey} label={{ value: xLabel, position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey={yDataKey} fill={barFill} />
        </BarChart>
    </ResponsiveContainer>
);

export const SimplePieChart = ({ data, dataKey, nameKey, colors = COLORS }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={120} label>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
);

export const SimpleLineChart = ({ data, xDataKey, lineKeys = [], colors = ["#2563eb", "#dc2626"], xLabel = "", yLabel = "", showGrid = true, showLegend = true,
}) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 25 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xDataKey} label={{ value: xLabel, position: "insideBottom", offset: -15 }} />
            <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            {showLegend && (
                <Legend layout="horizontal"align="center"verticalAlign="bottom"wrapperStyle={{ paddingTop: 20 }} />
            )}
            {lineKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} />
            ))}
        </LineChart>
    </ResponsiveContainer>
);

export const MultiBarChart = ({data,xDataKey,barKeys = [],colors = ["#2563eb", "#16a34a"],xLabel = "",yLabel = "",showGrid = true,showLegend = true,
}) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 25 }}
        >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xDataKey}label={{ value: xLabel, position: "insideBottom", offset: -15 }}/>
            <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }}/>
            <Tooltip />
            {showLegend && (
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
            )}
            {barKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
            ))}
        </BarChart>
    </ResponsiveContainer>
);


export const HorizontalBarChart = ({ data, xDataKey, yDataKey, barFill = "#8b5cf6", xLabel = "", yLabel = "", showGrid = true,
}) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
            {showGrid && 
            <CartesianGrid strokeDasharray="3 3" />
            }
            <XAxis type="number" label={{ value: xLabel, position: "insideBottom", offset: -5 }} />
            <YAxis type="category" dataKey={xDataKey} label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey={yDataKey} fill={barFill} />
        </BarChart>
    </ResponsiveContainer>
);

export const MultiHorizontalBarChart = ({data,yDataKey,barKeys = [],colors = ["#2563eb", "#16a34a"],xLabel = "",yLabel = "",showGrid = true,showLegend = true,
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart layout="vertical" data={data} margin={{ top: 20, right: 20, left: 25, bottom: 25 }} >
      {showGrid && 
      <CartesianGrid strokeDasharray="3 3" />
      }
      <XAxis type="number" label={{ value: xLabel, position: "insideBottom", offset: -15 }}/>
      <YAxis type="category" dataKey={yDataKey} label={{ value: yLabel, angle: -90, position: "insideLeft" }}/>
      <Tooltip />
      {showLegend && (
        <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }}/>
      )}
      {barKeys.map((key, i) => (
        <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export const BubbleChart = ({ data, nameKey = "name", valueKey = "value", width = 600, height = 450 }) => {
    const ref = useRef(null);

    useEffect(() => {
        d3.select(ref.current).selectAll("*").remove();
        const svg = d3
            .select(ref.current)
            .append("svg")
            .attr("width", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`);

        const root = d3.hierarchy({ children: data }).sum((d) => d[valueKey]);
        const pack = d3.pack().size([width, height]).padding(6);
        pack(root);

        const color = d3.scaleOrdinal().range(d3.schemeTableau10);

        const node = svg
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", (d) => `translate(${d.x},${d.y})`);

        // Circles
        node
            .append("circle")
            .attr("r", 0)
            .attr("fill", (d, i) => color(i))
            .attr("opacity", 0.9)
            .transition()
            .duration(800)
            .attr("r", (d) => d.r);

        // Country names
        node
            .append("text")
            .attr("class", "bubble-name")
            .style("text-anchor", "middle")
            .style("font-size", (d) => Math.max(10, d.r / 4))
            .style("pointer-events", "none")
            .text((d) => d.data[nameKey]);

        // Values (show on hover under name)
        const valueText = node
            .append("text")
            .attr("class", "bubble-value")
            .style("text-anchor", "middle")
            .style("font-size", (d) => Math.max(10, d.r / 5))
            .attr("y", (d) => Math.max(10, d.r / 4) + 2)
            .style("opacity", 0)
            .text((d) => d.data[valueKey]);

        node.on("mouseenter", function () {
            d3.select(this).select(".bubble-value").transition().duration(200).style("opacity", 1);
        });
        node.on("mouseleave", function () {
            d3.select(this).select(".bubble-value").transition().duration(200).style("opacity", 0);
        });

        return () => d3.select(ref.current).selectAll("*").remove();
    }, [width, height, data, nameKey, valueKey]);

    return <div ref={ref} style={{ width: "100%", height: height }} />;
};

/* -------------------- D3 Circle Packing -------------------- */
export const CirclePackingChart = ({ data, nameKey = "name", valueKey = "value", width = 600, height = 450 }) => {
    const ref = useRef(null);

    useEffect(() => {
        d3.select(ref.current).selectAll("*").remove();
        const svg = d3
            .select(ref.current)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("font", "12px sans-serif");

        const root = d3.hierarchy(data).sum((d) => d[valueKey]);
        const pack = d3.pack().size([width, height]).padding(6);
        pack(root);

        let focus = root;
        const nodes = root.descendants();
        const color = d3.scaleSequential([0, root.height], d3.interpolateMagma);
        const g = svg.append("g").attr("transform", "translate(0,0)");

        g.selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .attr("r", (d) => d.r)
            .attr("fill", (d) => (d.children ? color(d.depth) : "#fff"))
            .attr("stroke", "#777")
            .attr("pointer-events", (d) => (d === root ? "none" : "auto"))
            .on("click", (event, d) => {
                if (focus !== d) zoom(d);
                event.stopPropagation();
            });

        const label = g
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("text-anchor", "middle")
            .style("font-size", (d) => Math.max(9, d.r / 4))
            .style("fill", (d) => (d.children ? "#fff" : "#333"))
            .attr("transform", (d) =>
                d.children ? `translate(${d.x},${d.y - d.r - 4})` : `translate(${d.x},${d.y})`
            )
            .each(function (d) {
                const text = d3.select(this);
                if (d.children) {
                    text.text(d.data[nameKey]);
                } else {
                    text.append("tspan").attr("x", 0).attr("dy", 0).text(d.data[nameKey]);
                    text.append("tspan").attr("x", 0).attr("dy", 14).text(d.data[valueKey]);
                }
            })
            .on("click", (event, d) => {
                if (focus !== d) zoom(d);
                event.stopPropagation();
            });

        svg.on("click", () => zoom(root));

        function zoom(d) {
            const focus0 = focus;
            focus = d;
            svg
                .transition()
                .duration(750)
                .tween("zoom", (t) => {
                    const i = d3.interpolateZoom(
                        [focus0.x, focus0.y, focus0.r * 2],
                        [focus.x, focus.y, focus.r * 2]
                    );
                    return (t) => {
                        const v = i(t);
                        const k = Math.min(width, height) / v[2];
                        const tx = width / 2 - v[0] * k;
                        const ty = height / 2 - v[1] * k;
                        g.attr("transform", `translate(${tx},${ty}) scale(${k})`);

                        label.attr("transform", (node) =>
                            node.children
                                ? `translate(${node.x},${node.y - node.r - 4})`
                                : `translate(${node.x},${node.y})`
                        );
                    };
                });
            label.style("display", (node) => (node.r > 20 ? "block" : "none"));
        }

        const initScale = Math.min(width, height) / (root.r * 2);
        g.attr(
            "transform",
            `translate(${width / 2 - root.x * initScale},${height / 2 - root.y * initScale}) scale(${initScale})`
        );

        return () => d3.select(ref.current).selectAll("*").remove();
    }, [width, height, data, nameKey, valueKey]);

    return <div ref={ref} style={{ width: "100%", height: height }} />;
};
