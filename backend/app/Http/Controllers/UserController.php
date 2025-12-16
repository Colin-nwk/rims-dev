<?php

namespace App\Http\Controllers;

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

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = $this->userService->all($request->all());
        return $this->collectionResponse($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $data = $request->all(); // Or specific fields

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

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return $user;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class.',email,'.$user->id],
            // Password update logic if needed
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}
