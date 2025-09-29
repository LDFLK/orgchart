import { useRef, useState, useEffect, useCallback } from "react";
import {
    Container, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Checkbox, ListItemText, Box,
    colors,
} from "@mui/material";
import {
    SimpleBarChart, SimpleLineChart, SimplePieChart, MultiBarChart, MultiHorizontalBarChart, BubbleChart, CirclePackingChart,
} from "./../components/statistics_components/Charts";
import { departments, statTypes, mockData, yearlyMockData } from "../assets/statMockData";
import StatisticsFilters from "./../components/statistics_components/StatisticFilter";
import PresidentCard from "./../components/statistics_components/president_card"
import StatisticTimeline from "../components/statistics_components/StatisticTimeline";


export default function Dashboard({ selectedNode }) {
    const [selection, setSelection] = useState({
        Department: { year: "", dept: "", stat: "" },
        // Yearly: { year: "", stat: "" },
        // Presidents: { presidents: [] },
        // Ministries: { ministries: [] }
    });

    const [selectedCategory, setSelectedCategory] = useState("Department");
    const [cards, setCards] = useState([]);
    // const [displayDept, setDisplayDept] = useState("");
    // const [displayStat, setDisplayStat] = useState("");
    // const [displayYearlyStat, setDisplayYearlyStat] = useState("")
    const bubbleRef = useRef(null);
    const [bubbleWidth, setBubbleWidth] = useState(0);
    const { year, dept, stat } = selection[selectedCategory] || {};
    const [userSelectedDateRange, setUserSelectedDateRange] = useState([null, null]);
    const [rangeYears, setRangeYears] = useState([]);

   
    useEffect(() => {
        setCards([]);
        // setDisplayDept("");
        // setDisplayStat("");
        // setDisplayYearlyStat("");
    }, [selectedCategory]);

    useEffect(() => { console.log('selectedNode from comparison : ', selectedNode) }, [selectedNode])

    const availableDepartments = departments.filter((d) => {
        if (selectedCategory === "Department") {
            if (!year) return true;
            if (!stat) return mockData[year]?.[d] !== undefined;
            return mockData[year]?.[d]?.[stat] !== undefined;
        }

        // if (selectedCategory === "Yearly") {
        //     return false;
        // }

        return false;
    });

    const availableStats =
        selectedCategory === "Department"
            ? statTypes.filter((s) => {
                if (!dept || rangeYears.length === 0) return false;

                // Check if this stat exists in ANY year of the selected range
                return rangeYears.some((y) => mockData[y]?.[dept]?.[s] !== undefined);
            })
            : (() => {
                if (rangeYears.length === 0) return [];

                // Collect all stats across the range
                const statsSet = new Set();
                rangeYears.forEach((y) => {
                    const statsForYear = yearlyMockData[y] || {};
                    Object.keys(statsForYear).forEach((s) => statsSet.add(s));
                });

                return Array.from(statsSet);
            })();

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

    const combinedChart = () => {
        if (cards.length === 0) return null;
        const type = cards[0].value.type;

        if (type === "single") {
            return (
                <Box sx={{ height: 250, mt: 6 }}>
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
                <Box sx={{ height: 250, mt: 2, width: 'full' }}>
                    <MultiBarChart data={combined} xDataKey="label" barKeys={cards.map((c) => c.year.toString())} />
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
                <Box sx={{ height: 250, mt: 2 }}>
                    <SimpleLineChart data={combined} xDataKey="label" lineKeys={cards.map((c) => c.year.toString())} />
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
                <Box sx={{ height: 250, mt: 2 }}>
                    <MultiHorizontalBarChart data={combined} yDataKey="category" barKeys={cards.map((c) => c.year.toString())} />
                </Box>
            );
        }
        if (type === "bubble") {
            if (cards.length === 1) {
                return (
                    <Box ref={bubbleRef} sx={{ width: "100%", height: 300, mt: 2, display: "flex", justifyContent: "center" }}>
                        {bubbleWidth > 0 && (
                            <BubbleChart data={cards[0].value.data} nameKey="name" valueKey="value" height={340} width={bubbleWidth} />
                        )}
                    </Box>
                );
            } else {
                const yearNodes = cards.map((c) => ({
                    name: c.year.toString(),
                    children: c.value.data.map((d) => ({ name: d.name, value: d.value })),
                }));
                return (
                    <Box sx={{ width: "100%", mt: 2, display: "flex", justifyContent: "center" }}>
                        <Box sx={{ width: "100%", maxWidth: 900, height: "70vh", minHeight: 300 }}>
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
                                <SimplePieChart data={c.value.data} dataKey="value" nameKey="category" width={400} height={400} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            );
        }
        return null;
    };

    const renderPresidentChart = () => {
        if (!selection.Presidents.presidents.length) return null;

        const metrics = [
            { key: "cabinetSize", title: "Cabinet Size", color: "#2563eb" },
            { key: "departments", title: "Departments", color: "#16a34a" },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {metrics.map((metric) => {
                    const chartData = selection.Presidents.presidents.map((p) => ({
                        name: p.name.split(" ").slice(0)[0], // first name
                        fullName: p.name,
                        value: p[metric.key],
                        term: p.term,
                    }));

                    return (
                        <div
                            key={metric.key}
                            className="bg-white p-4 rounded-lg"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                {metric.title}
                            </h3>
                            <div className="h-64">
                                <SimpleBarChart
                                    data={chartData}
                                    xDataKey="name"
                                    yDataKey="value"
                                    barFill={metric.color}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

       const handleYearChange = (event) => {
        const selected = event.target.value;
        if (selected.length === 0) return;

        if (selectedCategory === "Department") {
            selected.forEach((y) => {
                if (!cards.some((c) => c.year === y)) {
                    const value = mockData[y]?.[dept]?.[stat];
                    if (value) {
                        setCards((prev) => [...prev, { year: y, dept, stat, value }]);
                    }
                }
            });
        }

        // if (selectedCategory === "Yearly") {
        //     selected.forEach((y) => {
        //         if (!cards.some((c) => c.year === y)) {
        //             const value = yearlyMockData[y]?.[stat];
        //             if (value !== undefined) {
        //                 setCards((prev) => [...prev, { year: y, stat, value }]);
        //             }
        //         }
        //     });
        // }

        // Remove deselections but ensure at least one remains
        if (selected.length >= 1) {
            setCards((prev) => prev.filter((c) => selected.includes(c.year)));
        }
    };

     useEffect(() => {
        if (rangeYears.length === 0) return;

        if (selectedCategory === "Department" && dept && stat) {
            const newCards = rangeYears
                .map((y) => {
                    const value = mockData[y]?.[dept]?.[stat];
                    return value ? { year: y, dept, stat, value } : null;
                })
                .filter(Boolean);
            setCards(newCards);
        }

        // if (selectedCategory === "Yearly" && stat) {
        //     const newCards = rangeYears
        //         .map((y) => {
        //             const value = yearlyMockData[y]?.[stat];
        //             return value !== undefined ? { year: y, stat, value } : null;
        //         })
        //         .filter(Boolean);
        //     setCards(newCards);
        // }
    }, [rangeYears, dept, stat, selectedCategory]);

    const handleDateRangeChange = useCallback((dateRange) => {
        const [startDate, endDate] = dateRange;
        setUserSelectedDateRange([startDate, endDate]);
        console.log("Selected date range in Dashboard:", startDate, endDate);

        if (startDate && endDate) {
            const startYear = startDate.getUTCFullYear();
            const endYear = endDate.getUTCFullYear();

            // Generate list of years between startYear and endYear
            const yearsInRange = Array.from(
                { length: endYear - startYear + 1 },
                (_, i) => startYear + i
            );

            setRangeYears(yearsInRange);
        }
    }, []);

    return (
        <Box sx={{
            gap: 2,
            px: { xs: 1, sm: 2 },
            width: "100%",
        }}>

            <StatisticTimeline
                startYear={2019}
                onDateChange={handleDateRangeChange}
            ></StatisticTimeline>


            <StatisticsFilters
                selection={selection}
                setSelection={setSelection}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availableDepartments={availableDepartments}
                availableStats={availableStats}
  
            />

            {cards.length > 0 && selectedCategory === "Department" && (
                <Typography sx={{ margin: "0 auto", mt: 3, fontWeight: "bold", mb: 1 }} variant="subtitle1" color={colors.textMuted}>
                    {dept} - {stat}
                </Typography>
            )}

            {/* {cards.length > 0 && selectedCategory === "Yearly" && (
                <Typography sx={{ margin: "0 auto", mt: 3, fontWeight: "bold" }} variant="subtitle1" color={colors.textMuted}>
                    {displayYearlyStat}
                </Typography>
            )} */}


            {selectedCategory === "Presidents" && selection.Presidents.presidents.length > 0 && (
                <>
                    {/* President Metrics Charts */}
                    {renderPresidentChart()}

                    {/* selected President Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {selection.Presidents.presidents.map((p) => (
                            <PresidentCard
                                key={p.id}
                                president={p}
                                onRemove={() =>
                                    setSelection((prev) => ({
                                        ...prev,
                                        Presidents: {
                                            ...prev.Presidents,
                                            presidents: prev.Presidents.presidents.filter(
                                                (pr) => pr.id !== p.id
                                            ),
                                        },
                                    }))
                                }
                            />
                        ))}
                    </div>
                </>
            )}

            {cards.length > 0 && (
                <Paper

                    elevation={1}
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 4,
                        borderRadius: 4,
                        margin: "0 auto",
                        mt: -1,
                        backgroundColor: "#fafafa",
                        width: '100%'
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, mt: -2 }}>
                        <FormControl
                            sx={{
                                width: { xs: "100%", sm: 250 },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#3d3b3bff",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                                    borderColor: "#343434ff",
                                },
                            }}
                            size="small"
                        >
                            <InputLabel id="year-label">Compare</InputLabel>
                            <Select
                                labelId="year-label"
                                multiple
                                value={cards.map((c) => c.year)}
                                onChange={handleYearChange}
                                renderValue={() => null}
                                MenuProps={menuProps}
                                displayEmpty
                                label="compare with"
                            >
                                {rangeYears
                                    .filter((y) =>
                                        selectedCategory === "Department"
                                            ? mockData[y]?.[selection.Department.dept]?.[selection.Department.stat]
                                            : yearlyMockData[y]?.[selection.Yearly.stat]
                                    )
                                    .map((y) => (
                                        <MenuItem key={y} value={y}>
                                            <Checkbox
                                                checked={cards.some((c) => c.year === y)}
                                                sx={{ color: "#000", "&.Mui-checked": { color: "#000" } }}
                                            />
                                            <ListItemText primary={y} />
                                        </MenuItem>
                                    ))}
                            </Select>


                        </FormControl>
                    </Box>

                    {/* Chart Card */}
                    <Card
                        sx={{
                        
                            borderRadius: 4,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            width: "100%"

                        }}
                    >
                        <CardContent >{combinedChart()}</CardContent>
                    </Card>
                </Paper>
            )}
        </Box>
    );
}
