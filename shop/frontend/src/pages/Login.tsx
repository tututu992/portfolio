import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await request.post('/auth/login', { username, password })
      localStorage.setItem('token', res.data.data.token)
      setUser(res.data.data.user)
      nav('/')
    } catch (err) {
      setError(errMsg(err, '登录失败'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: '40px auto' }}>
      <h2 style={{ marginTop: 0 }}>登录</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="err" style={{ margin: 0 }}>{error}</p>}
        <button className="primary" disabled={loading}>{loading ? '登录中...' : '登录'}</button>
      </form>
      <p className="muted">还没有账号？<Link to="/register">去注册</Link>　演示账号 demo / 123456</p>
    </div>
  )
}
