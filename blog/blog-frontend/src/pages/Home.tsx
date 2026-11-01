import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import request from '../utils/request'
import {useAuth} from '../context/AuthContext'
import type {PostItem} from '../types'

const Home = ()=>{
  const {isLogin,user,setUser} = useAuth()
  const [list,setList] = useState<PostItem[]>([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")

  // 退出登录：清除 token 与用户信息
  const logout = ()=>{
    localStorage.removeItem("token")
    setUser(null)
  }

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await request.get("/posts")
        setList(res.data.data.list)
      }catch(e:any){
        setError(e?.response?.data?.msg || "文章列表加载失败，请确认后端已启动")
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  return (
    <div style={{maxWidth:"1000px",margin:"0 auto",padding:"20px"}}>
      <h1>📖个人博客首页</h1>
      <div style={{marginBottom:"12px"}}>
        {isLogin ? (
          <>
            欢迎，{user?.username}
            <button onClick={logout} style={{marginLeft:"12px",cursor:"pointer"}}>退出登录</button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register" style={{marginLeft:"12px"}}>注册</Link>
          </>
        )}
      </div>
      <Link to="/write">写新文章</Link>
      {isLogin && <Link to="/favorites" style={{marginLeft:"12px"}}>我的收藏</Link>}
      <div>
        {loading && <p>加载中...</p>}
        {error && <p style={{color:"red"}}>{error}</p>}
        {!loading && !error && list.length===0 && <p>暂无文章</p>}
        {list.map(p=>(
          <div key={p.id} style={{border:"1px solid #eee",margin:"12px 0",padding:"12px"}}>
            {p.is_top===1 && <span style={{color:"red"}}>【置顶】</span>}
            <Link to={`/post/${p.id}`}><h3>{p.title}</h3></Link>
            <div>作者:{p.author_name} | 浏览:{p.views}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default Home;
