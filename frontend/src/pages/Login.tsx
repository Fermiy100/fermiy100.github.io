import { useState } from "react";

export default function Login({ onLogin }: any) {
  const [email, setEmail] = useState("parent@school.test");
  const [password, setPassword] = useState("P@ssw0rd1!");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Демо-данные для тестирования
  const demoUsers = [
    { email: "director@school.test", password: "P@ssw0rd1!", role: "DIRECTOR" },
    { email: "parent@school.test", password: "P@ssw0rd1!", role: "PARENT" }
  ];

  async function submit(e: any) {
    e.preventDefault();
    setErr(""); setLoading(true);
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Проверяем демо-данные
      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        setErr("Неверные учетные данные");
        return;
      }
      
      // Успешный вход
      onLogin("demo-token-" + user.role, user.role);
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
