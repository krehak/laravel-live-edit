<?php

use Krehak\LiveEdit\Helpers\LiveEdit;

function live_edit($key, $default = null, $tag = 'span') {
    return LiveEdit::get($key, $default, $tag);
}
