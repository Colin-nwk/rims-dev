<?php

namespace Tests\Feature\Services;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = app(UserService::class);
    }

    public function test_it_can_create_user()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'secret123',
        ];

        $user = $this->userService->create($data);

        $this->assertInstanceOf(User::class, $user);
        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
        $this->assertTrue(Hash::check('secret123', $user->password));
    }

    public function test_it_can_update_user_without_password()
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $updatedUser = $this->userService->update($user->id, ['name' => 'New Name']);

        $this->assertEquals('New Name', $updatedUser->name);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_it_can_update_user_password()
    {
        $user = User::factory()->create(['password' => Hash::make('oldpassword')]);

        $this->userService->update($user->id, ['password' => 'newpassword']);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword', $user->password));
    }

    public function test_it_can_filter_users()
    {
        User::factory()->create(['email' => 'a@test.com']);
        User::factory()->create(['email' => 'b@test.com']);

        $results = $this->userService->all(['search' => 'a@test']);

        $this->assertCount(1, $results);
        $this->assertEquals('a@test.com', $results->first()->email);
    }
}
