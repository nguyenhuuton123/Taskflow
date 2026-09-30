<?php

// Dùng Bearer token (Sanctum, không phải cookie), nên cho phép mọi nguồn gốc là an toàn:
// không có cookie/credential nào bị lộ qua CORS ở đây.
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
