import xlsx from "xlsx";

export type ParsedRecord = { day:string; meal:string; dish:string; portion:string; raw?:string };

function detectDays(rows:any[][]): Map<number,string> {
  const days = ["понедельник","вторник","среда","четверг","пятница","суббота","воскресенье"];
  const map = new Map<number,string>();
  for (let c=0;c<(rows[0]||[]).length;c++) {
    for (let r=0;r<rows.length;r++) {
      const cell = (rows[r][c]||"").toString().toLowerCase();
      for (const d of days) {
        if (cell.includes(d)) {
          map.set(c, d[0].toUpperCase() + d.slice(1));
          break;
        }
      }
      if (map.has(c)) break;
    }
  }
  return map;
}

function detectMeal(cell:string|null): string | null {
  if (!cell) return null;
  const s = cell.toLowerCase();
  if (s.includes('завтр')) return 'Завтрак';
  if (s.includes('обед')) return 'Обед';
  if (s.includes('полд')) return 'Полдник';
  if (s.includes('ужин')) return 'Ужин';
  return null;
}

export function parseMenuFile(path:string): ParsedRecord[] {
  const wb = xlsx.readFile(path);
  const sheetName = wb.SheetNames.find(n=>/недель/i.test(n)) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws,{header:1, raw:false}) as any[][];
  const dayMap = detectDays(rows);
  const results:ParsedRecord[] = [];
  for (const [col, dayname] of Array.from(dayMap.entries())) {
    let currentMeal: string | null = null;
    for (let r=0;r<rows.length;r++) {
      const cell = (rows[r][col]||"").toString().trim();
      if (!cell) continue;
      const meal = detectMeal(cell);
      if (meal) { currentMeal = meal; continue; }
      if (currentMeal) {
        const portionMatch = cell.match(/(\d+\s?г|№\s*\d+\/\d+|\d+\/\d+\s?г|\d+\s?шт)/i);
        const portion = portionMatch ? portionMatch[0] : '';
        let dish = cell.replace(portion,'').trim();
        results.push({ day: dayname, meal: currentMeal, dish, portion, raw: cell });
      }
    }
  }
  return results;
}
