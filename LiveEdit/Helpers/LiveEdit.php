<?php

namespace Krehak\LiveEdit\Helpers;

use Krehak\LiveEdit\Models\LiveEdit as LiveEditModel;
use Illuminate\Contracts\Cache\Factory as CacheFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\App;

class LiveEdit {
    private static $cache;
    private static $data;
    private static $fetched = false;

    public static function check() {
        return config('live-edit.auth')();
    }

    public static function get($key, $default = null, $tag = 'span') {
        self::checkFetchedData();

        if(!(self::$data instanceof Collection)) {
            return self::formatHtml($tag, $key, $default);
        }

        $record = self::$data->where('key', $key)
            ->where('locale', App::getLocale())
            ->first();

        if(is_null($record) && App::getLocale() !== config('live-edit.fallback_locale')) {
            $record = self::$data->where('key', $key)
                ->where('locale', config('live-edit.fallback_locale'))
                ->first();
        }

        $content = !is_null($record) ? $record->content : $default;

        return self::formatHtml($tag, $key, $content);
    }

    public static function set($key, $content = null) {
        if(!Schema::hasTable('live_edits')) return;

        $record = LiveEditModel::where('key', $key)
            ->where('locale', App::getLocale())
            ->first();


        if(is_null($record)) {
            $record = LiveEditModel::create([
                'key' => $key,
                'locale' => App::getLocale(),
            ]);
        }

        $record->content = str_replace(['<', '>'], ['&lt;', '&gt;'], $content);
        $record->save();

        self::flushCache();

        return true;
    }

    private static function checkFetchedData() {
        if(!self::$fetched) {
            self::prefetchData();
            self::$fetched = true;
        }
    }

    public static function setCache(CacheFactory $cache) {
        self::$cache = $cache;
    }

    public static function prefetchData() {
        if(!Schema::hasTable('live_edits')) return;

        if(is_null(config('live-edit.cache_lifetime'))) {
            self::$data = self::getDataGenerator()();
        } else {
            self::$data = self::$cache->remember('live_edits_prefetch', config('live-edit.cache_lifetime'), self::getDataGenerator());
        }
    }

    public static function flushCache() {
        return self::$cache->flush('live_edits_prefetch');
    }

    private static function formatHtml($tag, $key, $content) {
        if(is_null($tag)) return $content;

        $attrs = self::check() ? "data-live-edit='{$key}'" : '';

        return "<{$tag} {$attrs}>{$content}</{$tag}>";
    }

    private static function getDataGenerator() {
        return function() {
            return LiveEditModel::where('locale', App::getLocale())
                ->orWhere('locale', config('live-edit.fallback_locale'))
                ->get();
        };
    }

    public static function getStyles() {
        $styles = glob(__DIR__ . '/../resources/dist/*.{css}', GLOB_BRACE);

        if(empty($styles)) return '';

        $contents_of_all = array_map(function($stylePath) {
            return '<style>' . file_get_contents($stylePath) . '</style>';
        }, $styles);

        return implode(PHP_EOL, $contents_of_all);
    }

    public static function getScriptConfig() {
        return '<script>
                    window.live_edit_update_url = "' . route('live_edit.update', ['locale' => App::getLocale()]) . '";
                    window.live_edit_csrf_token = "' . csrf_token() . '";
                </script>';
    }

    public static function getScripts() {
        $scripts = glob(__DIR__ . '/../resources/dist/*.{js}', GLOB_BRACE);

        if(empty($scripts)) return '';

        $contents_of_all = array_map(function($scriptPath) {
            return '<script>' . file_get_contents($scriptPath) . '</script>';
        }, $scripts);

        return implode(PHP_EOL, $contents_of_all);
    }
}
