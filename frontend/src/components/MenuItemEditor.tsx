import { useState } from 'react';
import { MenuItem } from '../utils/api';

interface MenuItemEditorProps {
  item?: MenuItem;
  onSave: (data: Omit<MenuItem, 'id' | 'school_id' | 'week_start'>) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const daysOfWeek = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' }
];

const mealTypes = [
  { value: 'завтрак', label: 'Завтрак' },
  { value: 'обед', label: 'Обед' },
  { value: 'полдник', label: 'Полдник' },
  { value: 'ужин', label: 'Ужин' },
  { value: 'дополнительно', label: 'Дополнительно' }
];

export default function MenuItemEditor({ item, onSave, onCancel, isEditing = false }: MenuItemEditorProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    meal_type: item?.meal_type || 'обед',
    day_of_week: item?.day_of_week || 1,
    portion: item?.portion || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {isEditing ? 'Редактировать блюдо' : 'Добавить блюдо'}
        </h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Название блюда *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Например: Борщ с мясом"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание</label>
            <input
              type="text"
              className="input"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Например: С говядиной и сметаной"
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Цена (₽) *</label>
              <input
                type="number"
                className="input"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Порция</label>
              <input
                type="text"
                className="input"
                value={formData.portion}
                onChange={(e) => handleChange('portion', e.target.value)}
                placeholder="Например: 250г"
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">День недели *</label>
              <select
                className="select"
                value={formData.day_of_week}
                onChange={(e) => handleChange('day_of_week', parseInt(e.target.value))}
                required
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Тип питания *</label>
              <select
                className="select"
                value={formData.meal_type}
                onChange={(e) => handleChange('meal_type', e.target.value)}
                required
              >
                {mealTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Сохранение...
                </>
              ) : (
                isEditing ? 'Сохранить изменения' : 'Добавить блюдо'
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
