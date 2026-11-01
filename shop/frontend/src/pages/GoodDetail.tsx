import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import type { Good } from '../types'
import { useAuth } from '../context/AuthContext'

export default function GoodDetail() {
  const { id } = useParams()
  const [good, setGood] = useState<Good | null>(null)
  const [num, setNum] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { isLogin } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    setLoading(true)
    request.get(`/goods/${id}`)
      .then(r => { setGood(r.data.data); setError('') })
      .catch(e => setError(errMsg(e, '商品加载失败')))
      .finally(() => setLoading(false))
  }, [id])

  const addCart = async () => {
    if (!isLogin) { nav('/login'); return }
    try {
      const res = await request.post('/cart/add', { goodsId: Number(id), num })
      alert(res.data.msg)
    } catch (e) { alert(errMsg(e, '加入购物车失败')) }
  }

  const addFavorite = async () => {
    if (!isLogin) { nav('/login'); return }
    try {
      const res = await request.post(`/favorite/${id}`)
      alert(res.data.msg)
    } catch (e) { alert(errMsg(e, '收藏失败')) }
  }

  if (loading) return <div className="empty">加载中...</div>
  if (error) return <div className="empty">{error}</div>
  if (!good) return <div className="empty">商品不存在</div>

  return (
    <div className="card">
      <p className="muted"><Link to="/">首页</Link> / {good.category_name ?? '未分类'}</p>
      <h2 style={{ margin: '8px 0' }}>{good.title}</h2>
      <div className="row" style={{ marginBottom: 10 }}>
        {(good.tags ?? []).map(t => <span className="badge" key={t}>#{t}</span>)}
      </div>
      <p className="price" style={{ fontSize: 24, margin: '8px 0' }}>¥{good.price}</p>
      <p className="muted">库存 {good.stock}　销量 {good.sales}</p>
      <p style={{ lineHeight: 1.8 }}>{good.description}</p>
      <div className="row" style={{ marginTop: 16 }}>
        <input type="number" min={1} max={good.stock} value={num} style={{ width: 90 }}
          onChange={e => setNum(Math.max(1, Number(e.target.value) || 1))} />
        <button className="primary" onClick={addCart} disabled={good.stock <= 0}>
          {good.stock <= 0 ? '已售罄' : '加入购物车'}
        </button>
        <button onClick={addFavorite}>收藏</button>
        <Link to="/cart"><button>去购物车</button></Link>
      </div>
    </div>
  )
}
