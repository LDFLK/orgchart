// StatisticsFilters.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const menuProps = {
  PaperProps: {
    sx: {
      "& .MuiMenuItem-root": {
        "&.Mui-selected": {
          backgroundColor: "#e0e0e0 !important",
        },
        "&:hover": {
          backgroundColor: "#e0e0e0",
        },
      },
    },
  },
};

export default function StatisticsFilters({
  selectedYear,
  setSelectedYear,
  availableYears,
  selectedDept,
  setSelectedDept,
  availableDepartments,
  selectedStat,
  setSelectedStat,
  availableStats,
  handleShowData,
}) {
  const [selectedCategory, setSelectedCategory] = useState("Department"); // default

  return (
    <Box sx={{ mt: 5 }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "#fff",
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: "bold", mb: 4 }}
        >
          Xplore Statistics
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
          {["Yearly", "Ministry", "Department"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "contained" : "outlined"}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                bgcolor: selectedCategory === category ? "#000" : "#fff",
                color: selectedCategory === category ? "#fff" : "#000",
                border:
                  selectedCategory === category ? "none" : "1px solid #f0f0f0",
                "&:hover": {
                  bgcolor: selectedCategory === category ? "#222" : "#f0f0f0",
                  border:
                    selectedCategory === category ? "none" : "1px solid #000",
                },
              }}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </Box>

        {/* Dropdowns */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          {selectedCategory === "Yearly" && (
            <>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                <InputLabel>Year</InputLabel>
                <Select label="Year">
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                <InputLabel>Statistic</InputLabel>
                <Select label="Statistic">
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {selectedCategory === "Ministry" && (
            <>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                <InputLabel>Minister</InputLabel>
                <Select label="Minister">
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                <InputLabel>Statistic</InputLabel>
                <Select label="Statistic">
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {selectedCategory === "Department" && (
            <>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#000",
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#000" },
                }}
              >
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear || ""}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Year"
                  MenuProps={menuProps}
                  sx={{ borderRadius: 3 }}
                >
                  {availableYears.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#000",
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#000" },
                }}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDept || ""}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  label="Department"
                  MenuProps={menuProps}
                  sx={{ borderRadius: 3 }}
                >
                  {availableDepartments.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#000",
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#000" },
                }}
              >
                <InputLabel>Statistic Type</InputLabel>
                <Select
                  value={selectedStat || ""}
                  onChange={(e) => setSelectedStat(e.target.value)}
                  label="Statistic Type"
                  MenuProps={menuProps}
                  sx={{ borderRadius: 3 }}
                >
                  {availableStats.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Box>

        {/* Show Data Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            sx={{
              width: 160,
              py: 1,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#000",
              "&:hover": { backgroundColor: "#222" },
            }}
            onClick={handleShowData}
          >
            Show Data
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
