import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navStyle = ({ isActive }: { isActive: boolean }) => ({ color: isActive ? '#ff5a1f' : '#57606a', fontSize: 14 })

export default function Layout() {
  const { user, isLogin, setUser } = useAuth()
  const nav = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    nav('/')
  }

  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">🛍 Mini Shop</Link>
        <NavLink to="/" className="link" style={navStyle} end>首页</NavLink>
        <NavLink to="/cart" className="link" style={navStyle}>购物车</NavLink>
        <NavLink to="/favorites" className="link" style={navStyle}>我的收藏</NavLink>
        <NavLink to="/order" className="link" style={navStyle}>我的订单</NavLink>
        <NavLink to="/address" className="link" style={navStyle}>收货地址</NavLink>
        <div className="spacer" />
        {isLogin ? (
          <>
            <span className="user">你好，{user?.username}</span>
            <button onClick={logout}>退出</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="link" style={navStyle}>登录</NavLink>
            <NavLink to="/register" className="link" style={navStyle}>注册</NavLink>
          </>
        )}
      </header>
      <main className="wrap">
        <Outlet />
      </main>
    </>
  )
}
