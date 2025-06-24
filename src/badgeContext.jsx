import { createContext, useContext, useState } from "react";

const BadgeContext = createContext();

export const BadgeProvider = ({ children }) => {
  const [showNewBadge, setShowNewBadge] = useState(true);

  return (
    <BadgeContext.Provider value={{ showNewBadge, setShowNewBadge }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => useContext(BadgeContext);
