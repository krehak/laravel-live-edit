<?php

namespace Krehak\LiveEdit;

use Krehak\LiveEdit\Commands\LiveEditFlush;
use Krehak\LiveEdit\Helpers\LiveEdit;
use Krehak\LiveEdit\Middleware\LiveEditPrivateMiddleware;
use Krehak\LiveEdit\Middleware\LiveEditPublicMiddleware;
use Illuminate\Contracts\Cache\Factory as CacheFactory;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class LiveEditServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @param CacheFactory $cache
     * @param Router $router
     * @return void
     */
    public function boot(CacheFactory $cache, Router $router)
    {
        $this->loadMigrationsFrom(__DIR__ . '/migrations');
        $this->registerMiddleware(LiveEditPublicMiddleware::class);

        $this->publishes([
            __DIR__ . '/config/live-edit.php' => config_path('live-edit.php'),
        ]);

        require __DIR__ . '/Helpers/functions.php';

        if(!$this->app->routesAreCached()) {
            $router->group(
                [
                    'namespace' => 'Krehak\\LiveEdit\\Controllers',
                    'middleware' => ['web', LiveEditPrivateMiddleware::class],
                    'prefix' => 'live-edit'
                ],
                function() {
                    require __DIR__ . '/routes/live-edit.php';
                });
        }

        LiveEdit::setCache($cache);

        $this->registerDirectives();
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->commands([
            LiveEditFlush::class
        ]);
    }

    /**
     * Register the middleware
     *
     * @param  string $middleware
     */
    protected function registerMiddleware($middleware)
    {
        $kernel = $this->app[Kernel::class];
        $kernel->pushMiddleware($middleware);
    }

    /**
     * Register directives
     */
    private function registerDirectives()
    {
        Blade::directive('live_edit', function($expression) {
            $params = json_decode('[' . str_replace("'", '"', $expression) . ']');

            $key = @$params[0] ?: null;
            $default = @$params[1] ?: null;
            $tag = @$params[2] ?: 'span';

            return live_edit($key, $default, $tag);
        });
    }
}
