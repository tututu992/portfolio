import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import type { Order as OrderType, OrderDetail } from '../types'
import { useAuth } from '../context/AuthContext'

const statusText: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成' }

export default function Order() {
  const [list, setList] = useState<OrderType[]>([])
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isLogin } = useAuth()

  useEffect(() => {
    if (!isLogin) { setLoading(false); return }
    request.get('/order')
      .then(r => setList(r.data.data))
      .catch(e => setError(errMsg(e, '订单加载失败')))
      .finally(() => setLoading(false))
  }, [isLogin])

  const openDetail = async (id: number) => {
    try {
      const res = await request.get(`/order/${id}`)
      setDetail(res.data.data)
    } catch (e) {
      alert(errMsg(e, '订单详情加载失败'))
    }
  }

  if (!isLogin) return <div className="empty">请先<Link to="/login">登录</Link>后查看订单</div>
  if (loading) return <div className="empty">加载中...</div>

  return (
    <>
      <h2>我的订单</h2>
      {error && <p className="err">{error}</p>}
      {list.length === 0 ? <div className="empty">还没有订单，去<Link to="/">购物</Link>吧</div> : (
        <div className="card" style={{ padding: 0 }}>
          {list.map(o => (
            <div key={o.id} style={{ padding: 14, borderBottom: '1px solid #eee' }}>
              <div className="between">
                <div>
                  <span className="title-sm">订单 #{o.id}</span>
                  <span className="badge" style={{ marginLeft: 8 }}>{statusText[o.status] ?? '未知状态'}</span>
                  <div className="muted">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="row">
                  <span>金额 <span className="price">¥{o.total_price}</span></span>
                  <button onClick={() => openDetail(o.id)}>查看明细</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="between">
            <h3 style={{ margin: 0 }}>订单 #{detail.id} 明细</h3>
            <button onClick={() => setDetail(null)}>关闭</button>
          </div>
          {detail.items.map(i => (
            <div className="between" key={i.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span>{i.title} × {i.num}</span>
              <span className="price">¥{(Number(i.price) * i.num).toFixed(2)}</span>
            </div>
          ))}
          <div className="between" style={{ marginTop: 12 }}>
            <span className="muted">收货地址 id：{detail.address_id}</span>
            <span>合计 <span className="price">¥{detail.total_price}</span></span>
          </div>
        </div>
      )}
    </>
  )
}
