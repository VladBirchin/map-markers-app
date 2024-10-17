// src/components/MapComponent.tsx
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Ваш файл конфігурації Firebase
import { MarkerClusterer } from "@react-google-maps/api";
import './style.css'; // Імпортуємо стилі

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

    const [markers, setMarkers] = useState<any[]>(() => {
        const storedMarkers = localStorage.getItem('markers');
        return storedMarkers ? JSON.parse(storedMarkers) : [];
    });
    const [markerCount, setMarkerCount] = useState(markers.length); // Лічильник маркерів
    const [currentMarkerIndex, setCurrentMarkerIndex] = useState<number>(0); // Індекс поточного маркера

    const fetchMarkers = async () => {
        const querySnapshot = await getDocs(collection(db, "markers"));
        const markersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMarkers(markersData);
        setMarkerCount(markersData.length); // Встановлюємо кількість маркерів
        localStorage.setItem('markers', JSON.stringify(markersData)); // Кешування маркерів
    };

    const addMarker = async (event: google.maps.MapMouseEvent) => {
        const newMarker = {
            lat: event.latLng?.lat(),
            lng: event.latLng?.lng(),
            timestamp: new Date(),
            number: markerCount + 1 // Номер маркера
        };

        const docRef = await addDoc(collection(db, "markers"), newMarker);
        const updatedMarkers = [...markers, { id: docRef.id, ...newMarker }];
        setMarkers(updatedMarkers);
        setMarkerCount(markerCount + 1); // Збільшуємо лічильник маркерів
        localStorage.setItem('markers', JSON.stringify(updatedMarkers)); // Оновлюємо кеш

        // Додавання аналітики
        await logAnalytics('add', newMarker);
    };

    const deleteMarker = async (id: string) => {
        const markerToDelete = markers.find(marker => marker.id === id);
        await deleteDoc(doc(db, "markers", id));
        const updatedMarkers = markers.filter(marker => marker.id !== id);
        setMarkers(updatedMarkers);
        setMarkerCount(markerCount - 1); // Зменшуємо лічильник маркерів
        localStorage.setItem('markers', JSON.stringify(updatedMarkers)); // Оновлюємо кеш

        // Додавання аналітики
        await logAnalytics('delete', markerToDelete);
    };

    const deleteAllMarkers = async () => {
        for (const marker of markers) {
            await deleteDoc(doc(db, "markers", marker.id));
        }
        setMarkers([]);
        setMarkerCount(0); // Скидаємо лічильник маркерів
        setCurrentMarkerIndex(0); // Скидаємо індекс поточного маркера
        localStorage.removeItem('markers'); // Очищуємо кеш
    };

    const handleMarkerDragEnd = async (id: string, event: google.maps.MapMouseEvent) => {
        const updatedPosition = {
            lat: event.latLng?.lat(),
            lng: event.latLng?.lng(),
        };

        await updateDoc(doc(db, "markers", id), updatedPosition);
        const updatedMarkers = markers.map(marker =>
            marker.id === id ? { ...marker, ...updatedPosition } : marker
        );
        setMarkers(updatedMarkers);
        localStorage.setItem('markers', JSON.stringify(updatedMarkers)); // Оновлюємо кеш

        // Додавання аналітики
        await logAnalytics('move', { id, ...updatedPosition });
    };

    // Функція для логування аналітики
    const logAnalytics = async (action: string, data: any) => {
        await addDoc(collection(db, "analytics"), {
            action,
            data,
            timestamp: new Date(),
        });
    };

    // Функції для навігації між маркерами
    const goToPreviousMarker = () => {
        if (currentMarkerIndex > 0) {
            setCurrentMarkerIndex(currentMarkerIndex - 1);
        }
    };

    const goToNextMarker = () => {
        if (currentMarkerIndex < markers.length - 1) {
            setCurrentMarkerIndex(currentMarkerIndex + 1);
        }
    };

    useEffect(() => {
        fetchMarkers();
    }, []);

    return (
        <>
            {isLoaded && (
                <>
                    <button className="styled-button" onClick={deleteAllMarkers}>Видалити всі маркери</button>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        onClick={addMarker}
                        options={{
                            scrollwheel: true, // Дозволити масштабування колесом миші
                        }}
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
                                                color: currentMarkerIndex === index ? '#fff' : '#000',
                                                fontSize: '14px',
                                            }} // Відображаємо номер маркера
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                fillColor: currentMarkerIndex === index ? '#4CAF50' : '#FF0000', // Зелений при виборі, червоний інакше
                                                fillOpacity: 1,
                                                strokeWeight: 1,
                                                scale: currentMarkerIndex === index ? 10 : 7, // Розмір маркера
                                            }}
                                            onClick={() => {
                                                deleteMarker(marker.id); // Видалення маркера при кліку
                                            }}
                                            draggable // Додаємо можливість перетягування
                                            onDragEnd={(event) => handleMarkerDragEnd(marker.id, event)} // Оновлюємо позицію маркера
                                            clusterer={clusterer}
                                        />
                                    ))}
                                </>
                            )}
                        </MarkerClusterer>
                    </GoogleMap>

                    {/* Інформаційна панель для маркерів */}
                    {markers.length > 0 && (
                        <div className="marker-info-panel">
                            <h3>Поточний маркер:</h3>
                            <p>ID: {markers[currentMarkerIndex].id}</p>
                            <p>Локація: ({markers[currentMarkerIndex].lat}, {markers[currentMarkerIndex].lng})</p>
                            <button className="styled-button" onClick={goToPreviousMarker} disabled={currentMarkerIndex === 0}>
                                Попередній
                            </button>
                            <button className="styled-button" onClick={goToNextMarker} disabled={currentMarkerIndex === markers.length - 1}>
                                Наступний
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default MapComponent;
