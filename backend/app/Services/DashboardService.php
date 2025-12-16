<?php

namespace App\Services;

use App\Models\ChangeRequest;
use App\Models\Prison;
use App\Models\Staff;
use App\Models\State;
use App\Models\User;
use App\Models\Zone;

class DashboardService
{
    public function getStats(): array
    {
        return [
            'staff' => [
                'total' => Staff::count(),
                'active' => Staff::where('status', 1)->count(),
            ],
            'users' => [
                'total' => User::count(),
            ],
            'change_requests' => [
                'total' => ChangeRequest::count(),
                'pending' => ChangeRequest::where('status', 'PENDING')->count(),
                'approved' => ChangeRequest::where('status', 'APPROVED')->count(),
                'rejected' => ChangeRequest::where('status', 'REJECTED')->count(),
            ],
            'zones' => Zone::count(),
            'states' => State::count(),
            'prisons' => Prison::count(),
        ];
    }
}
