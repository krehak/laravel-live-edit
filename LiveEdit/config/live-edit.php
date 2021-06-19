<?php

return [
    'auth' => function() {
        return auth()->check(); // Use your own guard, or authentication
    },
    'fallback_locale' => config('app.fallback_locale'),
    'cache_lifetime' => 3600, // Note: set null for no cache (not recommended)
];
