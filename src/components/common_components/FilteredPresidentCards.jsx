import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import utils from "../../utils/utils";
import { setSelectedPresident } from "../../store/presidencySlice";
import { setGazetteData } from "../../store/gazetteDate";

export default function FilteredPresidentCards({
  dateRange = [null, null],
  selectedPresident = null,
  onSelectPresident = () => {},
}) {
  const dispatch = useDispatch();
  const presidents = useSelector((s) => s.presidency.presidentDict);
  const presidentRelationDict = useSelector((s) => s.presidency.presidentRelationDict);
  const gazetteDateClassic = useSelector((s) => s.gazettes.gazetteDataClassic);

  const [searchTerm, setSearchTerm] = useState("");

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
      .map((p) => {
        const nameText = utils.extractNameFromProtobuf(p.name);
        const rel = presidentRelationDict[p.id];
        const startYear = p?.created ? p.created.split("-")[0] : "";
        const endYear = rel?.endTime ? new Date(rel.endTime).getFullYear() : "Present";
        return {
          id: p.id,
          name: nameText,
          term: startYear ? `${startYear} - ${endYear}` : "",
          image: p.imageUrl || p.image || "",
        };
      })
      .filter((p) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.term.toLowerCase().includes(q);
      });
  }, [presidents, presidentRelationDict, dateRange, searchTerm]);

  const handleSelect = (president) => {
    if (selectedPresident?.id === president.id) {
      onSelectPresident(null);
      dispatch(setSelectedPresident(null));
      dispatch(setGazetteData([]));
      return;
    }

    onSelectPresident(president);
    dispatch(setSelectedPresident(president));

    const rel = presidentRelationDict[president.id];
    const presStart = new Date(rel.startTime.split("T")[0]);
    const presEnd = rel.endTime ? new Date(rel.endTime.split("T")[0]) : new Date();
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
  };

  return (
    <div className="rounded-lg w-full">
      <input
        type="text"
        className="border p-2 mb-3 w-full rounded"
        placeholder="Search presidents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredPresidents.map((president) => {
          const isSelected = selectedPresident?.id === president.id;
          return (
            <button
              key={president.id}
              onClick={() => handleSelect(president)}
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <img
                src={president.image}
                alt={president.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className={isSelected ? "text-blue-700 font-medium" : "text-gray-700 font-medium"}>
                  {president.name}
                </p>
                <p className="text-xs text-gray-500">{president.term}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
