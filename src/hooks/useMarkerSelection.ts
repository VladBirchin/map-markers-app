import { useState } from "react";

export const useMarkerSelection = () => {
    const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
    const [currentMarkerIndex, setCurrentMarkerIndex] = useState<number | null>(null);

    const selectMarker = (marker: any, index: number) => {
        setSelectedMarker(marker);
        setCurrentMarkerIndex(index);
    };

    const clearSelection = () => {
        setSelectedMarker(null);
        setCurrentMarkerIndex(null);
    };

    const goToPreviousMarker = (markers: any[]) => {
        if (currentMarkerIndex !== null && currentMarkerIndex > 0) {
            const previousIndex = currentMarkerIndex - 1;
            setSelectedMarker(markers[previousIndex]);
            setCurrentMarkerIndex(previousIndex);
        }
    };

    const goToNextMarker = (markers: any[]) => {
        if (currentMarkerIndex !== null && currentMarkerIndex < markers.length - 1) {
            const nextIndex = currentMarkerIndex + 1;
            setSelectedMarker(markers[nextIndex]);
            setCurrentMarkerIndex(nextIndex);
        }
    };

    return {
        selectedMarker,
        currentMarkerIndex,
        selectMarker,
        clearSelection,
        goToPreviousMarker,
        goToNextMarker,
    };
};
