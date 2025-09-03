import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DogAgeCalculator from "./components/DogAgeCalculator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DogAgeCalculator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;