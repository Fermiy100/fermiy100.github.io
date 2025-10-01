import { useState } from 'react';
import { MenuItem } from '../utils/api';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  showActions?: boolean;
  showBulkSelection?: boolean;
  isBulkSelected?: boolean;
  onBulkSelect?: (id: number) => void;
}

const dayNames = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
const mealTypeNames = {
  'завтрак': 'Завтрак',
  'обед': 'Обед',
  'полдник': 'Полдник',
  'ужин': 'Ужин',
  'дополнительно': 'Доп.'
};

export default function MenuItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  isSelected = false, 
  onSelect,
  showActions = true,
  showBulkSelection = false,
  isBulkSelected = false,
  onBulkSelect
}: MenuItemCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <div 
      className={`menu-item ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div className="menu-item-header">
        <div className="menu-item-name">{item.name}</div>
        <div className="menu-item-price">{item.price} ₽</div>
        {showBulkSelection && onBulkSelect && (
          <input
            type="checkbox"
            checked={isBulkSelected}
            onChange={(e) => {
              e.stopPropagation();
              onBulkSelect(item.id);
            }}
            className="bulk-checkbox"
            title="Выбрать для массовых операций"
          />
        )}
      </div>
      
      {item.description && (
        <div className="menu-item-details">{item.description}</div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <span className="menu-item-portion">
            {dayNames[item.day_of_week]}
          </span>
          <span className="menu-item-portion">
            {mealTypeNames[item.meal_type as keyof typeof mealTypeNames]}
          </span>
          {item.portion && (
            <span className="menu-item-portion">{item.portion}</span>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="btn btn-secondary btn-sm"
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className={`btn btn-sm ${showDeleteConfirm ? 'btn-danger' : 'btn-secondary'}`}
              title={showDeleteConfirm ? 'Подтвердить удаление' : 'Удалить'}
            >
              {showDeleteConfirm ? '🗑️' : '❌'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
