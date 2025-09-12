import { useState } from "react";
import {
    Container,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Paper
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Mock Data
const years = [2023, 2022, 2021, 2020, 2019];
const departments = ["Tourism", "Education", "Healthcare", "Infrastructure", "Defense", "Agriculture"];
const statTypes = ["Budget Allocation", "Budget Deficit/Surplus", "Expenditure", "Revenue", "Growth Rate"];

const mockData = {
    2023: { Tourism: { "Budget Allocation": 450 } },
    2022: { Tourism: { "Budget Allocation": 420 } },
    2021: { Tourism: { "Budget Allocation": 460 } },
    2020: { Tourism: { "Budget Allocation": 380 } },
    2019: { Tourism: { "Budget Allocation": 360 } },
};

export default function Dashboard() {
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedStat, setSelectedStat] = useState("");
    const [cards, setCards] = useState([]);
    const [displayDept, setDisplayDept] = useState("");
    const [displayStat, setDisplayStat] = useState("");

    const handleShowData = () => {
        if (selectedYear && selectedDept && selectedStat) {
            const value = mockData[selectedYear]?.[selectedDept]?.[selectedStat] || null;
            setCards([{ year: selectedYear, dept: selectedDept, stat: selectedStat, value }]);
            setDisplayDept(selectedDept);
            setDisplayStat(selectedStat);
        }
    };

    const handleAddYear = (year) => {
        if (cards.length < 3) {
            const value = mockData[year]?.[selectedDept]?.[selectedStat] || null;
            if (!cards.find((c) => c.year === year)) {
                setCards([...cards, { year, dept: selectedDept, stat: selectedStat, value }]);
            }
        }
    };

    const handleRemoveCard = (year) => {
        setCards(cards.filter((c) => c.year !== year));
    };

    const getDifference = (baseValue, currentValue) => {
        if (baseValue === null || currentValue === null) return null;
        const diff = currentValue - baseValue;
        const percent = baseValue !== 0 ? (diff / baseValue) * 100 : null;
        return { diff, percent };
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 5 }}>
            {/* Top Filters */}
            <Paper
                elevation={1}
                sx={{
                    p: { xs: 2, md: 4 },
                    mb: 4,
                    borderRadius: 2,
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                {/* Row for dropdowns */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 1,
                    }}
                >
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={selectedYear || ""}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            label="Year"
                            displayEmpty
                        >
                            {years.map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={selectedDept || ""}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            label="Department"
                            displayEmpty
                        >
                            {departments.map((d) => (
                                <MenuItem key={d} value={d}>
                                    {d}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Statistic Type</InputLabel>
                        <Select
                            value={selectedStat || ""}
                            onChange={(e) => setSelectedStat(e.target.value)}
                            label="Statistic Type"
                            displayEmpty
                        >
                            {statTypes.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Button row */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                        variant="contained"
                        sx={{
                            width: 150,
                            backgroundColor: "#000",
                            "&:hover": { backgroundColor: "#333" },
                        }}
                        onClick={handleShowData}
                    >
                        Show Data
                    </Button>
                </Box>
            </Paper>

            {cards.length > 0 && (
                <Typography
                    sx={{ maxWidth: "1200px", margin: "0 auto", mt: 3 }}
                    variant="subtitle1"
                    color="text.secondary"
                >
                    {displayDept} - {displayStat}
                </Typography>
            )}
            {cards.length > 0 && (
                <Paper
                    elevation={1}
                    sx={{
                        p: { xs: 2, md: 4 },
                        mb: 4,
                        borderRadius: 3,
                        maxWidth: "1200px",
                        margin: "0 auto",
                        mt: 3,
                    }}
                >
                    {/* Top Row: Year dropdown */}
                    {cards.length < 3 && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mb: 3,
                            }}
                        >
                            <FormControl sx={{ width: { xs: "100%", sm: 200 } }} size="small">
                                <InputLabel>Select Year</InputLabel>
                                <Select
                                    value=""
                                    onChange={(e) => handleAddYear(e.target.value)}
                                    label="Select Year"
                                >
                                    {years
                                        .filter((y) => !cards.some((c) => c.year === y))
                                        .map((y) => (
                                            <MenuItem key={y} value={y}>
                                                {y}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    {/* Cards Grid */}
                    <Grid
                        container
                        spacing={3}
                        justifyContent={{ xs: "center", md: "flex-start" }}
                    >
                        {cards.map((card, index) => {
                            const baseValue = cards[0].value;
                            const diff = index > 0 ? getDifference(baseValue, card.value) : null;

                            let diffColor = "text.secondary";
                            if (diff) {
                                if (diff.diff > 0) diffColor = "success.main";
                                else if (diff.diff < 0) diffColor = "error.main";
                            }

                            const largeScreenWidth =
                                cards.length === 1
                                    ? "100%"
                                    : cards.length === 2
                                        ? "calc(50% - 12px)"
                                        : "calc(33.33% - 16px)"; 

                            return (
                                <Grid
                                    item
                                    key={card.year}
                                    sx={{
                                        flex: { xs: "0 1 100%", md: `0 1 ${largeScreenWidth}` },
                                    }}
                                >
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            boxShadow: 1,
                                            width: "100%",
                                        }}
                                    >
                                        <CardContent>
                                            <Grid
                                                container
                                                justifyContent="space-between"
                                                alignItems="center"
                                                sx={{ mb: 1 }}
                                            >
                                                <Typography variant="h6" fontWeight="bold">
                                                    {card.year}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveCard(card.year)}
                                                >
                                                    <Close />
                                                </IconButton>
                                            </Grid>

                                            <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                                                {card.value !== null ? `$${card.value}M` : "N/A"}
                                            </Typography>

                                            {diff && (
                                                <Typography variant="body1" color={diffColor}>
                                                    {diff.diff > 0 ? "+" : ""}
                                                    {diff.diff} ({diff.percent?.toFixed(1)}%)
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            )}
        </Container>

    );
}
