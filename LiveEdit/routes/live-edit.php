<?php

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Krehak\LiveEdit\Controllers\LiveEditController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::post('/update-{locale}', function(LiveEditController $liveEditController, $locale) {
    App::setLocale($locale);

    return $liveEditController->update();
})->name('live_edit.update');
