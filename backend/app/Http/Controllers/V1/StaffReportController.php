<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffReportExportRequest;
use App\Http\Requests\StaffReportRequest;
use App\Models\Staff;
use App\Services\StaffReportColumnRegistry;
use App\Services\StaffReportCriteria;
use App\Services\StaffReportScopeResolver;
use App\Services\StaffReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffReportController extends Controller
{
    public function __construct(
        private readonly StaffReportService $reports,
        private readonly StaffReportScopeResolver $scopes,
        private readonly StaffReportColumnRegistry $columns,
    ) {}

    public function query(StaffReportRequest $request): JsonResponse
    {
        $criteria = StaffReportCriteria::fromValidated($request->validated());
        $scope = $this->scopes->resolve($request->user());
        $data = $this->reports->generate($criteria, $scope);

        Log::info('Staff report viewed', [
            'actor_id' => $request->user()->getAuthIdentifier(),
            'actor_type' => $request->user()::class,
            'criteria_hash' => hash('sha256', json_encode($criteria->filters())),
            'scope' => $scope['label'],
            'row_count' => $data['details']['pagination']['total'] ?? $data['summary']['total_staff'] ?? null,
        ]);

        return response()->json([
            'status' => 'Success',
            'message' => null,
            'data' => $data,
            'meta' => [
                'criteria_applied' => $criteria->toArray(),
                'scope' => $scope['label'],
                'generated_at' => now()->toIso8601String(),
                'contract_version' => '1',
            ],
        ]);
    }

    public function options(Request $request): JsonResponse
    {
        $this->authorize('report.view');
        $scope = $this->scopes->resolve($request->user());

        return response()->json([
            'status' => 'Success',
            'message' => null,
            'data' => $this->reports->options($scope, $this->columns),
        ]);
    }

    public function show(Request $request, Staff $staff): JsonResponse
    {
        $this->authorize('report.view');
        $scope = $this->scopes->resolve($request->user());
        abort_unless($this->reports->canAccess($staff, $scope), 404);

        return response()->json([
            'status' => 'Success',
            'message' => null,
            'data' => $this->reports->detail($staff),
        ]);
    }

    public function export(StaffReportExportRequest $request): StreamedResponse
    {
        $criteria = StaffReportCriteria::fromValidated($request->validated());
        $scope = $this->scopes->resolve($request->user());

        try {
            $columns = $this->columns->validate($request->validated('columns'));
        } catch (\InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['columns' => [$exception->getMessage()]]);
        }

        $definitions = $this->columns->all();
        $fileName = trim((string) $request->validated('file_name', 'staff-report')) ?: 'staff-report';

        Log::info('Staff report export started', [
            'actor_id' => $request->user()->getAuthIdentifier(),
            'actor_type' => $request->user()::class,
            'criteria_hash' => hash('sha256', json_encode($criteria->filters())),
            'scope' => $scope['label'],
            'columns' => $columns,
            'format' => 'csv',
        ]);

        return response()->streamDownload(function () use ($criteria, $scope, $columns, $definitions): void {
            $output = fopen('php://output', 'wb');
            fputcsv($output, array_map(fn (string $column) => $definitions[$column]['label'], $columns));

            foreach ($this->reports->exportRows($criteria, $scope) as $staff) {
                $row = array_map(function (string $column) use ($staff): string|int|null {
                    $value = $this->columns->value($staff, $column);
                    if (is_string($value) && preg_match('/^[=+\-@]/', $value) === 1) {
                        return "'{$value}";
                    }

                    return $value;
                }, $columns);
                fputcsv($output, $row);
            }

            fclose($output);
        }, "{$fileName}.csv", [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, private',
        ]);
    }
}
