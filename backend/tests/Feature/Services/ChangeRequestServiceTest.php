<?php

namespace Tests\Feature\Services;

use App\Models\ChangeRequest;
use App\Models\Staff;
use App\Models\User;
use App\Services\ChangeRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChangeRequestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $changeRequestService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->changeRequestService = app(ChangeRequestService::class);
    }

    public function test_it_can_submit_request()
    {
        $user = User::factory()->create();
        $data = ['name' => 'Test'];

        $request = $this->changeRequestService->submit(
            Staff::class,
            'CREATE',
            $data,
            $user,
            'SVC001'
        );

        $this->assertDatabaseHas('change_requests', [
            'model_type' => Staff::class,
            'type' => 'CREATE',
            'status' => 'PENDING',
            'service_no' => 'SVC001',
        ]);
        $this->assertEquals($data, $request->data);
    }

    public function test_it_can_find_pending_request()
    {
        // Using factory with explicit nulls to ensure FK constraints don't fail in SQLite test env
        $cr = ChangeRequest::factory()->create([
            'status' => 'PENDING',
            'requested_by_id' => null,
            'requested_by_type' => null,
            'approved_by' => null,
        ]);

        $found = $this->changeRequestService->find($cr->id);
        $this->assertEquals($cr->id, $found->id);
    }

    public function test_it_can_reject_request()
    {
        $user = User::factory()->create();
        $cr = ChangeRequest::factory()->create([
            'status' => 'PENDING',
            'requested_by_id' => $user->id,
            'requested_by_type' => User::class,
            'approved_by' => null,
        ]);

        $rejected = $this->changeRequestService->reject($cr->id, $user, 'Invalid Data');

        $this->assertEquals('REJECTED', $rejected->status);
        $this->assertEquals('Invalid Data', $rejected->rejection_reason);
        $this->assertEquals($user->id, $rejected->approved_by);
    }

    public function test_it_can_approve_create_request_and_execute_logic()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        $data = [
            'service_no' => 'SVC_APP_01',
            'surname' => 'Approved',
            'first_name' => 'Staff',
            'password' => 'password',
            'assigned_state' => 1,
            'prison' => 1,
            'status' => 1,
        ];

        // 1. Submit
        $request = $this->changeRequestService->submit(
            Staff::class,
            'CREATE',
            $data,
            $user,
            'SVC_APP_01'
        );

        // 2. Approve
        $this->changeRequestService->approve($request->id, $admin);

        // 3. Verify Request Status
        $request->refresh();
        $this->assertEquals('APPROVED', $request->status);
        $this->assertEquals($admin->id, $request->approved_by);

        // 4. Verify Staff Created
        $this->assertDatabaseHas('staff', [
            'service_no' => 'SVC_APP_01',
            'surname' => 'Approved',
        ]);
    }

    public function test_it_can_approve_update_request_and_execute_logic()
    {
        // Setup existing staff
        $staff = Staff::factory()->create(['service_no' => 'SVC_UPD_01', 'surname' => 'OldName']);
        $user = User::factory()->create();
        $admin = User::factory()->create();

        $data = ['surname' => 'NewName'];

        // 1. Submit Update
        $request = $this->changeRequestService->submit(
            Staff::class,
            'UPDATE',
            $data,
            $user,
            'SVC_UPD_01',
            $staff->id
        );

        // 2. Approve
        $this->changeRequestService->approve($request->id, $admin);

        // 3. Verify Staff Updated
        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'surname' => 'NewName',
        ]);
    }
}
