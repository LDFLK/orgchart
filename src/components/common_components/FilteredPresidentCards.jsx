import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo, useEffect, useRef } from "react";
import utils from "../../utils/utils";
import { setSelectedPresident , setSelectedDate} from "../../store/presidencySlice";
import { setGazetteData } from "../../store/gazetteDate";

export default function FilteredPresidentCards({ dateRange = [null, null] }) {
  const dispatch = useDispatch();
  const presidents = useSelector((s) => s.presidency.presidentDict);
  const presidentRelationDict = useSelector((s) => s.presidency.presidentRelationDict);
  const gazetteDateClassic = useSelector((s) => s.gazettes.gazetteDataClassic);
  const selectedPresident = useSelector((s) => s.presidency.selectedPresident);

  const [searchTerm, setSearchTerm] = useState("");
  const prevDateRangeRef = useRef([null, null]);

  const filteredPresidents = useMemo(() => {
    if (!presidents) return [];
    const arr = Array.isArray(presidents) ? presidents : Object.values(presidents);
    const [rangeStart, rangeEnd] = dateRange;

    return arr
      .filter((p) => {
        const rel = presidentRelationDict[p.id];
        if (!rel) return false;
        if (!rangeStart || !rangeEnd) return true;
        const presStart = new Date(rel.startTime.split("T")[0]);
        const presEnd = rel.endTime ? new Date(rel.endTime.split("T")[0]) : new Date();
        return presStart < rangeEnd && presEnd > rangeStart;
      })
      .filter((p) => {
        if (!searchTerm) return true;
        const nameText = utils.extractNameFromProtobuf(p.name);
        const q = searchTerm.toLowerCase();
        const rel = presidentRelationDict[p.id];
        const startYear = p?.created ? p.created.split("-")[0] : "";
        const endYear = rel?.endTime ? new Date(rel.endTime).getFullYear() : "Present";
        const term = startYear ? `${startYear} - ${endYear}` : "";
        return nameText.toLowerCase().includes(q) || term.toLowerCase().includes(q);
      });
  }, [presidents, presidentRelationDict, dateRange, searchTerm]);

  const selectPresidentAndDates = (president) => {
    if (!president) {
      dispatch(setSelectedPresident(null));
      dispatch(setGazetteData([]));
      return;
    }

    dispatch(setSelectedPresident(president));

    const rel = presidentRelationDict[president.id];
    const presStart = new Date(rel.startTime.split("T")[0]);
    const presEnd = rel?.endTime ? new Date(rel.endTime.split("T")[0]) : new Date();
    const [rangeStart, rangeEnd] = dateRange;
    const finalStart = rangeStart ? new Date(Math.max(presStart, rangeStart)) : presStart;
    const finalEnd = rangeEnd ? new Date(Math.min(presEnd, rangeEnd)) : presEnd;

    const filteredDates = gazetteDateClassic
      .filter((d) => {
        const dd = new Date(d);
        return dd >= finalStart && dd <= finalEnd;
      })
      .map((date) => ({ date }));

    dispatch(setGazetteData(filteredDates));
    dispatch(setSelectedDate(filteredDates.length > 0 ? filteredDates[filteredDates.length - 1] : null));
  };

  // Auto-select last president only when dateRange changes
  useEffect(() => {
    const [prevStart, prevEnd] = prevDateRangeRef.current;
    if (prevStart !== dateRange[0] || prevEnd !== dateRange[1]) {
      if (filteredPresidents.length > 0) {
        const lastPresident = filteredPresidents[filteredPresidents.length - 1];
        selectPresidentAndDates(lastPresident);
        
      } else {
        selectPresidentAndDates(null);
      }
      prevDateRangeRef.current = dateRange;
    }
  }, [dateRange, filteredPresidents]);

  return (
    <div className="rounded-lg w-full">
      <input
        type="text"
        className="border p-2 mb-3 w-full rounded"
        placeholder="Search presidents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {filteredPresidents.map((president) => {
          const isSelected = selectedPresident?.id === president.id;
          const nameText = utils.extractNameFromProtobuf(president.name);
          const rel = presidentRelationDict[president.id];
          const startYear = president?.created ? president.created.split("-")[0] : "";
          const endYear = rel?.endTime ? new Date(rel.endTime).getFullYear() : "Present";
          const term = startYear ? `${startYear} - ${endYear}` : "";

          return (
            <button
              key={president.id}
              onClick={() => selectPresidentAndDates(president)}
              className={`flex items-center p-3 rounded-lg border transition-colors hover:cursor-pointer ${
                isSelected
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <img
                src={president.imageUrl || president.image || ""}
                alt={nameText}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className={isSelected ? "text-blue-700 font-medium" : "text-gray-700 font-medium"}>
                  {nameText}
                </p>
                <p className="text-xs text-gray-500">{term}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
