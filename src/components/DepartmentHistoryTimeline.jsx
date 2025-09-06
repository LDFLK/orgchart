import { useState, useEffect } from 'react';
import { Typography, Paper, Avatar, Box } from '@mui/material';
import { useSelector } from "react-redux";
import utils from '../utils/utils';
import api from '../services/services';
import {
    Timeline,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
} from '@mui/lab';
import { useThemeContext } from '../themeContext';
import { ClipLoader } from "react-spinners";

const DepartmentHistoryTimeline = ({ selectedDepartment }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const { selectedPresident } = useSelector((state) => state.presidency);
    const allMinistryData = useSelector((state) => state.allMinistryData.allMinistryData);
    const [enrichedMinistries, setEnrichedMinistries] = useState([]);
    const allPersonDict = useSelector((state) => state.allPerson.allPerson);
    const [loading, setLoading] = useState(false);
    const { colors } = useThemeContext();

    useEffect(() => {
        const enrichWithMinisters = async () => {
            const startTime = new Date().getTime()
            setLoading(true);
            try {
                const departmentIds = new Set([selectedDepartment.id]);
                const queue = [selectedDepartment.id];

                while (queue.length > 0) {
                    const currentId = queue.shift();
                    const res = await api.getDepartmentRenamedInfo(currentId);
                    const info = await res.json();
                    if (info && Array.isArray(info)) {
                        info.forEach(r => {
                            if (r.relatedEntityId && !departmentIds.has(r.relatedEntityId)) {
                                departmentIds.add(r.relatedEntityId);
                                queue.push(r.relatedEntityId);
                            }
                        });
                    }
                }

                let allDepartmentRelations = [];
                for (const depId of departmentIds) {
                    const relationsRes = await api.getMinistriesByDepartment(depId);
                    const ministryRelations = await relationsRes.json();
                    allDepartmentRelations.push(...ministryRelations);
                }

                const enriched = [];

                for (const relation of allDepartmentRelations) {
                    const ministryId = relation.relatedEntityId;
                    const ministry = allMinistryData[ministryId];
                    if (!ministry) continue;

                    try {
                        const allRelations = await api.fetchAllRelationsForMinistry(ministryId);
                        const appointedRelations = allRelations.filter(r => r.name === 'AS_APPOINTED');

                        const relevantMinisters = appointedRelations
                            .map(r => {
                                const person = allPersonDict[r.relatedEntityId];
                                if (!person) return null;

                                const personMinRelationStart = new Date(r.startTime);
                                const personMinRelationEnd = r.endTime ? new Date(r.endTime) : null;
                                const minDepRelationStart = new Date(relation.startTime);
                                const minDepRelationEnd = relation.endTime ? new Date(relation.endTime) : null;

                                if (
                                    (personMinRelationEnd && personMinRelationEnd < minDepRelationStart) ||
                                    personMinRelationStart > (minDepRelationEnd || new Date())
                                ) return null;

                                const overlapStart = personMinRelationStart > minDepRelationStart ? personMinRelationStart : minDepRelationStart;
                                let overlapEnd = null;

                                if (personMinRelationEnd && minDepRelationEnd) {
                                    overlapEnd = personMinRelationEnd < minDepRelationEnd ? personMinRelationEnd : minDepRelationEnd;
                                } else if (personMinRelationEnd) {
                                    overlapEnd = personMinRelationEnd;
                                } else if (minDepRelationEnd) {
                                    overlapEnd = minDepRelationEnd;
                                }

                                return {
                                    ...ministry,
                                    minister: {
                                        id: person.id,
                                        fullName: utils.extractNameFromProtobuf(person.name),
                                        originalName: person.name,
                                    },
                                    startTime: overlapStart.toISOString(),
                                    endTime: overlapEnd ? overlapEnd.toISOString() : null,
                                };
                            })
                            .filter(Boolean);

                        relevantMinisters.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                        const ministryStart = new Date(relation.startTime);
                        const ministryEnd = relation.endTime ? new Date(relation.endTime) : null;
                        const enrichedForMinistry = [];

                        if (relevantMinisters.length > 0) {
                            const firstMinisterStart = new Date(relevantMinisters[0].startTime);
                            if (firstMinisterStart > ministryStart) {
                                enrichedForMinistry.push({
                                    ...ministry,
                                    minister: null,
                                    startTime: ministryStart.toISOString(),
                                    endTime: firstMinisterStart.toISOString(),
                                });
                            }
                        }

                        enrichedForMinistry.push(...relevantMinisters);

                        for (let i = 0; i < relevantMinisters.length - 1; i++) {
                            const currentEnd = new Date(relevantMinisters[i].endTime);
                            const nextStart = new Date(relevantMinisters[i + 1].startTime);
                            if (nextStart > currentEnd) {
                                enrichedForMinistry.push({
                                    ...ministry,
                                    minister: null,
                                    startTime: currentEnd.toISOString(),
                                    endTime: nextStart.toISOString(),
                                });
                            }
                        }

                        if (relevantMinisters.length === 0 || (ministryEnd && new Date(relevantMinisters[relevantMinisters.length - 1]?.endTime) < ministryEnd)) {
                            enrichedForMinistry.push({
                                ...ministry,
                                minister: null,
                                startTime: relevantMinisters.length > 0
                                    ? new Date(relevantMinisters[relevantMinisters.length - 1].endTime).toISOString()
                                    : ministryStart.toISOString(),
                                endTime: ministryEnd ? ministryEnd.toISOString() : null,
                            });
                        }

                        enriched.push(...enrichedForMinistry);

                    } catch (e) {
                        console.log("Minister fetch error:", e.message);
                        enriched.push({
                            ...ministry,
                            minister: null,
                            startTime: relation.startTime,
                            endTime: relation.endTime,
                        });
                    }
                }

                const collapsed = [];
                for (const entry of enriched.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))) {
                    const last = collapsed[collapsed.length - 1];
                    if (
                        last &&
                        last.minister?.id === entry.minister?.id &&
                        last.id === entry.id &&
                        (!last.endTime || !entry.startTime || new Date(last.endTime) >= new Date(entry.startTime))
                    ) {
                        last.endTime = entry.endTime && (!last.endTime || new Date(entry.endTime) > new Date(last.endTime))
                            ? entry.endTime
                            : last.endTime;
                    } else {
                        collapsed.push(entry);
                    }
                }

                setEnrichedMinistries(collapsed.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));

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
            {!loading ? (
                <>
                    {enrichedMinistries && enrichedMinistries.length > 0 ? (
                        <Timeline position="alternate" sx={{ py: 0 }}>
                            {enrichedMinistries
                                .sort((b, a) => new Date(a.startTime) - new Date(b.startTime))
                                .map((entry, idx, arr) => (
                                    <TimelineItem key={idx} sx={{ cursor: 'pointer', py: 0.5 }}>
                                        <TimelineOppositeContent
                                            sx={{ m: 'auto 0', color: selectedPresident.themeColorLight, fontWeight: '600', fontSize: 12, minWidth: 70, pr: 1, fontFamily: "poppins" }}
                                            align="right"
                                            variant="body2"
                                        >
                                            {entry.startTime
                                                ? `${new Date(entry.startTime).toISOString().slice(0, 10)} - ${entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 10) : 'Present'}`
                                                : 'Unknown'}
                                        </TimelineOppositeContent>

                                        <TimelineSeparator>
                                            <TimelineDot
                                                color="primary"
                                                sx={{
                                                    width: 2,
                                                    height: 2,
                                                    boxShadow: `0 0 6px ${selectedPresident.themeColorLight}`,
                                                    animation: 'pulse 2.5s infinite',
                                                    backgroundColor: selectedPresident.themeColorLight,
                                                }}
                                            />
                                            {idx < arr.length && (
                                                <TimelineConnector sx={{ bgcolor: selectedPresident.themeColorLight, height: 2 }} />
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
                                                        ? `0 0 10px ${selectedPresident.themeColorLight}`
                                                        : '0 1px 5px rgba(0,0,0,0.1)',
                                                    transform: selectedIndex === idx ? 'scale(1.02)' : 'scale(1)',
                                                    transition: 'all 0.2s ease-in-out',
                                                }}
                                                onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ bgcolor: selectedPresident.themeColorLight, width: 30, height: 30, fontSize: 14 }}>
                                                        {entry.minister?.fullName.charAt(0).toUpperCase() || '?'}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: '700', fontSize: 15, fontFamily: "poppins" }}>
                                                            {utils.extractNameFromProtobuf(entry.name).split(":")[0]}
                                                        </Typography>
                                                        <Typography variant="caption" color={colors.textMuted2} sx={{ fontSize: 14, fontFamily: "poppins" }}>
                                                            {entry.minister?.fullName || 'No Minister Assigned'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                        </Timeline>
                    ) : (
                        <Typography variant="body2" sx={{ mt: 2, fontFamily: "poppins", color: colors.textPrimary }}>
                            No timeline history available.
                        </Typography>
                    )}
                </>
            ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "20vh" }}>
                    <ClipLoader color={selectedPresident.themeColorLight} loading={loading} size={25} />
                </Box>
            )}
        </>
    );
};

export default DepartmentHistoryTimeline;
