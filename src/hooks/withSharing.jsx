// hoc/withSharing.js
import React, { useEffect, useCallback, useMemo } from 'react';
import { useUniversalSharing } from '../hooks/useUniversalSharing';

export const withSharing = (WrappedComponent, config) => {
  const WithSharingComponent = (props) => {
    const sharing = useUniversalSharing(config);

    // Memoize functions to prevent infinite re-renders
    const stableFunctions = useMemo(() => ({
      generateShareableUrl: sharing.generateShareableUrl,
      updateUrl: sharing.updateUrl,
      loadFromUrl: sharing.loadFromUrl,
      applyUrlState: sharing.applyUrlState,
    }), [sharing.generateShareableUrl, sharing.updateUrl, sharing.loadFromUrl, sharing.applyUrlState]);

    // Auto-load state from URL on mount only
    useEffect(() => {
      if (stableFunctions.loadFromUrl) {
        const urlState = stableFunctions.loadFromUrl();
        if (Object.keys(urlState).length > 0) {
          console.log('Loading state from URL:', urlState);
          stableFunctions.applyUrlState(urlState);
        }
      }
    }, []); // Empty dependency array - run only on mount

    return (
      <WrappedComponent
        {...props}
        sharing={sharing}
        {...stableFunctions}
      />
    );
  };

  WithSharingComponent.displayName = `withSharing(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithSharingComponent;
};