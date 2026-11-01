import {createContext,useContext,useState} from 'react'
import type {ReactNode} from 'react'
import type {User} from '../types'

interface AuthCtxType{
  user:User|null;
  setUser:(u:User|null)=>void;
  isLogin:boolean;
}

const USER_KEY = "user"

// 刷新页面后从 localStorage 恢复登录用户信息
const readUser = ():User|null=>{
  try{
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) as User : null
  }catch{
    return null
  }
}

const AuthContext = createContext<AuthCtxType|null>(null);

export const AuthProvider = ({children}:{children:ReactNode})=>{
  const [user,setUserState] = useState<User|null>(readUser)

  // 同步写入 localStorage，退出登录时清除
  const setUser = (u:User|null)=>{
    setUserState(u)
    if(u){
      localStorage.setItem(USER_KEY,JSON.stringify(u))
    }else{
      localStorage.removeItem(USER_KEY)
    }
  }

  return (
    <AuthContext.Provider value={{user,setUser,isLogin:!!user}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = ()=>{
  const ctx = useContext(AuthContext);
  if(!ctx) throw new Error("useAuth必须包裹在AuthProvider内")
  return ctx;
}
