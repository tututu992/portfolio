import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import GoodDetail from './pages/GoodDetail'
import Cart from './pages/Cart'
import Address from './pages/Address'
import Order from './pages/Order'
import Favorites from './pages/Favorites'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/goods/:id" element={<GoodDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/address" element={<Address />} />
            <Route path="/order" element={<Order />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
