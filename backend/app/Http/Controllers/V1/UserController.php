<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ChangeRequestService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    use ApiResponseTrait;

    protected $changeRequestService;

    protected $userService;

    public function __construct(
        ChangeRequestService $changeRequestService,
        \App\Services\UserService $userService
    ) {
        $this->changeRequestService = $changeRequestService;
        $this->userService = $userService;
    }

    public function index(Request $request)
    {
        $users = $this->userService->all($request->all());

        return $this->collectionResponse($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $data = $request->all();

            $changeRequest = $this->changeRequestService->submit(
                'App\Models\User',
                'CREATE',
                $data,
                $request->user()
            );

            return $this->successResponse($changeRequest, 'User creation request submitted for approval.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function show(User $user)
    {
        return $user->load('roles');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class.',email,'.$user->id],
        ]);

        try {
            $data = $request->all();

            $changeRequest = $this->changeRequestService->submit(
                'App\Models\User',
                'UPDATE',
                $data,
                $request->user(),
                null,
                $user->id
            );

            return $this->successResponse($changeRequest, 'User update request submitted for approval.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->noContent();
    }

    public function assignRole(Request $request, User $user)
    {
        $this->authorize('user.edit');
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->assignRole($request->role_id);

        return $this->successResponse($user->load('roles'), 'Role assigned successfully');
    }

    public function removeRole(User $user, $roleId)
    {
        $this->authorize('user.edit');
        $user->removeRole($roleId);

        return $this->successResponse($user->load('roles'), 'Role removed successfully');
    }
}
