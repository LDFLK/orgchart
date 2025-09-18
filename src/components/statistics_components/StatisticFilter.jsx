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
import { useThemeContext } from "../../themeContext";

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

  const { colors, isDark } = useThemeContext();

  return (
    <Box p="4px">
      <Typography variant="h5" align="left" sx={{ fontWeight: "bold", my: 1 }}>
        Xplore
      </Typography>
      <Paper
        sx={{
          borderRadius: 4,
          maxWidth: "full",
          margin: "0 auto",
          backgroundColor: colors.backgroundWhite,
          boxShadow: "none",
          padding: 2,
        }}
      >
        {/* Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 4 }}>
          {["Yearly", "Department", "Presidents"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "contained" : "outlined"}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 400,
                textTransform: "none",
                bgcolor:
                  selectedCategory === category
                    ? isDark
                      ? "#fff"
                      : "#000"
                    : "",
                color:
                  selectedCategory === category
                    ? isDark
                      ? "#000"
                      : "#fff"
                    : isDark
                    ? "#fff"
                    : "#000",
                border:
                  selectedCategory === category ? "none" : "1px solid #f0f0f0"
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
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Year
                </InputLabel>
                <Select
                  value={current.year || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Yearly: { ...prev.Yearly, year: e.target.value },
                    }))
                  }
                  label="Year"
                  MenuProps={menuProps}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // default border
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on focus
                    },
                    "& .MuiSelect-select": {
                      color: colors.textMuted, // selected text color
                    },
                  }}
                >
                  {availableYears.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Statistic
                </InputLabel>
                <Select
                  value={current.stat || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Yearly: { ...prev.Yearly, stat: e.target.value },
                    }))
                  }
                  label="Statistic"
                  MenuProps={menuProps}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // default border
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on focus
                    },
                    "& .MuiSelect-select": {
                      color: colors.textMuted, // selected text color
                    },
                  }}
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

          {selectedCategory === "Department" && (
            <>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Department
                </InputLabel>
                <Select
                  value={current.dept || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Department: { ...prev.Department, dept: e.target.value },
                    }))
                  }
                  label="Department"
                  MenuProps={menuProps}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // default border
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on focus
                    },
                    "& .MuiSelect-select": {
                      color: colors.textMuted, // selected text color
                    },
                  }}
                >
                  {availableDepartments.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Year
                </InputLabel>
                <Select
                  value={current.year || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Department: { ...prev.Department, year: e.target.value },
                    }))
                  }
                  label="Year"
                  MenuProps={menuProps}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // default border
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on focus
                    },
                    "& .MuiSelect-select": {
                      color: colors.textMuted, // selected text color
                    },
                  }}
                >
                  {availableYears.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Statistic
                </InputLabel>
                <Select
                  value={current.stat || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Department: { ...prev.Department, stat: e.target.value },
                    }))
                  }
                  label="Statistic"
                  MenuProps={menuProps}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // default border
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textMuted, // on focus
                    },
                    "& .MuiSelect-select": {
                      color: colors.textMuted, // selected text color
                    },
                  }}
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
          {selectedCategory === "Ministry" && (
            <>
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Ministry
                </InputLabel>
                <Select label="Minister">
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.textPrimary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: colors.textPrimary,
                  },
                }}
              >
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    "&.Mui-focused": {
                      color: colors.textMuted, // label color when focused
                    },
                  }}
                >
                  Statistic
                </InputLabel>
                <Select label="Statistic">
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
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
