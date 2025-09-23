@echo off
echo Загружаем приложение на GitHub...

REM Инициализируем git
git init

REM Добавляем все файлы
git add .

REM Делаем первый коммит
git commit -m "Initial commit - School Meals App"

REM Переименовываем ветку в main
git branch -M main

REM Добавляем удаленный репозиторий (замените YOUR_USERNAME на ваш GitHub username)
echo Введите ваш GitHub username:
set /p username=
git remote add origin https://github.com/%username%/school-meals-app.git

REM Загружаем код
git push -u origin main

echo Готово! Ваше приложение будет доступно по адресу:
echo https://%username%.github.io/school-meals-app
pause
