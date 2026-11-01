import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import type { Address as Addr } from '../types'
import { useAuth } from '../context/AuthContext'

export default function Address() {
  const [list, setList] = useState<Addr[]>([])
  const [form, setForm] = useState({ receiver_name: '', phone: '', address_detail: '', is_default: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { isLogin } = useAuth()

  const load = async () => {
    setLoading(true)
    try {
      const res = await request.get('/address')
      setList(res.data.data)
      setError('')
    } catch (e) {
      setError(errMsg(e, '地址加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLogin) load()
    else setLoading(false)
  }, [isLogin])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.receiver_name || !form.phone || !form.address_detail) {
      setError('收件人、手机号、详细地址都不能为空')
      return
    }
    try {
      await request.post('/address', { ...form, is_default: form.is_default ? 1 : 0 })
      setForm({ receiver_name: '', phone: '', address_detail: '', is_default: false })
      await load()
    } catch (err) {
      setError(errMsg(err, '新增地址失败'))
    }
  }

  const remove = async (id: number) => {
    if (!confirm('确定删除该地址？')) return
    try {
      await request.delete(`/address/${id}`)
      await load()
    } catch (e) {
      alert(errMsg(e, '删除失败'))
    }
  }

  if (!isLogin) return <div className="empty">请先<Link to="/login">登录</Link>后管理收货地址</div>

  return (
    <>
      <h2>收货地址</h2>
      {error && <p className="err">{error}</p>}
      {loading ? <div className="empty">加载中...</div> : (
        <>
          {list.length === 0 ? <div className="empty">还没有收货地址</div> : (
            <div className="card" style={{ padding: 0, marginBottom: 16 }}>
              {list.map(a => (
                <div className="between" key={a.id} style={{ padding: 14, borderBottom: '1px solid #eee' }}>
                  <div>
                    <span className="title-sm">{a.receiver_name}</span>
                    <span className="muted">　{a.phone}</span>
                    {a.is_default === 1 && <span className="badge" style={{ marginLeft: 8 }}>默认</span>}
                    <div className="muted">{a.address_detail}</div>
                  </div>
                  <button onClick={() => remove(a.id)}>删除</button>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h3 style={{ marginTop: 0 }}>新增地址</h3>
            <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 460 }}>
              <input placeholder="收件人姓名" value={form.receiver_name} onChange={e => setForm({ ...form, receiver_name: e.target.value })} />
              <input placeholder="手机号" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input placeholder="详细地址" value={form.address_detail} onChange={e => setForm({ ...form, address_detail: e.target.value })} />
              <label className="row">
                <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} style={{ width: 'auto' }} />
                <span className="muted">设为默认地址</span>
              </label>
              <button className="primary">保存地址</button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
