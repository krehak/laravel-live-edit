<?php

namespace Krehak\LiveEdit\Middleware;

use Krehak\LiveEdit\Helpers\LiveEdit;
use Closure;
use Illuminate\Http\Request;

class LiveEditPrivateMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        abort_if(!LiveEdit::check(), 403);

        return $next($request);
    }
}
