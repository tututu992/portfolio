import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import type { Good, Category } from '../types'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [list, setList] = useState<Good[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [keyword, setKeyword] = useState('')
  const [cid, setCid] = useState<number | ''>('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isLogin } = useAuth()
  const nav = useNavigate()

  const load = async (kw = keyword, category = cid) => {
    setLoading(true)
    setError('')
    try {
      const res = await request.get('/goods', { params: { page: 1, pageSize: 24, keyword: kw, category_id: category || undefined } })
      setList(res.data.data.list)
      setTotal(res.data.data.total)
    } catch (e) {
      setError(errMsg(e, '商品加载失败，请确认后端已启动'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    request.get('/goods/categories').then(r => setCats(r.data.data)).catch(() => {})
    load('', '')
  }, [])

  const addCart = async (id: number) => {
    if (!isLogin) { nav('/login'); return }
    try {
      const res = await request.post('/cart/add', { goodsId: id, num: 1 })
      alert(res.data.msg)
    } catch (e) {
      alert(errMsg(e, '加入购物车失败'))
    }
  }

  const addFavorite = async (id: number) => {
    if (!isLogin) { nav('/login'); return }
    try {
      const res = await request.post(`/favorite/${id}`)
      alert(res.data.msg)
    } catch (e) {
      alert(errMsg(e, '收藏失败'))
    }
  }

  return (
    <>
      <div className="between" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>全部商品 <span className="muted">共 {total} 件</span></h2>
        <div className="row">
          <select value={cid} onChange={e => { const v = e.target.value ? Number(e.target.value) : ''; setCid(v); load(keyword, v) }}>
            <option value="">全部分类</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="搜索商品标题" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') load() }} />
          <button className="primary" onClick={() => load()}>搜索</button>
        </div>
      </div>

      {error && <p className="err">{error}</p>}
      {loading ? <div className="empty">加载中...</div> : list.length === 0 ? <div className="empty">没有找到商品</div> : (
        <div className="grid">
          {list.map(g => (
            <div className="card" key={g.id}>
              <Link to={`/goods/${g.id}`} className="title-sm">{g.title}</Link>
              <p className="muted" style={{ margin: '6px 0' }}>{g.description}</p>
              <div className="row" style={{ marginBottom: 8 }}>
                {(g.tags ?? []).map(t => <span className="badge" key={t}>#{t}</span>)}
              </div>
              <div className="between">
                <span className="price">¥{g.price}</span>
                <span className="muted">库存 {g.stock}</span>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="primary" onClick={() => addCart(g.id)}>加入购物车</button>
                <button onClick={() => addFavorite(g.id)}>收藏</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
