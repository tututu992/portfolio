import {useEffect,useState} from 'react'
import type {FormEvent} from 'react'
import {Link,Navigate,useNavigate} from 'react-router-dom'
import request from '../utils/request'
import {useAuth} from '../context/AuthContext'

interface Category{
  id:number;
  name:string;
  description?:string;
}

const WritePost = ()=>{
  const {isLogin} = useAuth()
  const navigate = useNavigate()

  const [categories,setCategories] = useState<Category[]>([])
  const [title,setTitle] = useState("")
  const [content,setContent] = useState("")
  const [category,setCategory] = useState<number|"">("")
  const [tags,setTags] = useState("")
  const [cover,setCover] = useState("")
  const [isTop,setIsTop] = useState(false)
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState("")

  // 分类下拉数据
  useEffect(()=>{
    if(!isLogin) return
    const load = async ()=>{
      try{
        const res = await request.get("/categories")
        setCategories(res.data.data)
        if(res.data.data.length>0) setCategory(res.data.data[0].id)
      }catch(e:any){
        setError(e?.response?.data?.msg || "分类加载失败")
      }
    }
    load()
  },[isLogin])

  // 未登录直接跳登录页
  if(!isLogin) return <Navigate to="/login" replace/>

  const submit = async (ev:FormEvent)=>{
    ev.preventDefault()
    setError("")
    if(!title.trim() || !content.trim() || category===""){
      setError("标题、正文、分类均不能为空")
      return
    }
    setSubmitting(true)
    try{
      const res = await request.post("/posts",{
        title:title.trim(),
        content,
        category:Number(category),
        tags:tags.split(/[,，]/).map(t=>t.trim()).filter(Boolean),
        cover:cover.trim()||null,
        is_top:isTop ? 1 : 0
      })
      // 后端返回 { code, msg, postId }
      navigate(`/post/${res.data.postId}`)
    }catch(e:any){
      setError(e?.response?.data?.msg || "发布失败")
    }finally{
      setSubmitting(false)
    }
  }

  const field = {display:"block",width:"100%",marginBottom:"12px",padding:"8px"}

  return (
    <div style={{maxWidth:"860px",margin:"0 auto",padding:"20px"}}>
      <Link to="/">← 返回首页</Link>
      <h1>写文章</h1>
      {error && <p style={{color:"red"}}>{error}</p>}
      <form onSubmit={submit}>
        <input
          style={field}
          placeholder="标题"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />
        <select
          style={field}
          value={category}
          onChange={e=>setCategory(Number(e.target.value))}
        >
          <option value="">请选择分类</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          style={field}
          placeholder="标签，用逗号分隔，例如：React,TypeScript"
          value={tags}
          onChange={e=>setTags(e.target.value)}
        />
        <input
          style={field}
          placeholder="封面图地址（可留空）"
          value={cover}
          onChange={e=>setCover(e.target.value)}
        />
        <textarea
          style={{...field,minHeight:"300px",fontFamily:"monospace"}}
          placeholder="正文，支持 Markdown"
          value={content}
          onChange={e=>setContent(e.target.value)}
        />
        <label style={{display:"block",marginBottom:"12px"}}>
          <input
            type="checkbox"
            checked={isTop}
            onChange={e=>setIsTop(e.target.checked)}
          />
          设为置顶
        </label>
        <button type="submit" disabled={submitting} style={{padding:"8px 20px",cursor:"pointer"}}>
          {submitting ? "发布中..." : "发布文章"}
        </button>
      </form>
    </div>
  )
}
export default WritePost;
