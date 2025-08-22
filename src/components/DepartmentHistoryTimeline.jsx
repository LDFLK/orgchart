import { useState, useEffect } from 'react';
import { Typography, Paper, Avatar, Box } from '@mui/material';
import { useSelector } from "react-redux";
import utils from '../utils/utils';
import api from '../services/services';
import { Timeline, TimelineItem, TimelineOppositeContent, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, } from '@mui/lab';
import { useThemeContext } from '../themeContext';
import { ClipLoader } from "react-spinners";

const DepartmentHistoryTimeline = ({ selectedDepartment }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    //const dictionary = useSelector((state) => state.allDepartmentData.departmentHistory);
    const {selectedPresident } = useSelector((state)=>state.presidency);
    const allMinistryData = useSelector((state) => state.allMinistryData.allMinistryData);
    const [enrichedMinistries, setEnrichedMinistries] = useState([]);
    const allPersonList = useSelector((state) => state.allPerson.allPerson);
    const [loading, setLoading] = useState(false);
    const { colors } = useThemeContext();

    const toggleSelect = (idx) => {
        setSelectedIndex(selectedIndex === idx ? null : idx);
    };

    // const formatDate = (dateString) => {
    //     const date = new Date(dateString);
    //     return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    // };

useEffect(() => {
    const enrichWithMinisters = async () => {
        setLoading(true);
        try {
            const relationsRes = await api.getMinistriesByDepartment(selectedDepartment?.id);
            const ministryRelations = await relationsRes.json();

            const enriched = await Promise.all(
                ministryRelations.map(async (relation) => {
                    const ministryId = relation.relatedEntityId;
                    const ministry = allMinistryData.find((m) => m.id === ministryId);

                    if (!ministry) {
                        return null; // or skip
                    }

                    try {
                        const allRelations = await api.fetchAllRelationsForMinistry(ministryId);
                        const appointedRelation = allRelations.find(
                            (r) => r.name === 'AS_APPOINTED'
                        );

                        const minister = appointedRelation
                            ? allPersonList.find((p) => p.id === appointedRelation.relatedEntityId)
                            : null;

                        return {
                            ...ministry,
                            minister: minister
                                ? utils.extractNameFromProtobuf(minister.name)
                                : null,
                            startTime: relation.startTime,
                            endTime: relation.endTime,
                        };
                    } catch (e) {
                        console.log("Minister fetch error:", e.message);
                        return { ...ministry, minister: null };
                    }
                })
            );

            setEnrichedMinistries(enriched.filter(Boolean)); // remove nulls
        } catch (err) {
            console.error("Error enriching ministries:", err.message);
        } finally {
            setLoading(false);
        }
    };

    if (selectedDepartment?.id) {
        enrichWithMinisters();
    }
}, [selectedDepartment]);


    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: colors.textPrimary, fontFamily: "poppins" }}>
                {utils.extractNameFromProtobuf(selectedDepartment.name)}
            </Typography>

            {!loading ? (<>{enrichedMinistries && enrichedMinistries.length > 0 ? (
                <Timeline position="alternate" sx={{ py: 0 }}>
                    {enrichedMinistries
                        .sort((b, a) => new Date(a.startTime) - new Date(b.startTime))
                        .map((entry, idx, arr) => (
                            <TimelineItem
                                key={idx}
                                sx={{
                                    '&:hover': { 
                                        // backgroundColor: colors.backgroundPrimary, 
                                        borderRadius: 2 },
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    py: 0.5,
                                }}
                            >
                                <TimelineOppositeContent
                                    sx={{
                                        m: 'auto 0',
                                        // color: colors.secondary,
                                        color: selectedPresident.themeColorLight,
                                        fontWeight: '600',
                                        fontSize: 12,
                                        minWidth: 70,
                                        pr: 1,
                                        fontFamily: "poppins"
                                    }}
                                    align="right"
                                    variant="body2"
                                >
                                    {entry.startTime
                                        ? `${new Date(entry.startTime).toISOString().slice(0, 10)} - ${entry.endTime
                                            ? new Date(entry.endTime).toISOString().slice(0, 10)
                                            : 'Present'}`
                                        : 'Unknown'}

                                    {/* {entry.startTime
                                        ? `${formatDate(entry.startTime)} - ${entry.endTime ? formatDate(entry.endTime) : 'Present'}`
                                        : 'Unknown'} */}

                                </TimelineOppositeContent>

                                <TimelineSeparator>
                                    <TimelineDot
                                        color="primary"
                                        sx={{
                                            width: 2,
                                            height: 2,
                                            // boxShadow: `0 0 6px rgba(25, 118, 210, 0.7)`,
                                            boxShadow: `0 0 6px ${selectedPresident.themeColorLight}`,
                                            animation: 'pulse 2.5s infinite',
                                            // backgroundColor: colors.backgroundSecondary,
                                            backgroundColor: selectedPresident.themeColorLight,
                                            // background: `linear-gradient(45deg,${colors.dotColorActive}, #21cbf3)`,
                                        }}
                                    />
                                    {idx < arr.length && (
                                        <TimelineConnector sx={{ 
                                            // bgcolor: colors.timelineLineActive, 
                                            bgcolor: selectedPresident.themeColorLight, 
                                            height: 2 }} />
                                    )}
                                </TimelineSeparator>

                                <TimelineContent sx={{ py: 0.5, px: 1 }}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            backgroundColor: selectedIndex === idx ? colors.backgroundTertiary : 'background.paper',
                                            boxShadow: selectedIndex === idx
                                                // ? '0 0 10px rgba(25, 118, 210, 0.4)'
                                                ? `0 0 10px ${selectedPresident.themeColorLight}`
                                                : '0 1px 5px rgba(0,0,0,0.1)',
                                            transform: selectedIndex === idx ? 'scale(1.02)' : 'scale(1)',
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                        onClick={() => toggleSelect(idx)}
                                    >

                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <Avatar sx={{ 
                                                // bgcolor: colors.backgroundSecondary, 
                                                bgcolor: selectedPresident.themeColorLight, 
                                                width: 30, height: 30, fontSize: 14 }}>
                                                {entry.minister ? entry.minister.charAt(0).toUpperCase() : '?'}
                                            </Avatar>
                                            <div style={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: '700', fontSize: 15, fontFamily: "poppins" }}>
                                                    {utils.extractNameFromProtobuf(entry.name).split(":")[0]}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color={colors.textMuted2}
                                                    sx={{ fontSize: 14, fontFamily: "poppins" }}

                                                >
                                                    {entry.minister}
                                                </Typography>
                                            </div>
                                        </div>
                                    </Paper>

                                </TimelineContent>
                            </TimelineItem>
                        ))}
                </Timeline>
            ) : (
                <Typography variant="body2" sx={{ mt: 2, fontFamily: "poppins", color: colors.textPrimary }}>
                    No timeline history available.
                </Typography>
            )}</>) : (<><Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "20vh",
                }}
            >
                <ClipLoader
                    // color={colors.timelineLineActive}
                    color={selectedPresident.themeColorLight}
                    loading={loading}
                    size={25}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </Box></>)}



            <style>
                {/* {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
            }
            70% {
              box-shadow: 0 0 0 8px rgba(33, 150, 243, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
            }
          }
        `} */}
            </style>
        </>
    );
};

export default DepartmentHistoryTimeline;
