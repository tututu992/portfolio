import {BrowserRouter,Routes,Route} from 'react-router-dom'
import {AuthProvider} from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import WritePost from './pages/WritePost'
import Favorites from './pages/Favorites'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/post/:id" element={<PostDetail/>}/>
          <Route path="/write" element={<WritePost/>}/>
          <Route path="/favorites" element={<Favorites/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App
