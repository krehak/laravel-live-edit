<?php

namespace Krehak\LiveEdit\Middleware;

use Krehak\LiveEdit\Helpers\LiveEdit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LiveEditPublicMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if($response instanceof Response) $this->output($response);

        return $response;
    }

    private function output(Response $response)
    {
        if(stripos($response->headers->get('Content-Type'), 'text/html') !== 0 || $response->isRedirection() || !LiveEdit::check()) {
            return;
        }

        $content = $response->getContent();
        $pos = strripos($content, '</body>');

        $styles = LiveEdit::getStyles();
        $scriptConfig = LiveEdit::getScriptConfig();
        $scripts = LiveEdit::getScripts();

        if(false !== $pos) {
            $content = substr($content, 0, $pos) . $styles . PHP_EOL . $scriptConfig . PHP_EOL . $scripts . substr($content, $pos);
        } else {
            $content = $content . $styles . PHP_EOL . $scriptConfig . PHP_EOL . $scripts;
        }

        $response->setContent($content);

        $response->headers->remove('Content-Length');
    }
}
