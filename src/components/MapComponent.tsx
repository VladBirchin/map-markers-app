// src/components/MapComponent.tsx
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Ваш файл конфігурації Firebase
import { MarkerClusterer } from "@react-google-maps/api";

const containerStyle = {
    width: '100%',
    height: '400px'
};

const center = {
    lat: 50.4501, // Київ
    lng: 30.5234
};

const MapComponent: React.FC = () => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyC9XSnTaUMXhL7BuEgyTrPQskLE2XNjBeM" // Ваш API ключ тут
    });

    const [markers, setMarkers] = useState<any[]>([]);
    const [markerCount, setMarkerCount] = useState(0); // Лічильник маркерів

    const fetchMarkers = async () => {
        const querySnapshot = await getDocs(collection(db, "markers"));
        const markersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMarkers(markersData);
        setMarkerCount(markersData.length); // Встановлюємо кількість маркерів
    };

    const addMarker = async (event: google.maps.MapMouseEvent) => {
        const newMarker = {
            lat: event.latLng?.lat(),
            lng: event.latLng?.lng(),
            timestamp: new Date(),
            number: markerCount + 1 // Номер маркера
        };

        const docRef = await addDoc(collection(db, "markers"), newMarker);
        setMarkers([...markers, { id: docRef.id, ...newMarker }]);
        setMarkerCount(markerCount + 1); // Збільшуємо лічильник маркерів
    };

    const deleteMarker = async (id: string) => {
        await deleteDoc(doc(db, "markers", id));
        setMarkers(markers.filter(marker => marker.id !== id));
        setMarkerCount(markerCount - 1); // Зменшуємо лічильник маркерів
    };

    const deleteAllMarkers = async () => {
        for (const marker of markers) {
            await deleteDoc(doc(db, "markers", marker.id));
        }
        setMarkers([]);
        setMarkerCount(0); // Скидаємо лічильник маркерів
    };

    const handleMarkerDragEnd = async (id: string, event: google.maps.MapMouseEvent) => {
        const updatedPosition = {
            lat: event.latLng?.lat(),
            lng: event.latLng?.lng(),
        };

        await updateDoc(doc(db, "markers", id), updatedPosition);
        setMarkers(markers.map(marker =>
            marker.id === id ? { ...marker, ...updatedPosition } : marker
        ));
    };

    useEffect(() => {
        fetchMarkers();
    }, []);

    return (
        <>
            {isLoaded && (
                <>
                    <button onClick={deleteAllMarkers}>Видалити всі маркери</button>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        onClick={addMarker}
                    >
                        <MarkerClusterer>
                            {(clusterer) => (
                                <>
                                    {markers.map(marker => (
                                        <Marker
                                            key={marker.id}
                                            position={{ lat: marker.lat, lng: marker.lng }}
                                            label={String(marker.number)} // Відображаємо номер маркера
                                            onClick={() => deleteMarker(marker.id)} // Видалення маркера при кліку
                                            draggable // Додаємо можливість перетягування
                                            onDragEnd={(event) => handleMarkerDragEnd(marker.id, event)} // Оновлюємо позицію маркера
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






