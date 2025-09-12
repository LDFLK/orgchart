import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

// Tourist arrivals data
const countriesData = [
  ["Afghanistan", 39],
  ["Albania", 83],
  ["Algeria", 174],
  ["Andorra", 25],
  ["Antarctica", 1],
  ["Angola", 13],
  ["Antigua & Barbuda", 16],
  ["Argentina", 268],
  ["Armenia", 779],
  ["Australia", 30924],
  ["Austria", 5541],
  ["Azerbaijan", 781],
  ["Bahamas", 2],
  ["Bahrain", 510],
  ["Bangladesh", 3817],
  ["Barbados", 13],
  ["Belarus", 3621],
  ["Belgium", 6164],
  ["Belize", 2],
  ["Benin", 1],
  ["Bhutan", 139],
  ["Bolivia", 37],
  ["Bosnia & Herzegovina", 104],
  ["Botswana", 15],
  ["Brazil", 669],
  ["Brunei Darussalam", 16],
  ["Bulgaria", 1643],
  ["Burkina Faso", 1],
  ["Cambodia", 157],
  ["Cameroon", 7],
  ["Canada", 26845],
  ["Cape Verde", 6],
  ["Chad", 5],
  ["Chile", 182],
  ["China", 4715],
  ["Colombia", 304],
  ["Comoros", 16],
  ["Congo, Republic Of.", 14],
  ["Costa Rica", 40],
  ["Cote Divoire", 1],
  ["Croatia", 338],
  ["Cuba", 19],
  ["Cyprus", 390],
  ["Czech Republic", 7350],
  ["Denmark", 7278],
  ["Djibouti", 7],
  ["Dominica", 37],
  ["Dominican Republic", 8],
  ["Ecuador", 59],
  ["Egypt", 2340],
  ["El Salvador", 25],
  ["Equatorial Guinea", 3],
  ["Eritrea", 12],
  ["Estonia", 978],
  ["Ethiopia", 56],
  ["Fiji", 48],
  ["Finland", 1500],
  ["France", 35482],
  ["Gabon", 3],
  ["Gambia", 1],
  ["Georgia", 792],
  ["Germany", 55542],
  ["Ghana", 29],
  ["Greece", 899],
  ["Guam", 2],
  ["Grenada", 14],
  ["Guatemala", 17],
  ["Guinea-Bissau", 1],
  ["Guyana", 9],
  ["Honduras", 10],
  ["Hong Kong", 1],
  ["Haiti", 1],
  ["Hungary", 2324],
  ["Iceland", 163],
  ["India", 123004],
  ["Indonesia", 885],
  ["Iran", 4301],
  ["Iraq", 1113],
  ["Ireland", 3056],
  ["Israel", 9326],
  ["Italy", 7449],
  ["Jamaica", 13],
  ["Japan", 3087],
  ["Jordan", 2472],
  ["Kazakhstan", 8068],
  ["Kenya", 230],
  ["Kosovar", 13],
  ["Kuwait", 952],
  ["Kyrgyzstan", 532],
  ["Lao Peoples", 29],
  ["Latvia", 1305],
  ["Lebanon", 1606],
  ["Lesotho", 3],
  ["Liberia", 5],
  ["Libya", 29],
  ["Liechtenstein", 27],
  ["Lithuania", 2115],
  ["Luxembourg", 233],
  ["Macedonia", 71],
  ["Madagascar", 62],
  ["Malawi", 15],
  ["Malaysia", 2779],
  ["Maldives", 18880],
  ["Mali", 3],
  ["Malta", 273],
  ["Marshall Islands", 2],
  ["Mauritania", 5],
  ["Mauritius", 130],
  ["Mexico", 334],
  ["Micronesia", 1],
  ["Moldova", 241],
  ["Monaco", 43],
  ["Mongolia", 52],
  ["Montenegro", 59],
  ["Morocco", 446],
  ["Mozambique", 14],
  ["Myanmar", 252],
  ["Namibia", 24],
  ["Nepal", 1065],
  ["Netherlands", 11987],
  ["New Zealand", 2866],
  ["Nicaragua", 3],
  ["Nigeria", 27],
  ["Niger", 2],
  ["Norway", 5983],
  ["Oman", 876],
  ["Pakistan", 6260],
  ["Palestinian Territories", 366],
  ["Panama", 12],
  ["Papua New Guinea", 21],
  ["Paraguay", 10],
  ["Peru", 87],
  ["Philippines", 1961],
  ["Poland", 15195],
  ["Portugal", 1906],
  ["Qatar", 301],
  ["Republic Of Zimbabwe", 10],
  ["Romania", 3313],
  ["Russian Federation", 91272],
  ["Rwanda", 9],
  ["Saint Kitts And Nevis", 46],
  ["San Marino", 1],
  ["Saint Lucia", 7],
  ["Saudi Arabia", 5952],
  ["Senegal", 10],
  ["Serbia", 673],
  ["Seychelles", 347],
  ["Sierra Leone", 10],
  ["Singapore", 3770],
  ["Slovakia", 2432],
  ["Slovenia", 602],
  ["Solomon Islands", 1],
  ["Somalia", 18],
  ["South Africa-Zuid Afrika", 1502],
  ["South Korea", 1843],
  ["South Sudan", 1],
  ["Spain", 12895],
  ["Sudan", 818],
  ["Suriname", 5],
  ["Swaziland", 4],
  ["Sweden", 5097],
  ["Switzerland", 13260],
  ["Syrian Arab Republic", 14],
  ["Taiwan", 363],
  ["Tajikistan", 133],
  ["Tanzania", 85],
  ["Thailand", 1725],
  ["TIMOR-LESTE", 2],
  ["Togo", 4],
  ["Tonga", 1],
  ["Trinidad And Tobago", 22],
  ["Tunisia", 379],
  ["Turkey", 1514],
  ["Turkmenistan", 29],
  ["Uganda", 56],
  ["Ukraine", 14917],
  ["United Arab Emirates", 1347],
  ["United Kingdom", 85187],
  ["United States", 22230],
  ["Uruguay", 53],
  ["Uzbekistan", 1242],
  ["Vanuatu", 10],
  ["Venezuela", 30],
  ["Vietnam", 519],
  ["Yemen", 229],
  ["Zambia", 26],
  ["Zimbabwe", 69]
];

