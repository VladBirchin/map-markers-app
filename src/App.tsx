// src/App.tsx
import React from "react";
import MapComponent from "./components/MapComponent";
import "./styles.css";

const App: React.FC = () => {
  return (
      <div className="App">
        <h1>Мапа з маркерами</h1>
        <MapComponent />
      </div>
  );
};

export default App;
