import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import type { FavoriteItem } from '../types'
import { useAuth } from '../context/AuthContext'

export default function Favorites() {
  const [list, setList] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isLogin } = useAuth()

  const load = async () => {
    setLoading(true)
    try {
      const res = await request.get('/favorite/list')
      setList(res.data.data)
      setError('')
    } catch (e) {
      setError(errMsg(e, '收藏加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLogin) load()
    else setLoading(false)
  }, [isLogin])

  const unFavorite = async (goodsId: number) => {
    try {
      await request.delete(`/favorite/${goodsId}`)
      setList(prev => prev.filter(i => i.goods_id !== goodsId))
    } catch (e) {
      alert(errMsg(e, '取消收藏失败'))
    }
  }

  const addCart = async (goodsId: number) => {
    try {
      const res = await request.post('/cart/add', { goodsId, num: 1 })
      alert(res.data.msg)
    } catch (e) {
      alert(errMsg(e, '加入购物车失败'))
    }
  }

  if (!isLogin) return <div className="empty">请先<Link to="/login">登录</Link>后查看收藏</div>
  if (loading) return <div className="empty">加载中...</div>

  return (
    <>
      <h2>我的收藏 <span className="muted">共 {list.length} 件</span></h2>
      {error && <p className="err">{error}</p>}
      {list.length === 0 ? <div className="empty">还没有收藏任何商品，去<Link to="/">逛逛</Link></div> : (
        <div className="grid">
          {list.map(f => (
            <div className="card" key={f.goods_id}>
              <Link to={`/goods/${f.goods_id}`} className="title-sm">{f.title}</Link>
              <div className="row" style={{ margin: '8px 0' }}>
                {(f.tags ?? []).map(t => <span className="badge" key={t}>#{t}</span>)}
              </div>
              <div className="between">
                <span className="price">¥{f.price}</span>
                <span className="muted">库存 {f.stock}</span>
              </div>
              <p className="muted" style={{ margin: '8px 0 0' }}>收藏于 {new Date(f.favorite_at).toLocaleString()}</p>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="primary" onClick={() => addCart(f.goods_id)} disabled={f.stock <= 0}>
                  {f.stock <= 0 ? '已售罄' : '加入购物车'}
                </button>
                <button onClick={() => unFavorite(f.goods_id)}>取消收藏</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