// Mapping for mismatched names
export const nameMapping = {
  "Antigua & Barbuda": "Antigua and Barbuda",
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Brunei Darussalam": "Brunei",
  "Cote Divoire": "Ivory Coast",
  "Kosovar": "Kosovo",
  "Lao Peoples": "Laos",
  "Micronesia": "Federated States of Micronesia",
  "Palestinian Territories": "Palestine",
  "South Africa-Zuid Afrika": "South Africa",
  "TIMOR-LESTE": "Timor-Leste",
  "United States": "United States of America",
  "Russian Federation": "Russia",
  "Syrian Arab Republic": "Syria",
  "Republic Of Zimbabwe": "Zimbabwe",
  "Saint Kitts And Nevis": "Saint Kitts and Nevis",
  "Saint Lucia": "Saint Lucia",
  "Trinidad And Tobago": "Trinidad and Tobago",
  "Congo, Republic Of.": "Congo",
  "Palestinian Territories": "Palestine",
  "Czech Republic": "Czechia",
  "Ivory Coast": "Ivory Coast",
};
function Globe({ selectedCountry, onCountryClick }) {
  const ref = useRef();
  const projectionRef = useRef();
  const pathRef = useRef();
  const countriesRef = useRef();
  const [pinPosition, setPinPosition] = useState(null);
  const [offGlobe, setOffGlobe] = useState(false);

  // NEW: control popup timing
  const [showCard, setShowCard] = useState(false);

  // Use ref to hold the latest selectedCountry for D3 drag
  const selectedCountryRef = useRef(selectedCountry);
  useEffect(() => {
    selectedCountryRef.current = selectedCountry;
  }, [selectedCountry]);

  const updatePinPosition = () => {
    const countryName = selectedCountryRef.current;
    if (!countryName) return;

    const projection = projectionRef.current;
    const countries = countriesRef.current;
    const normalized = nameMapping[countryName] || countryName;
    const country = countries.find(d => d.properties.name === normalized);

    if (!country) {
      setOffGlobe(true);
      setPinPosition(null);
      return;
    }

    const centroid = d3.geoCentroid(country);
    const [x, y] = projection(centroid);

    // visibility check using angular distance
    const rotate = projection.rotate();
    const center = [-rotate[0], -rotate[1]];
    const dist = d3.geoDistance(center, centroid);

    if (dist > Math.PI / 2) {
      setOffGlobe(true);
      setPinPosition(null);
      return;
    }

    setOffGlobe(false);
    setPinPosition([x, y]);
  };

  useEffect(() => {
    const width = 600;
    const height = 600;

    const projection = d3.geoOrthographic()
      .scale(250)
      .translate([width / 2, height / 2]);
    projectionRef.current = projection;

    const path = d3.geoPath(projection);
    pathRef.current = path;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // Sphere
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#dbeafe")
      .attr("stroke", "#333");

    // Countries
    const countries = feature(countries110m, countries110m.objects.countries).features;
    countriesRef.current = countries;

    svg.append("g")
      .selectAll("path")
      .data(countries)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#9ca3af")
      .attr("stroke", "#111");

    // Drag behavior
    const drag = d3.drag()
      .on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 0.25;
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);

        svg.selectAll("path.country").attr("d", path);
        svg.select("path").attr("d", path);

        updatePinPosition();
      });

    svg.call(drag);

    // Click on globe
    svg.on("click", (event) => {
      const [mx, my] = d3.pointer(event);
      const clicked = countries.find(c => d3.geoContains(c, projection.invert([mx, my])));
      if (clicked) {
        const name = Object.keys(nameMapping).find(k => nameMapping[k] === clicked.properties.name) || clicked.properties.name;
        onCountryClick(name);
      }
    });
  }, []);

  // Update highlight when selectedCountry changes
  useEffect(() => {
    const svg = d3.select(ref.current);
    const path = pathRef.current;
    const countries = countriesRef.current;
    const normalized = selectedCountry
      ? (nameMapping[selectedCountry] || selectedCountry)
      : null;

    svg.selectAll("path.country")
      .attr("d", path)
      .attr("fill", d =>
        normalized && d.properties.name === normalized
          ? "#69261fff"
          : "#9ca3af"
      );
  }, [selectedCountry]);

  // Rotate globe when country selected
  useEffect(() => {
    if (!selectedCountry) return;

    const svg = d3.select(ref.current);
    const projection = projectionRef.current;
    const path = pathRef.current;
    const countries = countriesRef.current;

    const normalized = nameMapping[selectedCountry] || selectedCountry;
    const country = countries.find(d => d.properties.name === normalized);
    if (!country) {
      setOffGlobe(true);
      setPinPosition(null);
      return;
    }

    const centroid = d3.geoCentroid(country);

    // hide card while rotating
    setShowCard(false);

    d3.transition()
      .duration(1250)
      .tween("rotate", () => {
        const r = d3.interpolate(projection.rotate(), [-centroid[0], -centroid[1]]);
        return t => {
          projection.rotate(r(t));
          svg.selectAll("path.country")
            .attr("d", path)
            .attr("fill", d => d.properties.name === normalized ? "#69261fff" : "#9ca3af");
          svg.select("path").attr("d", path);

          updatePinPosition();
        };
      })
      .on("end", () => {
        setShowCard(true); // only show after rotation ends
      });
  }, [selectedCountry]);

  return (
    <Box sx={{ position: "relative" }}>
      <svg ref={ref}></svg>

      {/* Floating pinned card */}
      {showCard && selectedCountry && pinPosition && !offGlobe && (
        <Box
          sx={{
            position: "absolute",
            left: pinPosition[0] + 30,
            top: pinPosition[1] - 30,
            width: 180,
            p: 1.5,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
            pointerEvents: "auto",
          }}
        >
          <IconButton
            size="small"
            onClick={() => onCountryClick(null)}
            sx={{ position: "absolute", top: 4, right: 4, padding: "2px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ fontWeight: "bold", mt: 1 }}>{selectedCountry}</Box>
          <Box>
            {`Tourists: ${countriesData.find(([n]) => n === selectedCountry)?.[1] ?? "Unknown"}`}
          </Box>
        </Box>
      )}

      {showCard && selectedCountry && !pinPosition && offGlobe && (
        <Box
          sx={{
            position: "absolute",
            right: -220,
            top: 50,
            width: 200,
            p: 1.5,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
            pointerEvents: "auto",
          }}
        >
          <IconButton
            size="small"
            onClick={() => onCountryClick(null)}
            sx={{ position: "absolute", top: 4, right: 4, padding: "2px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ fontWeight: "bold", mt: 1 }}>{selectedCountry}</Box>
          <Box>
            {`Tourists: ${countriesData.find(([n]) => n === selectedCountry)?.[1] ?? "Unknown"}`}
          </Box>
        </Box>
      )}

      {/* Connector line */}
      {showCard && selectedCountry && pinPosition && !offGlobe && (
        <svg
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 600,
            height: 600,
            pointerEvents: "none",
          }}
        >
          <line
            x1={pinPosition[0]}
            y1={pinPosition[1]}
            x2={pinPosition[0] + 30}
            y2={pinPosition[1] - 30}
            stroke="#333"
            strokeWidth={2}
          />
        </svg>
      )}
    </Box>
  );
}


export default function TouristGlobe() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = (name) => setSelectedCountry(name);

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100vh", p: 2 }}>
      {/* Left sidebar */}
      <Box sx={{ width: 250, overflowY: "auto", borderRight: "1px solid #ddd" }}>
        <List>
          {countriesData.map(([name, val]) => (
            <ListItemButton
              key={name}
              selected={name === selectedCountry}
              onClick={() => handleCountryClick(name)}
            >
              <ListItemText primary={name} secondary={`${val} tourists`} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Globe */}
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Globe selectedCountry={selectedCountry} onCountryClick={handleCountryClick} />
      </Box>
    </Box>
  );
}