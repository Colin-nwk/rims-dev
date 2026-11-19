<?php

namespace Tests\Unit;

use App\Models\Staff;
use App\Models\StaffPosting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffPostingTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_valid_posting()
    {
        $posting = StaffPosting::factory()->create();

        $this->assertNotNull($posting->service_no);
        $this->assertNotNull($posting->type);
        $this->assertNotNull($posting->station_name);
        $this->assertNotNull($posting->start_date);
        $this->assertNotNull($posting->status);
    }

    public function test_factory_can_create_farm_center_posting()
    {
        $posting = StaffPosting::factory()->farmCenter()->create();

        $this->assertEquals('farm_center', $posting->type);
        $this->assertStringContainsString('Farm Center', $posting->station_name);
    }

    public function test_factory_can_create_training_school_posting()
    {
        $posting = StaffPosting::factory()->trainingSchool()->create();

        $this->assertEquals('training_school', $posting->type);
        $this->assertStringContainsString('Training School', $posting->station_name);
    }

    public function test_factory_can_create_completed_posting()
    {
        $posting = StaffPosting::factory()->completed()->create();

        $this->assertEquals('completed', $posting->status);
        $this->assertNotNull($posting->end_date);
    }

    public function test_factory_can_create_terminated_posting()
    {
        $posting = StaffPosting::factory()->terminated()->create();

        $this->assertEquals('terminated', $posting->status);
        $this->assertNotNull($posting->end_date);
    }

    public function test_is_currently_active_returns_true_for_active_posting_without_end_date()
    {
        $posting = StaffPosting::factory()->active()->create([
            'end_date' => null,
        ]);

        $this->assertTrue($posting->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_true_for_active_posting_with_future_end_date()
    {
        $posting = StaffPosting::factory()->active()->create([
            'end_date' => now()->addMonths(6),
        ]);

        $this->assertTrue($posting->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_for_completed_posting()
    {
        $posting = StaffPosting::factory()->completed()->create();

        $this->assertFalse($posting->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_for_terminated_posting()
    {
        $posting = StaffPosting::factory()->terminated()->create();

        $this->assertFalse($posting->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_for_active_posting_with_past_end_date()
    {
        $posting = StaffPosting::factory()->active()->create([
            'end_date' => now()->subMonths(1),
        ]);

        $this->assertFalse($posting->isCurrentlyActive());
    }

    public function test_type_label_returns_farm_center_for_farm_center_type()
    {
        $posting = StaffPosting::factory()->farmCenter()->create();

        $this->assertEquals('Farm Center', $posting->type_label);
    }

    public function test_type_label_returns_training_school_for_training_school_type()
    {
        $posting = StaffPosting::factory()->trainingSchool()->create();

        $this->assertEquals('Training School', $posting->type_label);
    }

    public function test_type_label_returns_other_for_other_type()
    {
        $posting = StaffPosting::factory()->create(['type' => 'other']);

        $this->assertEquals('Other', $posting->type_label);
    }

    public function test_type_label_formats_custom_type()
    {
        $posting = StaffPosting::factory()->create(['type' => 'special_assignment']);

        $this->assertEquals('Special assignment', $posting->type_label);
    }

    public function test_staff_relationship_returns_correct_staff()
    {
        $staff = Staff::factory()->create();
        $posting = StaffPosting::factory()->create(['service_no' => $staff->service_no]);

        $this->assertEquals($staff->service_no, $posting->staff->service_no);
        $this->assertEquals($staff->surname, $posting->staff->surname);
    }

    public function test_creator_relationship_returns_correct_user()
    {
        $creator = \App\Models\User::factory()->create();
        $posting = new StaffPosting([
            'service_no' => \App\Models\Staff::factory()->create()->service_no,
            'type' => 'farm_center',
            'station_name' => 'Test Station',
            'start_date' => '2024-01-01',
            'status' => 'active',
            'created_by_type' => get_class($creator),
            'created_by_id' => $creator->id,
        ]);
        $posting->save();

        // Verify the data was saved correctly
        $this->assertEquals('App\Models\User', $posting->created_by_type);
        $this->assertEquals($creator->id, $posting->created_by_id);

        // Load the relationship explicitly
        $posting->load('creator');
        $this->assertNotNull($posting->creator);
        $this->assertEquals($creator->id, $posting->creator->id);
    }

    public function test_active_scope_filters_active_postings()
    {
        $activePosting = StaffPosting::factory()->active()->create();
        $completedPosting = StaffPosting::factory()->completed()->create();

        $activePostings = StaffPosting::active()->get();

        $this->assertTrue($activePostings->contains($activePosting));
        $this->assertFalse($activePostings->contains($completedPosting));
    }

    public function test_of_type_scope_filters_by_type()
    {
        $farmPosting = StaffPosting::factory()->farmCenter()->create();
        $schoolPosting = StaffPosting::factory()->trainingSchool()->create();

        $farmPostings = StaffPosting::ofType('farm_center')->get();

        $this->assertTrue($farmPostings->contains($farmPosting));
        $this->assertFalse($farmPostings->contains($schoolPosting));
    }

    public function test_fillable_attributes()
    {
        $posting = new StaffPosting;

        $expected = [
            'service_no',
            'type',
            'station_name',
            'station_location',
            'start_date',
            'end_date',
            'status',
            'reason',
            'remarks',
            'created_by_type',
            'created_by_id',
        ];

        $this->assertEqualsCanonicalizing($expected, $posting->getFillable());
    }

    public function test_dates_are_casted_correctly()
    {
        $posting = StaffPosting::factory()->create([
            'start_date' => '2024-01-15',
            'end_date' => '2024-06-30',
        ]);

        $this->assertInstanceOf(\DateTime::class, $posting->start_date);
        $this->assertInstanceOf(\DateTime::class, $posting->end_date);
        $this->assertEquals('2024-01-15', $posting->start_date->format('Y-m-d'));
        $this->assertEquals('2024-06-30', $posting->end_date->format('Y-m-d'));
    }
}
