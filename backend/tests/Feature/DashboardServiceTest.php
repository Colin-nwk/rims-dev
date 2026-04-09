<?php

namespace Tests\Feature;

use App\Models\Directorate;
use App\Models\Staff;
use App\Models\TrainingInstitute;
use App\Models\WorkDistribution;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_stats_includes_work_distribution_directorate_and_training_school_breakdown(): void
    {
        $generalDuty = WorkDistribution::query()->create([
            'name' => 'General duty',
            'status' => true,
        ]);
        $medical = WorkDistribution::query()->create([
            'name' => 'Medical',
            'status' => true,
        ]);
        $operations = Directorate::query()->create([
            'name' => 'Operation',
            'status' => true,
        ]);
        $training = Directorate::query()->create([
            'name' => 'Training',
            'status' => true,
        ]);
        $ijebu = TrainingInstitute::query()->create([
            'name' => 'Correctional academy Ijebu Igbo',
            'status' => true,
        ]);
        $enugu = TrainingInstitute::query()->create([
            'name' => 'Correctional training college Enugu',
            'status' => true,
        ]);

        Staff::factory()->create([
            'work_distribution_id' => $generalDuty->id,
            'directorate_id' => $operations->id,
            'training_institute_id' => $ijebu->id,
            'status' => 1,
        ]);
        Staff::factory()->create([
            'work_distribution_id' => $generalDuty->id,
            'directorate_id' => $operations->id,
            'training_institute_id' => $enugu->id,
            'status' => 1,
        ]);
        Staff::factory()->create([
            'work_distribution_id' => $medical->id,
            'directorate_id' => $training->id,
            'training_institute_id' => $enugu->id,
            'status' => 1,
        ]);

        $stats = app(DashboardService::class)->getStats();

        $this->assertArrayHasKey('staff_distributions', $stats);
        $this->assertSame([
            'General duty' => 2,
            'Medical' => 1,
        ], $stats['staff_distributions']['work_distributions']);
        $this->assertSame([
            'Operation' => 2,
            'Training' => 1,
        ], $stats['staff_distributions']['directorates']);
        $this->assertSame([
            'Correctional academy Ijebu Igbo' => 1,
            'Correctional training college Enugu' => 2,
        ], $stats['staff_distributions']['training_schools']);
    }
}
