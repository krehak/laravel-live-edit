<?php

namespace Krehak\LiveEdit\Controllers;

use Krehak\LiveEdit\Helpers\LiveEdit;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class LiveEditController extends BaseController {
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function update() {
        if(
            !request()->get('key') ||
            !request()->get('content')
        ) {
            return response()->json([
                'success' => false
            ], 200);
        }

        $updated = LiveEdit::set(
            request()->get('key'),
            request()->get('content')
        );

        return response()->json([
            'success' => $updated
        ], 200);
    }
}
