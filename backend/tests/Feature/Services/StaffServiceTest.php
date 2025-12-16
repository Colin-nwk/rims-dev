<?php

namespace Tests\Feature\Services;

use App\Models\Staff;
use App\Models\StaffDetail;
use App\Models\StaffEducation;
use App\Models\User;
use App\Services\StaffService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $staffService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->staffService = app(StaffService::class);
    }

    public function test_it_can_create_staff_with_relations()
    {
        $data = [
            'service_no' => 'SVC123',
            'surname' => 'Doe',
            'first_name' => 'John',
            'email' => 'john@example.com',
            'password' => 'secret',
            'status' => 1,
            'details' => [
                'pfa_name' => 'Test PFA',
                'pension_pin' => 'PIN123',
            ],
            'education' => [
                [
                    'institution' => 'Test Uni',
                    'type' => 'BSc',
                    'start_date' => '2010-01-01',
                    'url' => 'uploads/degree.pdf'
                ]
            ]
        ];

        $staff = $this->staffService->create($data);

        $this->assertInstanceOf(Staff::class, $staff);
        $this->assertDatabaseHas('staff', ['service_no' => 'SVC123', 'surname' => 'Doe']);
        $this->assertDatabaseHas('staff_details', ['service_no' => 'SVC123', 'pfa_name' => 'Test PFA']);
        $this->assertDatabaseHas('staff_education', ['service_no' => 'SVC123', 'type' => 'BSc']);
    }

    public function test_it_can_update_staff_and_relations()
    {
        // Setup
        $staff = Staff::factory()->create(['service_no' => 'SVC123', 'surname' => 'OldName']);
        StaffDetail::factory()->create(['service_no' => 'SVC123', 'pfa_name' => 'Old PFA']);
        StaffEducation::factory()->create(['service_no' => 'SVC123', 'type' => 'OldDegree']);

        $updateData = [
            'surname' => 'NewName',
            'details' => [
                'pfa_name' => 'New PFA'
            ]
        ];

        $updatedStaff = $this->staffService->update($staff->id, $updateData);

        $this->assertEquals('NewName', $updatedStaff->surname);
        $this->assertDatabaseHas('staff', ['id' => $staff->id, 'surname' => 'NewName']);
        $this->assertDatabaseHas('staff_details', ['service_no' => 'SVC123', 'pfa_name' => 'New PFA']);
    }

    public function test_it_can_list_staff_with_filters()
    {
        Staff::factory()->create(['service_no' => 'A1', 'surname' => 'Alpha']);
        Staff::factory()->create(['service_no' => 'B2', 'surname' => 'Beta']);

        $results = $this->staffService->all(['search' => 'Alpha']);

        $this->assertCount(1, $results);
        $this->assertEquals('A1', $results->first()->service_no);
    }
}
