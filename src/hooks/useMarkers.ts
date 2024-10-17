import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const useMarkers = () => {
    const [markers, setMarkers] = useState<any[]>([]);
    const [markerCount, setMarkerCount] = useState(0);

    const fetchMarkers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "markers"));
            const markersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMarkers(markersData);
            setMarkerCount(markersData.length);
            localStorage.setItem('markers', JSON.stringify(markersData));
        } catch (error) {
            console.error("Error fetching markers: ", error);
        }
    };


    const loadMarkersFromCache = () => {
        const cachedMarkers = localStorage.getItem('markers');
        if (cachedMarkers) {
            const markersData = JSON.parse(cachedMarkers);
            setMarkers(markersData);
            setMarkerCount(markersData.length);
        }
    };


    const logUserAction = async (action: string, markerId?: string) => {
        try {
            const logEntry = {
                action,
                markerId,
                timestamp: new Date(),
            };
            await addDoc(collection(db, "userActions"), logEntry);
        } catch (error) {
            console.error("Error logging user action: ", error);
        }
    };


    const addMarker = async (lat: number, lng: number) => {
        try {
            const newMarker = {
                lat,
                lng,
                timestamp: new Date(),
                number: markerCount + 1,
            };

            const docRef = await addDoc(collection(db, "markers"), newMarker);
            const updatedMarkers = [...markers, { id: docRef.id, ...newMarker }];
            setMarkers(updatedMarkers);
            setMarkerCount(updatedMarkers.length);
            localStorage.setItem('markers', JSON.stringify(updatedMarkers));
            await logUserAction("add", docRef.id);
        } catch (error) {
            console.error("Error adding marker: ", error);
        }
    };


    const deleteMarker = async (id: string) => {
        try {
            await deleteDoc(doc(db, "markers", id));
            const updatedMarkers = markers.filter(marker => marker.id !== id);
            setMarkers(updatedMarkers);
            setMarkerCount(updatedMarkers.length);
            localStorage.setItem('markers', JSON.stringify(updatedMarkers));
            await logUserAction("delete", id);
        } catch (error) {
            console.error("Error deleting marker: ", error);
        }
    };


    const deleteAllMarkers = async () => {
        try {
            const deletePromises = markers.map(marker => deleteDoc(doc(db, "markers", marker.id)));
            await Promise.all(deletePromises);
            setMarkers([]);
            setMarkerCount(0);
            localStorage.setItem('markers', JSON.stringify([]));
            await logUserAction("delete_all");
        } catch (error) {
            console.error("Error deleting all markers: ", error);
        }
    };

    // Update the position of a specific marker
    const updateMarkerPosition = async (id: string, lat: number, lng: number) => {
        try {
            await updateDoc(doc(db, "markers", id), { lat, lng });
            const updatedMarkers = markers.map(marker =>
                marker.id === id ? { ...marker, lat, lng } : marker
            );
            setMarkers(updatedMarkers);
            localStorage.setItem('markers', JSON.stringify(updatedMarkers));
            await logUserAction("move", id);
        } catch (error) {
            console.error("Error updating marker position: ", error);
        }
    };


    useEffect(() => {
        loadMarkersFromCache();
        fetchMarkers();
    }, []);

    return {
        markers,
        markerCount,
        addMarker,
        deleteMarker,
        deleteAllMarkers,
        updateMarkerPosition,
    };
};
