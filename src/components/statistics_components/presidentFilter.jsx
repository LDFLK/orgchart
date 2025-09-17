import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import "../../assets/presidentdata";
import { useSelector } from "react-redux";
import utils from "../../utils/utils";

export default function PresidentFilter({
  selectedPresidents = [],
  onSelectPresident = () => { },
}) {
  const [searchTerm, setSearchTerm] = useState("");
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
      const endYear = rel?.endTime
        ? new Date(rel.endTime).getFullYear()
        : "Present";
      const termText = startYear ? `${startYear} - ${endYear}` : "";

      return {
        id: p.id,
        name: nameText,
        term: termText,
        image: p.imageUrl || p.image || "",

        // random dummy data
        cabinetSize: Math.floor(Math.random() * 30) + 20, 
        departments: Math.floor(Math.random() * 10) + 10,
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
    const isSelected = selectedPresidents.some((p) => p.id === president.id);
    let updated;

    if (isSelected) {
      updated = selectedPresidents.filter((p) => p.id !== president.id);
    } else {
      updated =
        selectedPresidents.length < 3
          ? [...selectedPresidents, president]
          : selectedPresidents;
    }

    onSelectPresident(updated);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Select Presidents to Compare
      </h2>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Search presidents by name or term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {filteredPresidents.map((president) => {
          const isSelected = selectedPresidents.some((p) => p.id === president.id);
          return (
            <button
              key={president.id}
              onClick={() => handleSelect(president)}
              className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${isSelected
                ? "bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                }`}
              disabled={selectedPresidents.length >= 3 && !isSelected}
            >
              <img
                src={president.image}
                alt={president.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="text-left">
                <p
                  className={`text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"
                    }`}
                >
                  {president.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {president.term}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {selectedPresidents.length >= 3 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
          You can compare up to 3 presidents at a time. Remove one to add another.
        </p>
      )}
    </div>
  );
}
