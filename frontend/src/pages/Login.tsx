import { useState } from "react";

export default function Login({ onLogin }: any) {
  const [email, setEmail] = useState("parent@school.test");
  const [password, setPassword] = useState("P@ssw0rd1!");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || "https://school-meals-backend.vercel.app") + "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return setErr(data.error || "Login failed");
      // store token and role
      onLogin(data.token, data.user.role);
    } catch (e:any) {
      setErr(String(e));
    } finally { setLoading(false); }
  }

  return (
    <div style={{maxWidth:420, margin:"40px auto"}} className="card">
      <h2 style={{marginBottom:6}}>Вход</h2>
      <p style={{color:"#374151", marginTop:0}}>Введите email и пароль</p>
      <form onSubmit={submit}>
        <div style={{marginBottom:10}}>
          <label style={{display:"block",fontSize:13,color:"#374151"}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",padding:8,borderRadius:6,border:"1px solid #e5e7eb"}} />
        </div>
        <div style={{marginBottom:10}}>
          <label style={{display:"block",fontSize:13,color:"#374151"}}>Пароль</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%",padding:8,borderRadius:6,border:"1px solid #e5e7eb"}} />
        </div>
        <div style={{display:"flex",gap:8}}>
          <button type="submit" disabled={loading} style={{flex:1,background:"#111827",color:"white",padding:10,borderRadius:6,border:"none"}}>Войти</button>
        </div>
        {err && <div style={{color:"red",marginTop:10}}>{err}</div>}
      </form>
      <div style={{marginTop:12,fontSize:13,color:"#6b7280"}}>Тестовые аккаунты: director@school.test / P@ssw0rd1!  или parent@school.test / P@ssw0rd1!</div>
    </div>
  );
}
