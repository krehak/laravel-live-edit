| Table of contents |
|-----------------|
| 1. Requirements |
| 2. Installation |
| 3. Config        |
| 4. Usage        |
| 5. Cache        |

## 1. Requirements
| | Version |
|---|---|
| PHP | 8.0 |
| Laravel | 8+ |

## 2. Installation
```shell script
composer require krehak/laravel-live-edit
```

Add the service provider in your `config/app.php` file:
```php
'providers' => [
    // ...
    Krehak\LiveEdit\LiveEditServiceProvider::class,
];
```

You should publish the `config/live-edit.php` config file with:
```shell script
php artisan vendor:publish --provider="Krehak\LiveEdit\LiveEditServiceProvider"
```

Run the migrations for this package:
```shell script
php artisan migrate
```

## 3. Config
Config contains 3 simple options:

### auth
This should be a callable function, which returns true/false value whenever to use this package. When true, your texts will be editable asynchronously. When false, none of the scripts and styles will be embeded so it is resource friendly.

### fallback_locale
This package is multilingual. When your text has various translations and one of the translations is missing (for example `es`), this determines which language will be used as a default fallback.

### cache_lifetime
This package uses Laravel's cache system, so your database will be saved against tons of requests (since you can have a lot of translatable text within a single page).

## 4. Usage
_Note: LiveEdit will wrap your text inside the element (specified bellow). So, make sure it will not break your design. You can customize element's tag._

These parameters ar available:
```php
live_edit(key, default, tag)
```
- **key** is your unique identifier (required)
- **default** is your default text, when none is provided yet (default: null)
- **tag** which element will wrap the text. It is possible to set tag to "null" but then it won't be usable for live editing on your site, but can be handy to use programmatically (default: 'span')

### As a helper
```blade
<p>
    {!! live_edit('text_1', 'Some new text') !!}
</p>
```

### As a directive
```blade
<h1>@live_edit('title_1', 'My title')</h1>
```

### Programmatically (for example: in your controller)
_(Tag attribute must be `null`)_

```php
use Krehak\LiveEdit\Helpers\LiveEdit;

LiveEdit::get('text_2', 'Completely different text', null);
```

You can also programmatically set the text. It will set your application's locale (`App::getLocale()`):
```php
use Krehak\LiveEdit\Helpers\LiveEdit;

LiveEdit::set('text_2', 'Change this text');
```

## 5. Cache
Your can clear LiveEdit's cache easily with artisan command:
```shell script
php artisan live-edit:flush
```

Or programatically:
```php
use Krehak\LiveEdit\Helpers\LiveEdit;

LiveEdit::flushCache();
```
