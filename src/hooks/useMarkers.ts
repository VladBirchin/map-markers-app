import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const useMarkers = () => {
    const [markers, setMarkers] = useState<any[]>([]);
    const [markerCount, setMarkerCount] = useState(0);

    // Fetch markers from Firestore
    const fetchMarkers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "markers"));
            const markersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMarkers(markersData);
            setMarkerCount(markersData.length);
        } catch (error) {
            console.error("Error fetching markers: ", error);
        }
    };

    // Add a new marker to Firestore
    const addMarker = async (lat: number, lng: number) => {
        try {
            const newMarker = {
                lat,
                lng,
                timestamp: new Date(),
                number: markerCount + 1,
            };

            const docRef = await addDoc(collection(db, "markers"), newMarker);
            setMarkers(prev => [...prev, { id: docRef.id, ...newMarker }]);
            setMarkerCount(prev => prev + 1);
        } catch (error) {
            console.error("Error adding marker: ", error);
        }
    };

    // Delete a specific marker from Firestore
    const deleteMarker = async (id: string) => {
        try {
            await deleteDoc(doc(db, "markers", id));
            setMarkers(prev => prev.filter(marker => marker.id !== id));
            setMarkerCount(prev => prev - 1);
        } catch (error) {
            console.error("Error deleting marker: ", error);
        }
    };

    // Delete all markers from Firestore
    const deleteAllMarkers = async () => {
        try {
            const deletePromises = markers.map(marker => deleteDoc(doc(db, "markers", marker.id)));
            await Promise.all(deletePromises);
            await fetchMarkers(); // Refetch markers after deletion
        } catch (error) {
            console.error("Error deleting all markers: ", error);
        }
    };

    // Update the position of a specific marker
    const updateMarkerPosition = async (id: string, lat: number, lng: number) => {
        try {
            await updateDoc(doc(db, "markers", id), { lat, lng });
            setMarkers(prev => prev.map(marker =>
                marker.id === id ? { ...marker, lat, lng } : marker
            ));
        } catch (error) {
            console.error("Error updating marker position: ", error);
        }
    };

    // Fetch markers on initial mount
    useEffect(() => {
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
