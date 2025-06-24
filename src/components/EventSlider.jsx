import * as React from "react";
import { Typography } from "@mui/material";
import PresidencyTimeline from "./PresidencyTimeline";

export default function EventSlider({ data, selectedDate }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (selectedDate) {
      const index = data.findIndex((item) => item.date === selectedDate);
      if (index !== -1 && index !== selectedIndex) {
        setSelectedIndex(index);
      }
    }
  }, [selectedDate, data]);


  if (!data || data.length === 0) {
    return <Typography>No dates to display</Typography>;
  }

  // Spread values equally between 0 and 100
  // const stepSize = 100 / (data.length - 1);
  // const marks = data.map((item, index) => ({
  //   value: index * stepSize,
  //   label: item.date, // Show date as label
  // }));

  // const handleChange = (event, newValue) => {
  //   const newIndex = Math.round(newValue / stepSize);
  //   if (newIndex !== selectedIndex) {
  //     setSelectedIndex(newIndex);
  //     onSelectDate(data[newIndex].date);
  //     console.log("EventSlider.jsx: data[newIndex].date:", data[newIndex].date);
  //     console.log("EventSlider.jsx: Data:", data[newIndex]);
  //   }
  // };

  return (

    <>
      {/* <Typography variant="h6" gutterBottom>
        Event Timeline
      </Typography> */}
      <PresidencyTimeline/>

      {/* <Slider
        value={selectedIndex * stepSize}
        onChange={handleChange}
        step={null} // Only allow selecting predefined dates
        marks={marks}
        sx={{
          // the value marks
          "& .MuiSlider-mark": {
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid white",
            backgroundColor: "#444", // Change color as needed
            transform: "translate(-50%, -50%)",
          },
          // the piece that you slide
          "& .MuiSlider-thumb": {
            width: 16, // Same size as marks
            height: 16,
            backgroundColor: "#2593B8", // Solid color for the thumb
            border: "2px solid #2593B8",
            // border: "2px solid white",
          },
          // the label
          "& .MuiSlider-markLabel": {
            fontSize: "1rem",
            //transform: "rotate(-30deg)", // Tilt labels if long
            whiteSpace: "nowrap",
            transform: "translate(-50%, -50px)",
            color: "white",
          },
          // the active mark representing currently selected value
          "& .MuiSlider-markActive": {
            backgroundColor: "#2593B8", // Highlight when selected
          },
          // track the thumb slides across
          "& .MuiSlider-track": {
            height: 4, // Adjust line thickness
            backgroundColor: "#2593B8", // Darker color for the selected track
          },
          // background line, part of the slider unselected
          "& .MuiSlider-rail": {
            height: 4, // Adjust line thickness
            backgroundColor: "white", // Lighter color for the unselected track
            //opacity: 1
          },
        }}
      /> */}

      {/* <Typography variant="body1" sx={{ marginBottom: 2 }}> */}
      {/* Selected Date:{" "} */}
      {/* {marks.find((mark) => mark.value === selectedValue)?.label}
      </Typography> */}

      </>
  );
}
