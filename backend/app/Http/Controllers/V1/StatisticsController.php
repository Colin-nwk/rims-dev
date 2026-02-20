<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Services\StatisticsService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected StatisticsService $statisticsService) {}

    /**
     * Get all statistics with optional filters.
     *
     * Query params: state_of_origin, assigned_state, sex, present_rank, initial_rank, present_command, initial_command, level, department, status, prison, lga, zone_id, zone, age_range, year_from, year_to, marital_status
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'state_of_origin',
            'assigned_state',
            'sex',
            'present_rank',
            'initial_rank',
            'present_command',
            'initial_command',
            'level',
            'department',
            'status',
            'prison',
            'lga',
            'zone_id',
            'zone',
            'age_range',
            'year_from',
            'year_to',
            'marital_status',
        ]);

        $stats = $this->statisticsService->getAll(array_filter($filters));

        return $this->successResponse($stats);
    }

    public function gender(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getGenderStats($filters));
    }

    public function maritalStatus(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getMaritalStatusStats($filters));
    }

    public function stateOfOrigin(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getStateOfOriginStats($filters));
    }

    public function assignedState(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getAssignedStateStats($filters));
    }

    public function zone(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getZoneStats($filters));
    }

    public function rank(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getRankStats($filters));
    }

    public function initialRank(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getInitialRankStats($filters));
    }

    public function initialCommand(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getInitialCommandStats($filters));
    }

    public function presentCommand(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getPresentCommandStats($filters));
    }

    public function level(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getLevelDistribution($filters, $this->getTotalStaff($filters)));
    }

    public function department(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getDepartmentDistribution($filters, $this->getTotalStaff($filters)));
    }

    public function staffStatus(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getStaffStatusDistribution($filters, $this->getTotalStaff($filters)));
    }

    public function educationType(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getEducationTypeStats($filters));
    }

    public function appointmentTrends(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getAppointmentTrends($filters));
    }

    public function ageGroups(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getAgeGroupsStats($filters));
    }

    public function prison(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getPrisonStats($filters));
    }

    public function lga(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getLgaStats($filters));
    }

    public function documentVerification(Request $request): JsonResponse
    {
        $filters = $request->only(['verification_status', 'document_type']);

        return $this->successResponse($this->statisticsService->getDocumentVerificationStats(array_filter($filters)));
    }

    public function documentExpiry(Request $request): JsonResponse
    {
        $filters = $request->only(['verification_status', 'document_type']);

        return $this->successResponse($this->statisticsService->getDocumentExpiryStats(array_filter($filters)));
    }

    public function retirementEligibility(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getRetirementEligibilityStats($filters));
    }

    public function promotionEligibility(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getPromotionEligibilityStats($filters));
    }

    /**
     * Extract common filters from request.
     *
     * @return array<string, mixed>
     */
    private function extractFilters(Request $request): array
    {
        return array_filter($request->only([
            'state_of_origin',
            'assigned_state',
            'sex',
            'present_rank',
            'initial_rank',
            'present_command',
            'initial_command',
            'level',
            'department',
            'status',
            'prison',
            'lga',
            'zone_id',
            'zone',
            'age_range',
            'year_from',
            'year_to',
            'marital_status',
        ]));
    }

    /**
     * Get total staff count with filters.
     *
     * @param  array<string, mixed>  $filters
     */
    private function getTotalStaff(array $filters): int
    {
        return \App\Models\Staff::query()->count();
    }
}
