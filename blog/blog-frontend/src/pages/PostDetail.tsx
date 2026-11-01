import {useEffect,useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import Markdown from 'react-markdown'
import request from '../utils/request'
import {useAuth} from '../context/AuthContext'
import type {PostItem} from '../types'

const PostDetail = ()=>{
  const {id} = useParams()
  const {isLogin} = useAuth()
  const navigate = useNavigate()

  const [post,setPost] = useState<PostItem|null>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")
  const [favorited,setFavorited] = useState(false)
  const [favLoading,setFavLoading] = useState(false)

  // 加载文章详情（后端会顺带 views+1）
  useEffect(()=>{
    if(!id) return
    const load = async ()=>{
      setLoading(true)
      setError("")
      try{
        const res = await request.get(`/posts/${id}`)
        setPost(res.data.data)
      }catch(e:any){
        setError(e?.response?.data?.msg || "文章加载失败")
      }finally{
        setLoading(false)
      }
    }
    load()
  },[id])

  // 已登录时拉一次收藏列表，判断当前文章是否已收藏
  useEffect(()=>{
    if(!isLogin || !id){
      setFavorited(false)
      return
    }
    const check = async ()=>{
      try{
        const res = await request.get("/favorite/list")
        setFavorited(res.data.data.some((f:{id:number})=>f.id===Number(id)))
      }catch{
        // 收藏状态查询失败不影响正文展示
      }
    }
    check()
  },[isLogin,id])

  // 收藏 / 取消收藏
  const toggleFavorite = async ()=>{
    if(!isLogin){
      navigate("/login")
      return
    }
    if(!id) return
    setFavLoading(true)
    try{
      if(favorited){
        await request.delete(`/favorite/${id}`)
        setFavorited(false)
      }else{
        await request.post(`/favorite/${id}`)
        setFavorited(true)
      }
    }catch(e:any){
      alert(e?.response?.data?.msg || "操作失败")
    }finally{
      setFavLoading(false)
    }
  }

  const box = {maxWidth:"860px",margin:"0 auto",padding:"20px"}

  if(loading) return <div style={box}>加载中...</div>
  if(error) return (
    <div style={box}>
      <p style={{color:"red"}}>{error}</p>
      <Link to="/">返回首页</Link>
    </div>
  )
  if(!post) return null

  return (
    <div style={box}>
      <Link to="/">← 返回首页</Link>
      <h1>
        {post.is_top===1 && <span style={{color:"red",fontSize:"16px"}}>【置顶】</span>}
        {post.title}
      </h1>
      <div style={{color:"#888",marginBottom:"16px"}}>
        作者:{post.author_name} | 浏览:{post.views} | 发布于:{new Date(post.created_at).toLocaleString()}
      </div>
      <button
        onClick={toggleFavorite}
        disabled={favLoading}
        style={{marginBottom:"20px",padding:"6px 14px",cursor:"pointer"}}
      >
        {favorited ? "★ 已收藏（点击取消）" : "☆ 收藏文章"}
      </button>
      <div style={{lineHeight:1.8}}>
        <Markdown>{post.content}</Markdown>
      </div>
      {post.tags?.length>0 && (
        <div style={{marginTop:"20px",color:"#555"}}>
          标签:{post.tags.map(t=><span key={t} style={{marginRight:"8px"}}>#{t}</span>)}
        </div>
      )}
    </div>
  )
}
export default PostDetail;
