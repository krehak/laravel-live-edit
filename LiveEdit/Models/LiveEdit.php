<?php

namespace Krehak\LiveEdit\Models;

use Illuminate\Database\Eloquent\Model;

class LiveEdit extends Model
{
    protected $fillable = ['key', 'content', 'locale'];
}
