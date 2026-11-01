import {useState} from 'react'
import type {FormEvent} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import request from '../utils/request'

const Register = ()=>{
  const navigate = useNavigate()

  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const submit = async (ev:FormEvent)=>{
    ev.preventDefault()
    setError("")
    // 与后端校验保持一致
    if(username.length<3 || username.length>20){
      setError("用户名需 3-20 个字符")
      return
    }
    if(password.length<6){
      setError("密码至少 6 位")
      return
    }
    if(!email.trim()){
      setError("请输入邮箱")
      return
    }
    setLoading(true)
    try{
      await request.post("/auth/register",{
        username:username.trim(),
        email:email.trim(),
        password
      })
      alert("注册成功，请登录")
      navigate("/login")
    }catch(e:any){
      setError(e?.response?.data?.msg || "注册失败，请稍后重试")
    }finally{
      setLoading(false)
    }
  }

  const field = {display:"block",width:"100%",marginBottom:"12px",padding:"8px",boxSizing:"border-box" as const}

  return (
    <div style={{maxWidth:"360px",margin:"60px auto",padding:"20px"}}>
      <h1>注册</h1>
      {error && <p style={{color:"red"}}>{error}</p>}
      <form onSubmit={submit}>
        <input
          style={field}
          placeholder="用户名（3-20 字符）"
          value={username}
          onChange={e=>setUsername(e.target.value)}
        />
        <input
          style={field}
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          style={field}
          type="password"
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading} style={{width:"100%",padding:"8px",cursor:"pointer"}}>
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p>
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </div>
  )
}
export default Register;
