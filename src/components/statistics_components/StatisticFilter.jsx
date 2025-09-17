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
import PresidentFilter from "./presidentFilter";

const menuProps = {
  PaperProps: {
    sx: {
      border: "1px solid #BABABA", 
      borderRadius: 2,
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
    <Box p="4px">
      <Typography
          variant="h5"
          align="left"
          sx={{ fontWeight: "bold", my:1 }}
        >
          Xplore
        </Typography>
      <Paper
        sx={{
          borderRadius: 4,
          maxWidth: "full",
          margin: "0 auto",
          backgroundColor: "#fff",
          boxShadow: "none"
        }}
      >
        {/* Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 4 }}>
          {["Yearly", "Department", "Presidents"].map(
            (category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "contained" : "outlined"
                }
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 400,
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
              <FormControl fullWidth>
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
                borderRadius: 2, "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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
                borderRadius: 2, "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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
                borderRadius: 2, "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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
                borderRadius: 2, "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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

          {selectedCategory === "Presidents" && (
            <PresidentFilter
              selectedPresidents={selection.Presidents.presidents}
              onSelectPresident={(pres) =>
                setSelection((prev) => ({
                  ...prev,
                  Presidents: { presidents: pres },
                }))
              }
            />
          )}

        </Box>

        {/* Show Data Button */}
        {selectedCategory != "Presidents" && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 400,
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
