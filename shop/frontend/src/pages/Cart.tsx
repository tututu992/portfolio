import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import request, { errMsg } from '../utils/request'
import type { CartItem, Address } from '../types'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const [list, setList] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { isLogin } = useAuth()
  const nav = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const [c, a] = await Promise.all([request.get('/cart'), request.get('/address')])
      setList(c.data.data)
      setAddresses(a.data.data)
      const def = (a.data.data as Address[]).find(x => x.is_default === 1) ?? a.data.data[0]
      setAddressId(def ? def.id : '')
      setError('')
    } catch (e) {
      setError(errMsg(e, '购物车加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLogin) load()
    else setLoading(false)
  }, [isLogin])

  const changeNum = async (item: CartItem, num: number) => {
    if (num < 1) return
    try {
      await request.put(`/cart/${item.id}`, { num })
      await load()
    } catch (e) {
      alert(errMsg(e, '修改数量失败'))
    }
  }

  const remove = async (id: number) => {
    if (!confirm('确定从购物车移除该商品？')) return
    try {
      await request.delete(`/cart/${id}`)
      await load()
    } catch (e) {
      alert(errMsg(e, '删除失败'))
    }
  }

  const total = list.reduce((s, i) => s + Number(i.price) * i.num, 0)

  const checkout = async () => {
    if (!addressId) { alert('请先添加并选择收货地址'); return }
    setSubmitting(true)
    try {
      const res = await request.post('/order/create', { addressId })
      alert(`${res.data.msg}，订单号 ${res.data.data.orderId}，金额 ¥${res.data.data.total_price}`)
      await load()
      nav('/order')
    } catch (e) {
      alert(errMsg(e, '下单失败'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLogin) return <div className="empty">请先<Link to="/login">登录</Link>后查看购物车</div>
  if (loading) return <div className="empty">加载中...</div>

  return (
    <>
      <h2>购物车</h2>
      {error && <p className="err">{error}</p>}
      {list.length === 0 ? <div className="empty">购物车是空的，去<Link to="/">逛逛</Link></div> : (
        <>
          <div className="card" style={{ padding: 0 }}>
            {list.map(i => (
              <div className="between" key={i.id} style={{ padding: 14, borderBottom: '1px solid #eee' }}>
                <div>
                  <Link to={`/goods/${i.goods_id}`} className="title-sm">{i.title}</Link>
                  <div className="muted">单价 ¥{i.price}　库存 {i.stock}</div>
                </div>
                <div className="row">
                  <button onClick={() => changeNum(i, i.num - 1)}>-</button>
                  <span style={{ minWidth: 28, textAlign: 'center' }}>{i.num}</span>
                  <button onClick={() => changeNum(i, i.num + 1)} disabled={i.num >= i.stock}>+</button>
                  <span className="price" style={{ minWidth: 80, textAlign: 'right' }}>¥{(Number(i.price) * i.num).toFixed(2)}</span>
                  <button onClick={() => remove(i.id)}>移除</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="between">
              <div className="row">
                <span>收货地址：</span>
                {addresses.length === 0 ? (
                  <span className="muted">还没有地址，去<Link to="/address">添加</Link></span>
                ) : (
                  <select value={addressId} onChange={e => setAddressId(Number(e.target.value))} style={{ minWidth: 320 }}>
                    {addresses.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.receiver_name} {a.phone} {a.address_detail}{a.is_default === 1 ? '（默认）' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="row">
                <span>合计：<span className="price">¥{total.toFixed(2)}</span></span>
                <button className="primary" onClick={checkout} disabled={submitting}>{submitting ? '提交中...' : '提交订单'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
