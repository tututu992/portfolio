import {useState} from 'react'
import type {FormEvent} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import request from '../utils/request'
import {useAuth} from '../context/AuthContext'

const Login = ()=>{
  const {setUser} = useAuth()
  const navigate = useNavigate()

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const submit = async (ev:FormEvent)=>{
    ev.preventDefault()
    setError("")
    if(!username.trim() || !password){
      setError("请输入用户名和密码")
      return
    }
    setLoading(true)
    try{
      const res = await request.post("/auth/login",{username:username.trim(),password})
      // 后端返回 { code, msg, data: { token, user } }
      localStorage.setItem("token",res.data.data.token)
      setUser(res.data.data.user)
      navigate("/")
    }catch(e:any){
      setError(e?.response?.data?.msg || "登录失败，请稍后重试")
    }finally{
      setLoading(false)
    }
  }

  const field = {display:"block",width:"100%",marginBottom:"12px",padding:"8px",boxSizing:"border-box" as const}

  return (
    <div style={{maxWidth:"360px",margin:"60px auto",padding:"20px"}}>
      <h1>登录</h1>
      {error && <p style={{color:"red"}}>{error}</p>}
      <form onSubmit={submit}>
        <input
          style={field}
          placeholder="用户名"
          value={username}
          onChange={e=>setUsername(e.target.value)}
        />
        <input
          style={field}
          type="password"
          placeholder="密码"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading} style={{width:"100%",padding:"8px",cursor:"pointer"}}>
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
      <p>
        还没有账号？<Link to="/register">去注册</Link>
      </p>
      <Link to="/">← 返回首页</Link>
    </div>
  )
}
export default Login;
