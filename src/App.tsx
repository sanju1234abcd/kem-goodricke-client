import { Route, Routes } from "react-router-dom"
import "./App.css"
import StockForm from "./StockForm"
import Admin from "./Admin"

function App() {

  return (
    <Routes>
      <Route path="/" element={<StockForm/>} />
      <Route path="/admin" element={<Admin/>} />
    </Routes>
  )
}

export default App
