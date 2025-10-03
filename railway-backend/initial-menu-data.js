// Начальные данные меню для Railway - ВСЕ БЛЮДА ИЗ EXCEL
export const initialMenuData = [
    // ПОНЕДЕЛЬНИК - ЗАВТРАК (15 блюд из Excel)
    {
        name: "Сухие завтраки с молоком",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "225 г",
        recipe_number: "1/6",
        portion: "225 г"
    },
    {
        name: "Оладьи",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "2 шт",
        recipe_number: "11/2",
        portion: "2 шт"
    },
    {
        name: "Молоко сгущенное",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/1",
        portion: "20 г"
    },
    {
        name: "Сметана",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/7",
        portion: "20 г"
    },
    {
        name: "Джем фруктовый",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/5",
        portion: "20 г"
    },
    {
        name: "Мед",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/6",
        portion: "20 г"
    },
    {
        name: "Масло сливочное",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "10 г",
        recipe_number: "18/7",
        portion: "10 г"
    },
    {
        name: "Сыр",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "15 г",
        recipe_number: "18/8",
        portion: "15 г"
    },
    {
        name: "Колбаса вареная",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "18/5",
        portion: "20 г"
    },
    {
        name: "Колбаса в/к",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "18/6",
        portion: "20 г"
    },
    {
        name: "Ветчина",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "18/4",
        portion: "20 г"
    },
    {
        name: "Хлеб из пшеничной муки",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "17/1",
        portion: "20 г"
    },
    {
        name: "Чай с сахаром",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "200 г",
        recipe_number: "12/2",
        portion: "200 г"
    },
    {
        name: "Чай с молоком",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "200 г",
        recipe_number: "12/3",
        portion: "200 г"
    },
    {
        name: "Какао с молоком",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "200 г",
        recipe_number: "12/4",
        portion: "200 г"
    }
];

console.log('🎉 Начальные данные меню загружены!');
console.log(`🍽️ Всего блюд: ${initialMenuData.length}`);
console.log(`🌅 Завтрак понедельник: ${initialMenuData.filter(d => d.meal_type === 'завтрак' && d.day_of_week === 1).length} блюд`);
