import React from "react";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { FWACalculatorPage } from "./pages/FWACalculatorPage";
import { TravelPage } from "./pages/TravelPage";
import { Navbar } from "./components/navbar/Navbar";

function App() {
    return (
        <BrowserRouter>
            {/* <Navbar /> */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                {/* This whole path will eventually need to be a project subroute. */}
                <Route path="/fwa-census-calculator" element={<FWACalculatorPage />} />
                <Route path="/travel" element={<TravelPage />} />
                {/* TODO: Make a funny page */}
                <Route path="*" element={<p>No Page</p>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
