<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StaffAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'password' => 'required|string',
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! \Illuminate\Support\Facades\Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $token = $staff->createToken('staff_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff,
        ]);
    }

    public function stateLogin(Request $request)
    {
        $request->validate([
            'service_no' => 'required|string',
            'password' => 'required|string',
            'state' => 'required|string', // Assuming state is passed as a string/ID matching assigned_state or similar logic
        ]);

        $staff = \App\Models\Staff::where('service_no', $request->service_no)->first();

        if (! $staff || ! \Illuminate\Support\Facades\Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        // Verify State
        // Assuming 'assigned_state' in DB is an ID, and user passes ID. Alternatively, we might need to resolve state name.
        // For now, I will assume exact match on the column 'assigned_state'.
        if ($staff->assigned_state != $request->state) {
            return response()->json([
                'message' => 'You are not assigned to this state'
            ], 403);
        }

        $token = $staff->createToken('staff_state_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $staff,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }
}
