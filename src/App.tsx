import React from "react";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { FWACalculatorPage } from "./pages/FWACalculatorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* This whole path will eventually need to be a project subroute. */}
        <Route path="/fwa-census-calculator" element={<FWACalculatorPage />} />
        {/* TODO: Make a funny page */}
        <Route path="*" element={<p>No Page</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
