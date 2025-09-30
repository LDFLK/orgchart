import React from "react";
import InfoTab from "./InfoTab";

export default function InfoTabDialog({ open, onClose, node, selectedDate, selectedPresident, selectedDepartment }) {
  // node: the selected node (minister or department)
  // selectedDate, selectedPresident: from redux or parent
  if (!open || !node) return null;

  return (
    <InfoTab
      drawerOpen={open}
      selectedCard={node}
      selectedDate={selectedDate}
      selectedDepartment={selectedDepartment}
      onClose={onClose}
      selectedPresident={selectedPresident}
    />
  );
}
