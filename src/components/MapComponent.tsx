import React, { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MarkerClusterer } from "@react-google-maps/api";
import { useMarkers } from "../hooks/useMarkers";
import { useMarkerSelection } from "../hooks/useMarkerSelection";
import './style.css';

const containerStyle = {
    width: '100%',
    height: '400px',
};

const center = {
    lat: 50.4501,
    lng: 30.5234,
};

const MapComponent: React.FC = () => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyC9XSnTaUMXhL7BuEgyTrPQskLE2XNjBeM",
    });

    const {
        markers,
        addMarker,
        deleteMarker,
        deleteAllMarkers,
        updateMarkerPosition,
    } = useMarkers();

    const {
        selectedMarker,
        currentMarkerIndex,
        selectMarker,
        clearSelection,
        goToPreviousMarker,
        goToNextMarker,
    } = useMarkerSelection();

    const [mode, setMode] = useState<'select' | 'delete'>('select');

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();

        if (lat !== undefined && lng !== undefined) {
            addMarker(lat, lng);
        }
    };

    const handleMarkerClick = (marker: any, index: number) => {
        if (mode === 'delete') {
            deleteMarker(marker.id);
            if (selectedMarker?.id === marker.id) clearSelection();
        } else {
            selectMarker(marker, index);
        }
    };

    const handleMarkerDragEnd = async (id: string, event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();

        if (lat !== undefined && lng !== undefined) {
            await updateMarkerPosition(id, lat, lng);
            if (selectedMarker?.id === id) {
                selectMarker({ ...selectedMarker, lat, lng }, currentMarkerIndex!);
            }
        }
    };

    const handleDeleteAllMarkers = async () => {
        await deleteAllMarkers();
        clearSelection();
    };

    return (
        <>
            {isLoaded && (
                <>

                    {selectedMarker && (
                        <div className="marker-info">
                            <h3>Вибраний маркер:</h3>
                            <p>ID: {selectedMarker.id}</p>
                            <p>Локація: ({selectedMarker.lat}, {selectedMarker.lng})</p>
                        </div>
                    )}
                    <div className="controls">
                        <button onClick={() => setMode('select')} className={mode === 'select' ? 'active' : ''}>
                            Вибрати
                        </button>
                        <button onClick={() => setMode('delete')} className={mode === 'delete' ? 'active' : ''}>
                            Видалити
                        </button>
                        <button onClick={handleDeleteAllMarkers} className="delete-all">
                            Видалити всі маркери
                        </button>
                        <button onClick={() => goToPreviousMarker(markers)} disabled={currentMarkerIndex === null || currentMarkerIndex === 0}>
                            Попередній
                        </button>
                        <button onClick={() => goToNextMarker(markers)} disabled={currentMarkerIndex === null || currentMarkerIndex === markers.length - 1}>
                            Наступний
                        </button>
                    </div>



                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        onClick={handleMapClick}
                    >
                        <MarkerClusterer>
                            {(clusterer) => (
                                <>
                                    {markers.map((marker, index) => (
                                        <Marker
                                            key={marker.id}
                                            position={{ lat: marker.lat, lng: marker.lng }}
                                            label={{
                                                text: String(marker.number),
                                                color: selectedMarker?.id === marker.id ? '#fff' : '#000',
                                            }}
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                fillColor: selectedMarker?.id === marker.id ? '#4CAF50' : '#FF0000',
                                                fillOpacity: 1,
                                                strokeWeight: 1,
                                                scale: selectedMarker?.id === marker.id ? 17 : 15,
                                            }}
                                            onClick={() => handleMarkerClick(marker, index)}
                                            draggable
                                            onDragEnd={(event) => handleMarkerDragEnd(marker.id, event)}
                                            clusterer={clusterer}
                                        />
                                    ))}
                                </>
                            )}
                        </MarkerClusterer>
                    </GoogleMap>
                </>
            )}
        </>
    );
};

export default MapComponent;
