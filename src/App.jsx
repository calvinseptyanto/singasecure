import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import TopicsPage from "@/pages/Topics";
import WhatIfPage from "@/pages/WhatIf";

export default function App() {
  return (
    <Router>
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center py-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 mb-4">
              <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl">
                S
              </div>
              <span className="text-6xl font-bold text-gray-900">SecureKG</span>
            </NavLink>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <NavLink
                to="/topics"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-purple-600"
                  }`
                }
              >
                Topics
              </NavLink>
              <NavLink
                to="/what-if"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-purple-600"
                  }`
                }
              >
                What-If Analysis
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-36 pb-8">
        <Routes>
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/what-if" element={<WhatIfPage />} />
          <Route path="/" element={<TopicsPage />} />
        </Routes>
      </main>
    </Router>
  );
}
