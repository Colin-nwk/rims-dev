<?php

namespace App\Http\Middleware;

use App\Models\Staff;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAuthenticatedAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $isInactiveStaff = $user instanceof Staff && $user->status != 1;
        $isInactiveUser = $user instanceof User && $user->status !== 'active';

        if ($isInactiveStaff || $isInactiveUser) {
            return response()->json([
                'status' => 'Error',
                'message' => 'Account is deactivated',
            ], 403);
        }

        return $next($request);
    }
}
