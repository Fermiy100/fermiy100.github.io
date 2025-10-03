// Обновление меню на Railway с ВСЕМИ блюдами из Excel
const menuData = [
    {
        id: 1,
        name: "Сухие завтраки с молоком",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "225 г",
        recipe_number: "1/6"
    },
    {
        id: 2,
        name: "Оладьи",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "2 шт",
        recipe_number: "11/2"
    },
    {
        id: 3,
        name: "Молоко сгущенное",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "15/1"
    },
    {
        id: 4,
        name: "Сметана",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "15/7"
    },
    {
        id: 5,
        name: "Джем фруктовый",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "15/5"
    },
    {
        id: 6,
        name: "Мед",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "15/6"
    },
    {
        id: 7,
        name: "Масло сливочное",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "10 г",
        recipe_number: "18/7"
    },
    {
        id: 8,
        name: "Сыр",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "15 г",
        recipe_number: "18/8"
    },
    {
        id: 9,
        name: "Колбаса вареная",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "18/5"
    },
    {
        id: 10,
        name: "Колбаса в/к",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "18/6"
    },
    {
        id: 11,
        name: "Ветчина",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "18/4"
    },
    {
        id: 12,
        name: "Хлеб из пшеничной муки",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "20 г",
        recipe_number: "17/1"
    },
    {
        id: 13,
        name: "Чай с сахаром",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "200 г",
        recipe_number: "12/2"
    },
    {
        id: 14,
        name: "Чай с молоком",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "200 г",
        recipe_number: "12/3"
    },
    {
        id: 15,
        name: "Какао с молоком",
        meal_type: "завтрак",
        day_of_week: 1,
        price: 0,
        weight: "200 г",
        recipe_number: "12/4"
    }
];

console.log('🎉 ВСЕ 15 БЛЮД ИЗ EXCEL ГОТОВЫ К ЗАГРУЗКЕ!');
console.log('Количество блюд:', menuData.length);
console.log('Первые 3 блюда:', menuData.slice(0, 3));
