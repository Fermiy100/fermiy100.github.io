import { useState } from 'react';

interface AddItemFormProps {
  onAdd: (formData: any) => void;
  onCancel: () => void;
}

export default function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    meal_type: 'завтрак',
    day_of_week: 'понедельник',
    weight: '',
    recipe_number: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Введите название блюда');
      return;
    }
    
    // СТРОГАЯ ВАЛИДАЦИЯ ТИПА ПИТАНИЯ
    const dishName = formData.name.toLowerCase().trim();
    const selectedMealType = formData.meal_type;
    
    // Проверяем совместимость блюда с выбранным типом питания
    const validationResult = validateMealTypeCompatibility(dishName, selectedMealType);
    
    if (!validationResult.isValid) {
      alert(`❌ Ошибка: ${validationResult.message}\n\n💡 Рекомендуем: ${validationResult.suggestion}`);
      return;
    }
    
    onAdd({
      ...formData,
      price: parseFloat(formData.price) || 0
    });
  };

  // ФУНКЦИЯ ВАЛИДАЦИИ СОВМЕСТИМОСТИ БЛЮДА С ТИПОМ ПИТАНИЯ
  const validateMealTypeCompatibility = (dishName: string, mealType: string) => {
    // Блюда, которые НИКОГДА не должны быть в завтраке
    const notForBreakfast = [
      { pattern: /суп|борщ|щи|рассольник/i, suggestion: 'Супы подаются в обед' },
      { pattern: /котлет|биточк|тефтел/i, suggestion: 'Мясные блюда подаются в обед' },
      { pattern: /компот|кисель/i, suggestion: 'Эти напитки подаются в обед' },
      { pattern: /салат\s+(овощн|мясн)/i, suggestion: 'Салаты подаются в обед' }
    ];
    
    // Блюда, которые НИКОГДА не должны быть в обеде
    const notForLunch = [
      { pattern: /каша\s+молочн|овсян/i, suggestion: 'Молочные каши подаются на завтрак' },
      { pattern: /омлет|яичниц|сырник/i, suggestion: 'Яичные и творожные блюда подаются на завтрак' },
      { pattern: /какао/i, suggestion: 'Какао подается на завтрак' },
      { pattern: /кефир|ряженк|йогурт/i, suggestion: 'Кисломолочные продукты подаются в полдник' },
      { pattern: /печень|пряник|вафл/i, suggestion: 'Сладости подаются в полдник' },
      { pattern: /фрукт|ягод/i, suggestion: 'Фрукты подаются в полдник' }
    ];
    
    // Блюда, которые НИКОГДА не должны быть в полднике
    const notForSnack = [
      { pattern: /суп|борщ|щи/i, suggestion: 'Первые блюда подаются в обед' },
      { pattern: /котлет|мясо|рыба|биточк/i, suggestion: 'Мясные и рыбные блюда подаются в обед' },
      { pattern: /пюре|гречк|рис\s+отварн/i, suggestion: 'Гарниры подаются в обед' },
      { pattern: /каша\s+молочн|омлет|сырник/i, suggestion: 'Эти блюда подаются на завтрак' }
    ];
    
    // Проверяем запреты
    if (mealType === 'завтрак') {
      for (const rule of notForBreakfast) {
        if (rule.pattern.test(dishName)) {
          return {
            isValid: false,
            message: `"${dishName}" не подходит для завтрака`,
            suggestion: rule.suggestion
          };
        }
      }
    }
    
    if (mealType === 'обед') {
      for (const rule of notForLunch) {
        if (rule.pattern.test(dishName)) {
          return {
            isValid: false,
            message: `"${dishName}" не подходит для обеда`,
            suggestion: rule.suggestion
          };
        }
      }
    }
    
    if (mealType === 'полдник') {
      for (const rule of notForSnack) {
        if (rule.pattern.test(dishName)) {
          return {
            isValid: false,
            message: `"${dishName}" не подходит для полдника`,
            suggestion: rule.suggestion
          };
        }
      }
    }
    
    return { isValid: true, message: '', suggestion: '' };
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Название блюда *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Например: Каша овсяная"
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Описание
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Например: С молоком и маслом"
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Цена (руб.)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="25"
            min="0"
            step="0.01"
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Вес
          </label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="200г"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Тип питания *
          </label>
          <select
            value={formData.meal_type}
            onChange={(e) => handleChange('meal_type', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            required
          >
            <option value="завтрак">🌅 Завтрак</option>
            <option value="обед">🍽️ Обед</option>
            <option value="полдник">🥛 Полдник</option>
          </select>
        </div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            День недели *
          </label>
          <select
            value={formData.day_of_week}
            onChange={(e) => handleChange('day_of_week', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            required
          >
            <option value="понедельник">Понедельник</option>
            <option value="вторник">Вторник</option>
            <option value="среда">Среда</option>
            <option value="четверг">Четверг</option>
            <option value="пятница">Пятница</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Номер рецепта
        </label>
        <input
          type="text"
          value={formData.recipe_number}
          onChange={(e) => handleChange('recipe_number', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          placeholder="Р-123"
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Отмена
        </button>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✅ Добавить
        </button>
      </div>
    </form>
  );
}
