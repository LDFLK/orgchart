import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { SimpleBarChart, SimplePieChart, SimpleLineChart, MultiBarChart, HorizontalBarChart, BubbleChart, CirclePackingChart, MultiHorizontalBarChart, } from "./Charts";
import DistrictMap from "./DistrictMap";

/* -------------------- Sample Data -------------------- */
const barData = [
    { name: "A", value: 40 },
    { name: "B", value: 30 },
    { name: "C", value: 20 },
    { name: "D", value: 27 },
];

const pieData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 },
];

const lineData = [
    { name: "Jan", uv: 400, pv: 240 },
    { name: "Feb", uv: 300, pv: 139 },
    { name: "Mar", uv: 200, pv: 980 },
    { name: "Apr", uv: 278, pv: 390 },
    { name: "May", uv: 189, pv: 480 },
];

const multiBarData = [
    { name: "2018", apples: 400, bananas: 240 },
    { name: "2019", apples: 300, bananas: 139 },
    { name: "2020", apples: 200, bananas: 980 },
    { name: "2021", apples: 278, bananas: 390 },
];

const horizontalData = [
    { country: "USA", value: 400 },
    { country: "UK", value: 300 },
    { country: "Canada", value: 200 },
    { country: "Germany", value: 278 },
];

const multiHorizontalData = [
    { country: "USA", apples: 400, bananas: 240 },
    { country: "UK", apples: 300, bananas: 139 },
    { country: "Canada", apples: 200, bananas: 980 },
    { country: "Germany", apples: 278, bananas: 390 },
];

const bubbleData = [
    { name: "USA", value: 400 },
    { name: "UK", value: 300 },
    { name: "Canada", value: 200 },
    { name: "Germany", value: 278 },
    { name: "France", value: 180 },
];

const circlePackingData = {
    name: "World",
    children: [
        {
            name: "Europe",
            children: [
                { name: "Germany", value: 200 },
                { name: "France", value: 180 },
                { name: "UK", value: 300 },
            ],
        },
        {
            name: "North America",
            children: [
                { name: "USA", value: 400 },
                { name: "Canada", value: 200 },
            ],
        },
    ],
};

const districtData = [
    ["Colombo", 8758],
    ["Galle", 8135],
    ["Gampaha", 4261],
    ["Kalutara", 3809],
    ["Kandy", 3637],
    ["Matale", 2177],
    ["Matara", 2292],
    ["Nuwara Eliya", 2206],
    ["Hambantota", 2088],
    ["Badulla", 1986],
    ["Anuradhapura", 1543],
    ["Puttalam", 1364],
    ["Batticaloa", 869],
    ["Ampara", 725],
    ["Trincomalee", 720],
    ["Polonnaruwa", 615],
    ["Ratnapura", 601],
    ["Moneragala", 604],
    ["Jaffna", 540],
    ["Kurunegala", 520],
    ["Kegalle", 424],
    ["Vavuniya", 77],
    ["Kilinochchi", 85],
    ["Mullaitivu", 58],
    ["Mannar", 26],
];

/* -------------------- Dashboard -------------------- */
const Dashboard = () => {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Charts Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Bar Chart</Typography>
                            <SimpleBarChart
                                data={barData}
                                xDataKey="name"
                                yDataKey="value"
                                xLabel="Categories"
                                yLabel="Values"
                                showGrid={true}
                                showLegend={false}
                            />

                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Multi Bar Chart</Typography>
                            <MultiBarChart data={multiBarData} xDataKey="name" xLabel="year" yLabel="value" barKeys={["apples", "bananas"]} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Pie Chart</Typography>
                            <SimplePieChart data={pieData} dataKey="value" nameKey="name" />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Line Chart</Typography>
                            <SimpleLineChart
                                data={lineData}
                                xDataKey="name"
                                lineKeys={["uv", "pv"]}
                                xLabel="Month"
                                yLabel="Count"
                                showLegend={true}
                            />
                        </CardContent>
                    </Card>
                </Grid>



                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Horizontal Bar Chart</Typography>
                            <HorizontalBarChart
                                data={horizontalData}
                                xDataKey="country"
                                yDataKey="value"
                                xLabel="Arrivals"
                                yLabel="Country"
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Multi Horizontal Bar Chart</Typography>
                            <MultiHorizontalBarChart
                                data={multiHorizontalData}
                                yDataKey="country"
                                xLabel="Value"
                                yLabel="Country"
                                barKeys={["apples", "bananas"]}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400, width: 500 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Bubble Chart</Typography>
                            <Box sx={{ height: "100%" }}>
                                <BubbleChart data={bubbleData} nameKey="name" valueKey="value" width={600} height={420} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ height: 400, width: 1000 }}>
                        <CardContent sx={{ height: "100%" }}>
                            <Typography variant="h6">Zoomable Circle Packing</Typography>
                            <Box sx={{ height: "100%" }}>
                                <CirclePackingChart data={circlePackingData} nameKey="name" valueKey="value" width={1000} height={300} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <DistrictMap
                    values={districtData}
                    title="Number of Rooms by District"
                    seriesName="Rooms"
                />

            </Grid>
        </Box>
    );
};

export default Dashboard;
