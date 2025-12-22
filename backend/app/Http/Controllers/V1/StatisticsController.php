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
     * Query params: state_of_origin, assigned_state, sex, present_rank, level, department, status, zone_id, year_from, year_to, marital_status
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'state_of_origin',
            'assigned_state',
            'sex',
            'present_rank',
            'level',
            'department',
            'status',
            'zone_id',
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

    public function rank(Request $request): JsonResponse
    {
        $filters = $this->extractFilters($request);

        return $this->successResponse($this->statisticsService->getRankStats($filters));
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
            'level',
            'department',
            'status',
            'zone_id',
            'year_from',
            'year_to',
            'marital_status',
        ]));
    }
}
