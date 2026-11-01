import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request, { errMsg } from '../utils/request'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.username.length < 3 || form.username.length > 20) { setError('用户名需 3-20 个字符'); return }
    if (form.password.length < 6) { setError('密码至少 6 位'); return }

    setLoading(true)
    try {
      await request.post('/auth/register', form)
      alert('注册成功，请登录')
      nav('/login')
    } catch (err) {
      setError(errMsg(err, '注册失败'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: '40px auto' }}>
      <h2 style={{ marginTop: 0 }}>注册</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input placeholder="用户名（3-20 字符）" value={form.username} onChange={set('username')} />
        <input placeholder="邮箱" value={form.email} onChange={set('email')} />
        <input type="password" placeholder="密码（至少 6 位）" value={form.password} onChange={set('password')} />
        {error && <p className="err" style={{ margin: 0 }}>{error}</p>}
        <button className="primary" disabled={loading}>{loading ? '提交中...' : '注册'}</button>
      </form>
      <p className="muted">已有账号？<Link to="/login">去登录</Link></p>
    </div>
  )
}
