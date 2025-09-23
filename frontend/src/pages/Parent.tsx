import { useEffect, useState } from "react";

type Item = { id:number, name:string, mealType:string, dayOfWeek:number };

export default function Parent({ token: _token }: any) {
  const [menu, setMenu] = useState<any>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [msg, setMsg] = useState("");

  useEffect(()=> {
    // Демо-данные для меню
    const demoMenu = {
      id: 1,
      title: "Меню на неделю",
      week: "2024-01-15",
      items: [
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
      ]
    };
    
    // Имитируем задержку загрузки
    setTimeout(() => setMenu(demoMenu), 500);
  }, []);

  function toggle(itemId: number) {
    setSelected(s => ({ ...s, [itemId]: s[itemId] ? 0 : 1 }));
  }

  async function submit() {
    const sels = Object.entries(selected).filter(([,v])=>v).map(([k,v])=>({ menuItemId: Number(k), quantity: v }));
    
    // Имитируем задержку отправки
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setMsg("Выбор сохранен! Выбрано " + sels.length + " блюд.");
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
