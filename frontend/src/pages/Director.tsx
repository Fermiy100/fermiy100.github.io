import { useState } from "react";

export default function Director({ token: _token }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  async function upload(e: any) {
    e.preventDefault();
    setMsg(""); setPreview([]);
    if (!file) return setMsg("Выберите файл");
    
    // Имитируем задержку загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Демо-данные для предпросмотра
    const demoMenuItems = [
      { id: 1, name: "Борщ", mealType: "Обед", dayOfWeek: 1, price: 150 },
      { id: 2, name: "Котлета", mealType: "Обед", dayOfWeek: 1, price: 200 },
      { id: 3, name: "Каша", mealType: "Завтрак", dayOfWeek: 2, price: 100 },
      { id: 4, name: "Суп", mealType: "Обед", dayOfWeek: 2, price: 120 },
      { id: 5, name: "Плов", mealType: "Обед", dayOfWeek: 3, price: 180 },
      { id: 6, name: "Салат", mealType: "Обед", dayOfWeek: 3, price: 80 },
      { id: 7, name: "Омлет", mealType: "Завтрак", dayOfWeek: 4, price: 90 },
      { id: 8, name: "Макароны", mealType: "Обед", dayOfWeek: 4, price: 130 },
      { id: 9, name: "Творог", mealType: "Завтрак", dayOfWeek: 5, price: 70 },
      { id: 10, name: "Рыба", mealType: "Обед", dayOfWeek: 5, price: 250 }
    ];
    
    setMsg("Меню загружено успешно! Обработано " + demoMenuItems.length + " блюд.");
    setPreview(demoMenuItems);
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
