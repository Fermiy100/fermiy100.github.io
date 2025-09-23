import { useEffect, useState } from "react";

type Item = { id:number, name:string, mealType:string, dayOfWeek:number };

export default function Parent({ token: _token }: any) {
  const [menu, setMenu] = useState<any>(null);
  const [schoolId] = useState(1);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [msg, setMsg] = useState("");

  useEffect(()=> {
    fetch((import.meta.env.VITE_API_BASE || "https://school-meals-backend.vercel.app") + "/api/menus/current?schoolId=" + schoolId)
      .then(r=>r.json()).then(d=>setMenu(d.menu));
  }, []);

  function toggle(itemId: number) {
    setSelected(s => ({ ...s, [itemId]: s[itemId] ? 0 : 1 }));
  }

  async function submit() {
    const sels = Object.entries(selected).filter(([,v])=>v).map(([k,v])=>({ menuItemId: Number(k), quantity: v }));
    const res = await fetch((import.meta.env.VITE_API_BASE || "https://school-meals-backend.vercel.app") + "/api/selections", {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ selections: sels })
    });
    const d = await res.json();
    if (!res.ok) setMsg(d.error || "Failed");
    else setMsg("Submitted " + d.createdCount + " selections");
  }

  if (!menu) return <div style={{padding:20}}>Загружаем меню...</div>;

  // group by day and mealType
  const groups: Record<string, Item[]> = {};
  (menu.items || []).forEach((it:Item)=>{
    const key = it.dayOfWeek + '|' + it.mealType;
    groups[key] = groups[key] || [];
    groups[key].push(it);
  });

  const dayNames = ["","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];

  return (
    <div style={{padding:20}}>
      <h2>Выбор питания</h2>
      {Object.keys(groups).map((k)=>{
        const [dayIdx, mealType] = k.split("|");
        const items = groups[k];
        return (
          <div key={k} style={{marginBottom:12}} className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:700}}>{dayNames[Number(dayIdx)]} — {mealType}</div>
            </div>
            <div style={{marginTop:8}}>
              {items.map((it:Item)=>(
                <label key={it.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
                  <input type="checkbox" checked={Boolean(selected[it.id])} onChange={()=>toggle(it.id)} />
                  <div>
                    <div style={{fontWeight:600}}>{it.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{marginTop:12}}>
        <button onClick={submit} style={{background:"#0f172a",color:"white",padding:"8px 12px",borderRadius:6,border:"none"}}>Отправить выбор</button>
      </div>
      {msg && <div style={{marginTop:10}}>{msg}</div>}
    </div>
  );
}
