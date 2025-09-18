import { useRef, useState, useEffect } from "react";
import {
    Container, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Checkbox, ListItemText, Box,
    colors,
} from "@mui/material";
import {
    SimpleBarChart, SimpleLineChart, SimplePieChart, MultiBarChart, MultiHorizontalBarChart, BubbleChart, CirclePackingChart,
} from "./../components/statistics_components/Charts";
import { years, departments, statTypes, mockData, yearlyMockData } from "../assets/statMockData";
import StatisticsFilters from "./../components/statistics_components/StatisticFilter";
import PresidentCard from "./../components/statistics_components/president_card"


export default function Dashboard({selectedNode}) {
    const [selection, setSelection] = useState({
        Department: { year: "", dept: "", stat: "" },
        Yearly: { year: "", stat: "" },
        Presidents: { presidents: [] },
        Ministries: { ministries: [] }
    });

    const [selectedCategory, setSelectedCategory] = useState("Yearly"); // default
    const [cards, setCards] = useState([]);
    const [displayDept, setDisplayDept] = useState("");
    const [displayStat, setDisplayStat] = useState("");
    const [displayYearlyStat, setDisplayYearlyStat] = useState("")
    const bubbleRef = useRef(null);
    const [bubbleWidth, setBubbleWidth] = useState(0);
    const { year, dept, stat } = selection[selectedCategory] || {};


    useEffect(() => {
        setCards([]);
        setDisplayDept("");
        setDisplayStat("");
        setDisplayYearlyStat("");
    }, [selectedCategory]);

    useEffect(()=>{console.log('selectedNode from comparison : ', selectedNode)},[selectedNode])


    // if(selectedNode.type == "department"){
    //     setSelectedCategory("Department");
    // }


    // Filter dropdowns
    const availableYears = years.filter((y) => {
        if (selectedCategory === "Department") {
            if (!dept && !stat) return mockData[y] !== undefined;
            if (dept && !stat) return mockData[y]?.[dept] !== undefined;
            if (dept && stat) return mockData[y]?.[dept]?.[stat] !== undefined;
            return false;
        }

        if (selectedCategory === "Yearly") {
            return yearlyMockData[y] !== undefined;
        }

        return false;
    });

    const availableDepartments = departments.filter((d) => {
        if (selectedCategory === "Department") {
            if (!year) return true;
            if (!stat) return mockData[year]?.[d] !== undefined;
            return mockData[year]?.[d]?.[stat] !== undefined;
        }

        if (selectedCategory === "Yearly") {
            return false;
        }

        return false;
    });

    const availableStats =
        selectedCategory === "Department"
            ? statTypes.filter((s) => {
                if (!year || !dept) return true;
                return mockData[year]?.[dept]?.[s] !== undefined;
            })
            : Object.keys(yearlyMockData[selection.Yearly.year || Object.keys(yearlyMockData)[0]] || {});

    const handleShowData = () => {
        if (selectedCategory === "Department") {
            if (year && dept && stat) {
                const value = mockData[year]?.[dept]?.[stat];
                if (value) {
                    setCards([{ year, dept, stat, value }]);
                    setDisplayDept(selection.Department.dept);
                    setDisplayStat(selection.Department.stat);
                }
            }
        }

        if (selectedCategory === "Yearly") {
            if (year && stat) {
                const value = yearlyMockData[year]?.[stat];
                if (value !== undefined) {
                    setCards([{ year, stat, value }]);
                    setDisplayYearlyStat(selection.Yearly.stat);
                }
            }
        }
    };
    const compareYears = selectedCategory === "Department"
        ? years.filter((y) => mockData[y]?.[displayDept]?.[displayStat])
        : years.filter((y) => yearlyMockData[y]?.[displayYearlyStat]);

    const handleYearChange = (event) => {
        const selected = event.target.value;

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

        if (selectedCategory === "Yearly") {
            selected.forEach((y) => {
                if (!cards.some((c) => c.year === y)) {
                    const value = yearlyMockData[y]?.[stat];
                    if (value !== undefined) {
                        setCards((prev) => [...prev, { year: y, stat, value }]);
                    }
                }
            });
        }

        // Remove deselections
        setCards((prev) => prev.filter((c) => selected.includes(c.year)));
    };


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
                <Box sx={{ height: 300, mt: 2 ,width: 'full'}}>
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
                <Box sx={{ height: 300, mt: 2 }}>
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
                <Box sx={{ height: 300, mt: 2 }}>
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


    return (
        <Box sx={{
            overflow: "auto"
        }}>
            <StatisticsFilters
                selection={selection}
                setSelection={setSelection}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availableYears={availableYears}
                availableDepartments={availableDepartments}
                availableStats={availableStats}
                handleShowData={handleShowData}
            />

            {cards.length > 0 && selectedCategory === "Department" && (
                <Typography sx={{margin: "0 auto", mt: 3, fontWeight: "bold" }} variant="subtitle1" color={colors.textMuted}>
                    {displayDept} - {displayStat}
                </Typography>
            )}

            {cards.length > 0 && selectedCategory === "Yearly" && (
                <Typography sx={{margin: "0 auto", mt: 3, fontWeight: "bold" }} variant="subtitle1" color={colors.textMuted}>
                    {displayYearlyStat}
                </Typography>
            )}


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
                        mt: 3,
                        backgroundColor: "#fafafa",
                        width: '100%'
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
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
                                {compareYears.map((y) => (
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
