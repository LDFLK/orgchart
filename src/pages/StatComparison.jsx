import { useRef, useState, useEffect } from "react";
import { Container, Grid, MenuItem, Select, FormControl, InputLabel, Button, Card, CardContent, Typography, Box, Paper } from "@mui/material";
import { SimpleBarChart, SimpleLineChart, SimplePieChart, MultiBarChart, MultiHorizontalBarChart, BubbleChart, CirclePackingChart } from "./../components/statistics_compoents/Charts.jsx";
import { years, departments, statTypes, mockData } from './../../public/statMockData'

export default function Dashboard() {
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedStat, setSelectedStat] = useState("");
    const [cards, setCards] = useState([]);
    const [displayDept, setDisplayDept] = useState("");
    const [displayStat, setDisplayStat] = useState("");

    // Filter functions (unchanged)
    const availableYears = years.filter((y) => {
        if (!selectedDept && !selectedStat) return mockData[y] !== undefined;
        if (selectedDept && !selectedStat) return mockData[y]?.[selectedDept] !== undefined;
        if (selectedDept && selectedStat) return mockData[y]?.[selectedDept]?.[selectedStat] !== undefined;
        return false;
    });

    const availableDepartments = departments.filter((d) => {
        if (!selectedYear) return true;
        if (!selectedStat) return mockData[selectedYear]?.[d] !== undefined;
        return mockData[selectedYear]?.[d]?.[selectedStat] !== undefined;
    });

    const availableStats = statTypes.filter((s) => {
        if (!selectedYear || !selectedDept) return true;
        return mockData[selectedYear]?.[selectedDept]?.[s] !== undefined;
    });

    const handleShowData = () => {
        if (selectedYear && selectedDept && selectedStat) {
            const value = mockData[selectedYear]?.[selectedDept]?.[selectedStat];
            if (value) {
                setCards([{ year: selectedYear, dept: selectedDept, stat: selectedStat, value }]);
                setDisplayDept(selectedDept);
                setDisplayStat(selectedStat);
            }
        }
    };

    const handleAddYear = (year) => {
        const value = mockData[year]?.[displayDept]?.[displayStat];
        if (value && !cards.find((c) => c.year === year)) {
            setCards([...cards, { year, dept: displayDept, stat: displayStat, value }]);
        }
    };

    const handleRemoveYear = (year) => {
        setCards(cards.filter((c) => c.year !== year));
    };
    const bubbleRef = useRef(null);
    const [bubbleWidth, setBubbleWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            if (bubbleRef.current) {
                setBubbleWidth(bubbleRef.current.getBoundingClientRect().width);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [cards]);


    const combinedChart = () => {
        if (cards.length === 0) return null;
        const type = cards[0].value.type;

        if (type === "single") {
            return (
                <Box sx={{ height: 300, mt: 2 }}>
                    <SimpleBarChart
                        data={cards.map((c) => ({ year: c.year, value: c.value.data[0].value }))}
                        xDataKey="year"
                        yDataKey="value"
                    />
                </Box>
            );
        }
        if (type === "bar") {
            const combined = cards[0].value.data.map((d) => {
                const row = { label: d.label };
                cards.forEach((c) => {
                    const found = c.value.data.find((dd) => dd.label === d.label);
                    row[c.year] = found ? found.value : null;
                });
                return row;
            });
            return (
                <Box sx={{ height: 300, mt: 2 }}>
                    <MultiBarChart data={combined} xDataKey="label" barKeys={cards.map(c => c.year.toString())} />
                </Box>
            );
        }

        if (type === "line") {
            const combined = cards[0].value.data.map((d) => {
                const row = { label: d.label };
                cards.forEach((c) => {
                    const found = c.value.data.find((dd) => dd.label === d.label);
                    row[c.year] = found ? found.value : null;
                });
                return row;
            });
            return (
                <Box sx={{ height: 300, mt: 2 }}>
                    <SimpleLineChart data={combined} xDataKey="label" lineKeys={cards.map(c => c.year.toString())} />
                </Box>
            );
        }

        if (type === "horizontal") {
            const combined = cards[0].value.data.map((d) => {
                const row = { category: d.label };
                cards.forEach((c) => {
                    const found = c.value.data.find((dd) => dd.label === d.label);
                    row[c.year] = found ? found.value : null;
                });
                return row;
            });
            return (
                <Box sx={{ height: 300, mt: 2 }}>
                    <MultiHorizontalBarChart data={combined} yDataKey="category" barKeys={cards.map(c => c.year.toString())} />
                </Box>
            );
        }

        if (type === "bubble") {
            if (cards.length === 1) {
                return (
                    <Box
                        ref={bubbleRef}
                        sx={{ width: "100%", height: 300, mt: 2, display: "flex", justifyContent: "center" }}
                    >
                        {bubbleWidth > 0 && (
                            <BubbleChart
                                data={cards[0].value.data}
                                nameKey="name"
                                valueKey="value"
                                height={340}
                                width={bubbleWidth}
                            />
                        )}
                    </Box>
                );
            } else {
                // Multiple years → CirclePackingChart
                const yearNodes = cards.map((c) => ({
                    name: c.year.toString(),
                    children: c.value.data.map(d => ({ name: d.name, value: d.value })),
                }));
                return (
                    <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 900, height: '70vh', minHeight: 300 }}>
                            <CirclePackingChart data={{ children: yearNodes }} nameKey="name" valueKey="value" />
                        </Box>
                    </Box>
                );
            }
        }
        if (type === "pie") {
            return (
                <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    {cards.map((c) => (
                        <Grid item key={c.year}>
                            <Typography variant="subtitle2" align="center">{c.year}</Typography>
                            <Box sx={{ width: 300, height: 300 }}>
                                <SimplePieChart
                                    data={c.value.data}
                                    dataKey="value"
                                    nameKey="category"
                                    width={400}
                                    height={400}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            );
        }
        return null;
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 5 }}>
            <Paper elevation={1} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2, maxWidth: "1200px", margin: "0 auto" }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1 }}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Year</InputLabel>
                        <Select value={selectedYear || ""} onChange={(e) => setSelectedYear(e.target.value)} label="Year">
                            {availableYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Department</InputLabel>
                        <Select value={selectedDept || ""} onChange={(e) => setSelectedDept(e.target.value)} label="Department">
                            {availableDepartments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Statistic Type</InputLabel>
                        <Select value={selectedStat || ""} onChange={(e) => setSelectedStat(e.target.value)} label="Statistic Type">
                            {availableStats.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button variant="contained" sx={{ width: 150, backgroundColor: "#000", "&:hover": { backgroundColor: "#333" } }} onClick={handleShowData}>
                        Show Data
                    </Button>
                </Box>
            </Paper>

            {cards.length > 0 && (
                <Typography sx={{ maxWidth: "1200px", margin: "0 auto", mt: 3 }} variant="subtitle1" color="text.secondary">
                    {displayDept} - {displayStat}
                </Typography>
            )}

            {cards.length > 0 && (
                <Paper elevation={1} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3, maxWidth: "1200px", margin: "0 auto", mt: 3 }}>
                    {years.some(y => !cards.some(c => c.year === y) && mockData[y]?.[displayDept]?.[displayStat]) && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                            <FormControl sx={{ width: { xs: "100%", sm: 200 } }} size="small">
                                <InputLabel>Add Year</InputLabel>
                                <Select value="" onChange={(e) => handleAddYear(e.target.value)} label="Add Year">
                                    {years.filter(y => !cards.some(c => c.year === y) && mockData[y]?.[displayDept]?.[displayStat])
                                        .map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    <Card sx={{ borderRadius: 3, boxShadow: 1, width: "100%" }}>
                        <CardContent>
                            {combinedChart()}
                            <Grid container spacing={1} sx={{ mt: 2 }}>
                                {cards.map(c => (
                                    <Grid item key={c.year}>
                                        <Button size="small" variant="outlined" color="error" onClick={() => handleRemoveYear(c.year)}>
                                            Remove {c.year}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Paper>
            )}
        </Container>
    );
}
