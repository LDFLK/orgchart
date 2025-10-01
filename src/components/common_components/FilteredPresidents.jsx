import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import "../../assets/presidentdata";
import { useSelector } from "react-redux";
import utils from "../../utils/utils";
import { useThemeContext } from "../../themeContext";

export default function PresidentFilter({
  selectedPresident = null,
  onSelectPresident = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { colors } = useThemeContext();

  const presidents = useSelector((state) => state.presidency.presidentDict);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );

  const filteredPresidents = useMemo(() => {
    if (!presidents) return [];
    const presidentArray = Array.isArray(presidents)
      ? presidents
      : Object.values(presidents);
    if (presidentArray.length === 0) return [];

    const normalized = presidentArray.map((p) => {
      const nameText = utils.extractNameFromProtobuf(p.name);
      const rel = presidentRelationDict ? presidentRelationDict[p.id] : null;
      const startYear = p?.created ? p.created.split("-")[0] : "";
      const endYear = rel?.endTime ? new Date(rel.endTime).getFullYear() : "Present";
      const termText = startYear ? `${startYear} - ${endYear}` : "";

      return {
        id: p.id,
        name: nameText,
        term: termText,
        image: p.imageUrl || p.image || "",
      };
    });

    if (!searchTerm) return normalized;

    const q = searchTerm.toLowerCase();
    return normalized.filter(
      (president) =>
        president.name.toLowerCase().includes(q) ||
        (president.term && president.term.toLowerCase().includes(q))
    );
  }, [presidents, presidentRelationDict, searchTerm]);

  const handleSelect = (president) => {
    if (selectedPresident?.id === president.id) {
      // deselect if same one clicked
      onSelectPresident(null);
    } else {
      // replace with new one
      onSelectPresident(president);
    }
  };

  return (
    <div
      className="rounded-lg w-full"
      style={{ backgroundColor: colors.backgroundWhite }}
    >
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
          style={{
            backgroundColor: colors.backgroundWhite,
            color: colors.textMuted,
          }}
          placeholder="Search presidents by name or term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {filteredPresidents.map((president) => {
          const isSelected = selectedPresident?.id === president.id;
          return (
            <button
              key={president.id}
              onClick={() => handleSelect(president)}
              className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                isSelected
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <img
                src={president.image}
                alt={president.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="text-left">
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {president.name}
                </p>
                <p className="text-xs text-gray-500">{president.term}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPresident && (
        <p className="text-sm text-amber-600 mt-2">
          Currently selected: {selectedPresident.name}
        </p>
      )}
    </div>
  );
}
