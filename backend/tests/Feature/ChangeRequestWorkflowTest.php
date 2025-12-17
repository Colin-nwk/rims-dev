<?php

namespace Tests\Feature;

use App\Models\ChangeRequest;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ChangeRequestWorkflowTest extends TestCase
{
    // use RefreshDatabase; // Enable if we want fresh DB, but might wipe data I want to keep? 
    // Usually Feature tests use RefreshDatabase. I'll use it to be safe and clean.

    use RefreshDatabase;

    public function test_staff_creation_workflow()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $staffData = [
            'service_no' => 'SVC_TEST_01',
            'surname' => 'Test',
            'first_name' => 'Staff',
            'password' => 'password',
            'assigned_state' => 1,
            'prison' => 1,
            'zone_id' => 1,
            'sex' => 'M',
            'initial_rank' => 'Cpl',
            'present_rank' => 'Cpl',
            'level' => 8,
            'dob' => '1990-01-01',
            'date_of_first_appointment' => '2010-01-01',
            'state_of_origin' => 1,
            'lga' => 1,
            'department' => 'Ops',
            'file_no' => 'F123',
            'duty' => 'Guard',
            'description' => 'Test',
            'status' => 1,
            'details' => [
                'pfa_name' => 'Test PFA',
                'pension_pin' => '12345',
            ],
            'education' => [
                [
                    'institution' => 'Test Uni',
                    'type' => 'BSc',
                    'start_date' => '2008-01-01',
                    'url' => \Illuminate\Http\UploadedFile::fake()->create('degree.pdf', 100)
                ]
            ],
            'photo' => \Illuminate\Http\UploadedFile::fake()->image('photo.jpg')
        ];

        // 1. Store (Submit Request)
        $response = $this->postJson('/api/v1/staff', $staffData);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING');
            
        // Additional Check: Verify request data contains a path string, not a file object (implicit by JSON structure)
        $responseData = $response->json('data.data');
        $this->assertTrue(is_string($responseData['education'][0]['url']), 'URL should be converted to a file path string.');
        $this->assertStringContainsString('SVC_TEST_01_BSc_', $responseData['education'][0]['url']);
        
        $this->assertTrue(is_string($responseData['photo']), 'Photo should be converted to a file path string.');
        $this->assertStringContainsString('SVC_TEST_01_photo_', $responseData['photo']);

        $requestId = $response->json('data.id');

        $this->assertDatabaseHas('change_requests', [
            'id' => $requestId,
            'status' => 'PENDING',
            'model_type' => 'App\Models\Staff',
            'type' => 'CREATE'
        ]);

        $this->assertDatabaseMissing('staff', ['service_no' => 'SVC_TEST_01']);

        // 2. Approve Request
        // Assuming current user can approve
        $approveResponse = $this->postJson("/api/v1/change-requests/{$requestId}/approve");

        $approveResponse->assertStatus(200)
            ->assertJsonPath('data.service_no', 'SVC_TEST_01');

        $this->assertDatabaseHas('change_requests', [
            'id' => $requestId,
            'status' => 'APPROVED'
        ]);

        $this->assertDatabaseHas('staff', ['service_no' => 'SVC_TEST_01']);
        $this->assertDatabaseHas('staff_details', ['service_no' => 'SVC_TEST_01', 'pfa_name' => 'Test PFA']);
        // Education check needs referencing the staff, simpler to check count
        $staff = Staff::where('service_no', 'SVC_TEST_01')->first();
        $this->assertEquals(1, $staff->education()->count());
    }

    public function test_user_creation_workflow()
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        // 1. Store
        $response = $this->postJson('/api/v1/user/users', $userData);

        $response->assertStatus(201);
        $requestId = $response->json('data.id');

        $this->assertDatabaseMissing('users', ['email' => 'newuser@example.com']);

        // 2. Approve
        $this->postJson("/api/v1/change-requests/{$requestId}/approve")
            ->assertStatus(200);

        $this->assertDatabaseHas('change_requests', [
            'id' => $requestId,
            'status' => 'APPROVED'
        ]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }
}
