// StatisticsFilters.jsx
import React from "react";
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
import PresidentComparison from "./president_comparison";

const menuProps = {
  PaperProps: {
    sx: {
      "& .MuiMenuItem-root": {
        "&.Mui-selected": { backgroundColor: "#e0e0e0 !important" },
        "&:hover": { backgroundColor: "#e0e0e0" },
      },
    },
  },
};

export default function StatisticsFilters({
  selection,
  setSelection,
  selectedCategory,
  setSelectedCategory,
  availableYears,
  availableDepartments,
  availableStats,
  handleShowData,
}) {
  const current = selection[selectedCategory];

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          maxWidth: "full",
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
          {["Yearly", "Ministry", "Department", "Presidents"].map(
            (category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "contained" : "outlined"
                }
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: selectedCategory === category ? "#000" : "#fff",
                  color: selectedCategory === category ? "#fff" : "#000",
                  border:
                    selectedCategory === category
                      ? "none"
                      : "1px solid #f0f0f0",
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
            )
          )}
        </Box>

        {/* Dropdowns */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
          {selectedCategory === "Yearly" && (
            <>
              <FormControl fullWidth variant="outlined" sx={{
                borderRadius: 3, "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3d3b3bff",
                },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#343434ff",
                },
              }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={current.year || ""}
                  onChange={(e) => setSelection(prev => ({ ...prev, Yearly: { ...prev.Yearly, year: e.target.value } }))}
                  label="Year"
                  MenuProps={menuProps}
                >
                  {availableYears.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{
                borderRadius: 3, "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3d3b3bff",
                },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#343434ff",
                },
              }}>
                <InputLabel>Statistic</InputLabel>
                <Select
                  value={current.stat || ""}
                  onChange={(e) => setSelection(prev => ({ ...prev, Yearly: { ...prev.Yearly, stat: e.target.value } }))}
                  label="Statistic"
                  MenuProps={menuProps}
                >
                  {availableStats.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {selectedCategory === "Department" && (
            <>
              <FormControl fullWidth variant="outlined" sx={{
                borderRadius: 3, "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3d3b3bff",
                },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#343434ff",
                },
              }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={current.dept || ""}
                  onChange={(e) => setSelection(prev => ({ ...prev, Department: { ...prev.Department, dept: e.target.value } }))}
                  label="Department"
                  MenuProps={menuProps}
                >
                  {availableDepartments.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{
                borderRadius: 3, "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3d3b3bff",
                },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#343434ff",
                },
              }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={current.year || ""}
                  onChange={(e) => setSelection(prev => ({ ...prev, Department: { ...prev.Department, year: e.target.value } }))}
                  label="Year"
                  MenuProps={menuProps}
                >
                  {availableYears.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{
                borderRadius: 3, "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#3d3b3bff",
                },
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#343434ff",
                },
              }}>
                <InputLabel>Statistic</InputLabel>
                <Select
                  value={current.stat || ""}
                  onChange={(e) => setSelection(prev => ({ ...prev, Department: { ...prev.Department, stat: e.target.value } }))}
                  label="Statistic"
                  MenuProps={menuProps}
                >
                  {availableStats.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {selectedCategory === "Presidents" && <PresidentComparison />}
        </Box>

        {/* Show Data Button */}
        {selectedCategory != "Presidents" && (
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
        )}
      </Paper>
    </Box>
  );
}
