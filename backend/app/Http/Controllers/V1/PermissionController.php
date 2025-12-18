<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $permissions = Permission::all();
        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }
}
