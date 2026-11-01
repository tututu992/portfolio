import {useEffect,useState} from 'react'
import {Link,Navigate} from 'react-router-dom'
import request from '../utils/request'
import {useAuth} from '../context/AuthContext'

// 收藏接口返回的字段（比 PostItem 少了 content / author_id）
interface FavoritePost{
  favorite_id:number;
  favorite_at:string;
  id:number;
  title:string;
  cover?:string|null;
  category:number;
  tags:string[];
  views:number;
  is_top:0|1;
  created_at:string;
  author_name:string;
}

const Favorites = ()=>{
  const {isLogin} = useAuth()
  const [list,setList] = useState<FavoritePost[]>([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")

  const load = async ()=>{
    try{
      const res = await request.get("/favorite/list")
      setList(res.data.data)
    }catch(e:any){
      setError(e?.response?.data?.msg || "收藏列表加载失败")
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    if(!isLogin) return
    load()
  },[isLogin])

  if(!isLogin) return <Navigate to="/login" replace/>

  const remove = async (postId:number)=>{
    try{
      await request.delete(`/favorite/${postId}`)
      setList(prev=>prev.filter(p=>p.id!==postId))
    }catch(e:any){
      alert(e?.response?.data?.msg || "取消收藏失败")
    }
  }

  return (
    <div style={{maxWidth:"1000px",margin:"0 auto",padding:"20px"}}>
      <Link to="/">← 返回首页</Link>
      <h1>我的收藏</h1>
      {loading && <p>加载中...</p>}
      {error && <p style={{color:"red"}}>{error}</p>}
      {!loading && !error && list.length===0 && <p>还没有收藏任何文章</p>}
      {list.map(p=>(
        <div key={p.favorite_id} style={{border:"1px solid #eee",margin:"12px 0",padding:"12px"}}>
          {p.is_top===1 && <span style={{color:"red"}}>【置顶】</span>}
          <Link to={`/post/${p.id}`}><h3>{p.title}</h3></Link>
          <div>作者:{p.author_name} | 浏览:{p.views} | 收藏于:{new Date(p.favorite_at).toLocaleString()}</div>
          <button onClick={()=>remove(p.id)} style={{marginTop:"8px",cursor:"pointer"}}>
            取消收藏
          </button>
        </div>
      ))}
    </div>
  )
}
export default Favorites;
