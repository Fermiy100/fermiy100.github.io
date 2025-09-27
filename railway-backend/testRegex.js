/**
 * ТЕСТ РЕГУЛЯРНЫХ ВЫРАЖЕНИЙ
 */

const testText = "Борщ с мясом 120 руб";

const patterns = [
  /(\d+)\s*(руб|₽|р\.?|рублей?|руб\.)/gi,
  /(\d+)\s*(коп|копеек?)/gi,
  /(\d+)\s*(грн|гривен)/gi,
  /(\d+)\s*(долл|долларов?|usd)/gi,
  /(\d+)\s*(евро|eur)/gi
];

console.log('🔍 ТЕСТ РЕГУЛЯРНЫХ ВЫРАЖЕНИЙ...\n');
console.log(`Текст: "${testText}"\n`);

patterns.forEach((pattern, i) => {
  console.log(`Паттерн ${i + 1}: ${pattern}`);
  const match = testText.match(pattern);
  if (match) {
    console.log(`✅ Найдено: "${match[0]}"`);
    console.log(`   Группа 1: "${match[1]}"`);
    console.log(`   Группа 2: "${match[2]}"`);
    console.log(`   Цена: ${parseInt(match[1])}`);
  } else {
    console.log('❌ Не найдено');
  }
  console.log('');
});

// Тест с exec
console.log('🔍 ТЕСТ С EXEC:');
const pattern = /(\d+)\s*(руб|₽|р\.?|рублей?|руб\.)/gi;
let match;
while ((match = pattern.exec(testText)) !== null) {
  console.log(`Найдено: "${match[0]}" -> Цена: ${parseInt(match[1])}`);
}
