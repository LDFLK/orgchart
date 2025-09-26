import { useState, useEffect } from "react";

export default function urlParamState(key, defaultValue = '') {
  const [value, setValue] = useState(() => {
    const param = new URLSearchParams(window.location.search).get(key);
    return param || defaultValue;
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (value != null || value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url.toString());
  }, [key, value]);

  // Sync state when user navigates with back/forward
  useEffect(() => {
    const handler = () => {
      const param = new URLSearchParams(window.location.search).get(key);
      setValue(param || defaultValue);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [key, defaultValue]);

  return [value, setValue];
}
