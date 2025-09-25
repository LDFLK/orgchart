import { useState, useEffect } from "react";

export default function urlParamState(key, defaultValue = '') {
  const [value, setValue] = useState(() => {
    const param = new URLSearchParams(window.location.search).get(key);
    return param || defaultValue;
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url.toString());
  }, [key, value]);

  return [value, setValue];
}
