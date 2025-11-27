import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login/>} />
        <Route path="/admin/dashboard" element={<Dashboard/>} />
        <Route path="*" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
