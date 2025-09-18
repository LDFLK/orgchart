import React from "react";
import utils from "../../utils/utils";
import { useNavigate } from "react-router-dom";

export default function AlertToOrgchart({ selectedPresident }) {
  const navigate = useNavigate();

  const handleClick = () => {
    try {
      navigate("/orgchart");
    } catch (e) {
      console.log(e);
    }
  };

 function PresidentLink({ president }) {
    const navigate = useNavigate();

    const handleClick = (e) => {
      e.preventDefault();
      navigate("/orgchart", { state: { president, openProfile: true } });
    };

    return (
      <a href="#" onClick={handleClick} className="text-blue-500 underline">
        {utils.extractNameFromProtobuf(president.name)}
      </a>
    );
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-100">
      <div
        id="alert-additional-content-5"
        className="p-4  border border-gray-300 rounded-lg bg-white"
        role="alert"
      >
        <div className="flex">
          <div className="mt-2 mb-4 text-sm text-gray-800 mr-4">
            The final government structure for{" "}
            {/* <a href="" className="text-blue-500 underline">
              {utils.extractNameFromProtobuf(selectedPresident.name)}.
            </a> */}
            <PresidentLink president={selectedPresident} />.
          </div>
          <button
            type="button"
            className="text-white cursor-pointer bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
            onClick={handleClick}
          >
            <svg
              className="me-2 h-3 w-3 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 14"
            >
              <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
            </svg>
            See how it changes
          </button>
        </div>
      </div>
    </div>
  );
}
