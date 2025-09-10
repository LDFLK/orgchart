import React, { useEffect, useState } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import stringSimilarity from "string-similarity";
import { Card, CardContent, Typography } from "@mui/material";

const DistrictMap = () => {
  const [mapData, setMapData] = useState(null);

  // Dataset: District name + Number of Rooms
  const rows = [
    ["Colombo", 8758],
    ["Galle", 8135],
    ["Gampaha", 4261],
    ["Kalutara", 3809],
    ["Kandy", 3637],
    ["Matale", 2177],
    ["Matara", 2292],
    ["Nuwara Eliya", 2206],
    ["Hambantota", 2088],
    ["Badulla", 1986],
    ["Anuradhapura", 1543],
    ["Puttalam", 1364],
    ["Batticaloa", 869],
    ["Ampara", 725],
    ["Trincomalee", 720],
    ["Polonnaruwa", 615],
    ["Ratnapura", 601],
    ["Moneragala", 604],
    ["Jaffna", 540],
    ["Kurunegala", 520],
    ["Kegalle", 424],
    ["Vavuniya", 77],
    ["Kilinochchi", 85],
    ["Mullaitivu", 58],
    ["Mannar", 26],
  ];

  useEffect(() => {
    fetch("https://code.highcharts.com/mapdata/countries/lk/lk-all.topo.json")
      .then((res) => res.json())
      .then((topo) => {
        const objKey = Object.keys(topo.objects)[0];
        const geometries = topo.objects[objKey].geometries;

        // Fuzzy match alt-names to dataset
        geometries.forEach((f) => {
          if (f.properties["alt-name"]) {
            const names = f.properties["alt-name"].split("|").map((n) => n.trim());
            const { bestMatch } = stringSimilarity.findBestMatch(
              names.join(" "),
              rows.map((r) => r[0])
            );
            f.properties.name = bestMatch.target;
          }
        });

        topo.objects[objKey].geometries = geometries;
        setMapData(topo);
      });
  }, []);

  // Map rows into { name, value } objects for Highcharts
  const mapSeriesData = rows.map(([district, value]) => ({ name: district, value }));

  const options = mapData
    ? {
        chart: {
          map: mapData,
        },
        title: { text: "Number of Rooms by District" },
        colorAxis: {
          min: 0,
          stops: [
            [0, "#E0F7FA"],
            [0.5, "#26C6DA"],
            [1, "#006064"],
          ],
        },
        tooltip: {
          pointFormat: "{point.name}: <b>{point.value}</b>",
        },
        series: [
          {
            mapData,
            name: "Rooms",
            data: mapSeriesData,
            joinBy: ["name", "name"], // match property name to data name
            states: { hover: { color: "#FF7043" } },
            dataLabels: {
              enabled: true,
              format: "{point.name}",
              allowOverlap: true,
              style: { fontSize: "11px" },
            },
          },
        ],
      }
    : null;

  return (
    <Card sx={{ width: "100%", height: "700px", mt: 2 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Sri Lanka Districts Map
        </Typography>
        <div style={{ height: "90%" }}>
          {options ? (
            <HighchartsReact
              constructorType="mapChart"
              highcharts={Highcharts}
              options={options}
              containerProps={{ style: { height: "100%" } }}
            />
          ) : (
            <Typography>Loading map…</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DistrictMap;
