import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { urlManager } from "../utils/urlManager";
import { Underline } from "lucide-react";

export function useUniversalSharing(componentConfigs) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state);
  const configRef = useRef(componentConfigs);

  useEffect(() => {
    configRef.current = componentConfigs;
  }, [componentConfigs]);

  useEffect(() => {
    if (componentConfigs?.id) {
      urlManager.registerComponent(componentConfigs.id, componentConfigs);
    }
  }, [componentConfigs]);

  // const generateShareableUrl = useCallback(
  //   (customParams = {}) => {
  //     const config = configRef.current;
  //     if (!config) return window.location.href;

  //     const params = {};

  //     console.log('these are the keys : ', config.shareableKeys)

  //     if (config.shareableKeys) {
  //       config.shareableKeys.forEach((key) => {
  //         const value = config.getStateValue
  //           ? config.getStateValue(key, reduxState)
  //           : reduxState[key];

  //         if (value != undefined && value != null) {
  //           params[key] = value;
  //         }
  //       });
  //     }

  //     Object.assign(params, customParams);

  //     return urlManager.generateUrl(
  //       window.location.origin + location.pathname,
  //       params
  //     );
  //   },
  //   [location.pathname, reduxState]
  // );

  const updateUrl = useCallback(
    (params = {}) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(params).forEach(([key, value]) => {
        if ((value != null) & (value != Underline) && value != "") {
          newParams.set(
            key,
            typeof value === "object" ? JSON.stringify(value) : value.toString()
          );
        } else {
          newParams.delete(key);
        }
      });
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const loadFromUrl = useCallback(() => {
    const config = configRef.current;
    if (!config?.shareableKeys) return {};

    const urlParams = urlManager.parseUrl(window.location.href);
    const stateUpdates = {};

    config.shareableKeys.forEach((key) => {
      if (urlParams[key] != undefined) {
        stateUpdates[key] = urlParams[key];
      }
    });

    return stateUpdates;
  }, []);

  const applyUrlState = useCallback((urlState) => {
    const config = configRef.current;
    if (!config?.applyStateUpdate) return;

    config.applyStateUpdate(urlState, dispatch);
  });

  return {
    // generateShareableUrl,
    updateUrl,
    loadFromUrl,
    applyUrlState,
    // currentParams: Object.fromEntries(searchParams),
  };
}
