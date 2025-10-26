<?php
/**
 * School Meals App - Main Entry Point
 * Optimized for fermiy.ru hosting
 * Version: 2.0 - Production Ready
 */

// Security headers
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CORS headers for API requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: https://fermiy.ru');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit();
}

// Set CORS for API requests
if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    header('Access-Control-Allow-Origin: https://fermiy.ru');
    header('Access-Control-Allow-Credentials: true');
}

// Check if this is an API request
if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    // Handle API requests
    $apiPath = substr($_SERVER['REQUEST_URI'], 4); // Remove '/api' prefix
    
    // Route API requests
    switch ($apiPath) {
        case 'health':
        case 'health/':
            include 'api/health.php';
            break;
        case 'auth/login':
        case 'auth/login/':
            include 'api/auth/login.php';
            break;
        case 'auth/me':
        case 'auth/me/':
            include 'api/auth/me.php';
            break;
        case 'users':
        case 'users/':
            include 'api/users.php';
            break;
        case 'users/create':
        case 'users/create/':
            include 'api/users/create.php';
            break;
        case 'menu':
        case 'menu/':
            include 'api/menu.php';
            break;
        case 'menu/add':
        case 'menu/add/':
            include 'api/menu/add.php';
            break;
        case 'menu/upload':
        case 'menu/upload/':
            include 'api/menu/upload.php';
            break;
        case 'menu/clear':
        case 'menu/clear/':
            include 'api/menu/clear.php';
            break;
        case 'orders':
        case 'orders/':
            include 'api/orders.php';
            break;
        case 'orders/index':
        case 'orders/index/':
            include 'api/orders/index.php';
            break;
        default:
            // Check for dynamic routes
            if (preg_match('/^users\/(\d+)\/verify/', $apiPath, $matches)) {
                $_GET['user_id'] = $matches[1];
                include 'api/users/verify.php';
            } elseif (preg_match('/^users\/(\d+)\/delete/', $apiPath, $matches)) {
                $_GET['user_id'] = $matches[1];
                include 'api/users/delete.php';
            } elseif (preg_match('/^menu\/(\d+)\/delete/', $apiPath, $matches)) {
                $_GET['id'] = $matches[1];
                include 'api/menu/delete.php';
            } elseif (preg_match('/^school\/(\d+)/', $apiPath, $matches)) {
                $_GET['id'] = $matches[1];
                include 'api/school/1.php';
            } else {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'API endpoint not found'], JSON_UNESCAPED_UNICODE);
            }
            break;
    }
    exit();
}

// Serve React app for all other requests
?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/logo-bf48ba68-4d32ac02-4d32ac02.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🍽️ Школьное питание - Система заказа питания</title>
    <meta name="description" content="Современная система заказа школьного питания с удобным интерфейсом для родителей и директоров" />
    <meta name="keywords" content="школьное питание, заказ еды, школьная столовая, питание детей" />
    
    <!-- Open Graph мета-теги -->
    <meta property="og:title" content="🍽️ Школьное питание" />
    <meta property="og:description" content="Система заказа школьного питания" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://fermiy.ru" />
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/assets/index-a7cac036.js" as="script" />
    <link rel="preload" href="/assets/index-924301c3.css" as="style" />
    
    <!-- Стили для загрузки -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: #f8f9fa;
            min-height: 100vh;
        }
        
        /* Мобильные стили */
        @media (max-width: 768px) {
            body {
                font-size: 16px;
                line-height: 1.5;
            }
            
            #root {
                width: 100vw;
                min-height: 100vh;
            }
            
            /* Улучшаем touch-взаимодействия */
            button, input, select, textarea {
                min-height: 44px;
                font-size: 16px;
            }
            
            /* Оптимизируем для мобильных */
            .container {
                width: 100vw;
                min-height: 100vh;
                padding: 10px;
                margin: 0;
            }
            
            /* Убираем горизонтальную прокрутку */
            * {
                max-width: 100%;
            }
        }
        
        @media (max-width: 480px) {
            body {
                font-size: 14px;
            }
            
            .container {
                padding: 5px;
            }
        }
        
        #root {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .loading-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
            text-align: center;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(0,0,0,0.1);
            border-top: 5px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    
    <!-- Load CSS -->
    <link rel="stylesheet" href="/assets/index-924301c3.css">
</head>
<body>
    <div id="root">
        <div class="loading-screen">
            <div>
                <div class="loading-spinner"></div>
                <p>Загрузка приложения...</p>
            </div>
        </div>
    </div>
    
    <!-- Load JavaScript -->
    <script type="module" crossorigin src="/assets/index-a7cac036.js"></script>
    
    <!-- Service Worker for PWA -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    </script>
</body>
</html>