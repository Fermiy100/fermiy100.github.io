import { useState } from "react";

export default function Director({ token: _token }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  async function upload(e: any) {
    e.preventDefault();
    setMsg(""); setPreview([]);
    if (!file) return setMsg("Выберите файл");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("schoolId", "1");
    const res = await fetch((import.meta.env.VITE_API_BASE || "https://school-meals-backend.vercel.app") + "/api/menus/upload", {
      method: "POST",
      body: fd,
      headers: {}
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "Upload failed");
    setMsg("Uploaded: " + (data.created || data.createdCount || 0) + " items. menuId=" + data.menuId);
    // fetch current menu to preview
    const cur = await fetch((import.meta.env.VITE_API_BASE || "https://school-meals-backend.vercel.app") + "/api/menus/current?schoolId=1");
    const j = await cur.json();
    if (j.menu && j.menu.items) setPreview(j.menu.items);
  }

  return (
    <div style={{padding:20}}>
      <div style={{display:"flex",gap:12,alignItems:"center",justifyContent:"space-between"}}>
        <h2>Директор — загрузка меню</h2>
      </div>
      <form onSubmit={upload} style={{marginTop:12}}>
        <div style={{marginBottom:10}}>
          <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" style={{background:"#0f172a",color:"white",padding:"8px 12px",borderRadius:6,border:"none"}}>Загрузить</button>
      </form>
      {msg && <div style={{marginTop:12}}>{msg}</div>}
      {preview.length>0 && (
        <div style={{marginTop:16}}>
          <h3>Предпросмотр</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {preview.slice(0,40).map((it:any, idx:number)=>(
              <div key={idx} className="card" style={{padding:8}}>
                <div style={{fontSize:13,fontWeight:600}}>{it.name}</div>
                <div style={{fontSize:12,color:"#6b7280"}}>{it.mealType} — день {it.dayOfWeek}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
