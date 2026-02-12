<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenericController extends Controller
{
    use ApiResponseTrait;

    protected $modelClass;

    public function __construct(Request $request)
    {
        $this->modelClass = $request->route('model');
    }

    protected function resolveModel(string $name)
    {
        $models = [
            'zones' => \App\Models\Zone::class,
            'states' => \App\Models\State::class,
            'prisons' => \App\Models\Prison::class,
            'lga' => \App\Models\LGA::class,
            'degree_types' => \App\Models\DegreeType::class,
            'rankings' => \App\Models\Ranking::class,
            'levels' => \App\Models\Level::class,
            'marital_statuses' => \App\Models\MaritalStatus::class,
            'blood_groups' => \App\Models\BloodGroup::class,
            'blood_genotypes' => \App\Models\BloodGenotype::class,
            'complexions' => \App\Models\Complexion::class,
            'hair_colours' => \App\Models\HairColour::class,
        ];

        if (! isset($models[$name])) {
            abort(404, 'Resource not found.');
        }

        return $models[$name];
    }

    public function index(string $model)
    {
        $modelClass = $this->resolveModel($model);
        $items = $modelClass::paginate(15);

        return $this->collectionResponse($items);
    }

    public function show(string $model, $id)
    {
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::findOrFail($id);

        return $this->successResponse($item);
    }

    public function store(Request $request, string $model)
    {
        $this->authorize('generic.create');
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::create($request->all());

        return $this->successResponse($item, 'Created successfully.', 201);
    }

    public function update(Request $request, string $model, $id)
    {
        $this->authorize('generic.edit');
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::findOrFail($id);
        $item->update($request->all());

        return $this->successResponse($item, 'Updated successfully.');
    }

    public function destroy(string $model, $id)
    {
        $this->authorize('generic.delete');
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::findOrFail($id);
        $item->delete();

        return response()->noContent();
    }

    
    /**
     * Get all filter options data in one call.
     */
    public function getGenericData(): JsonResponse
    {
        return $this->successResponse([
            'zones' => \App\Models\Zone::select('id', 'zone', 'status')
                ->where('status', true)
                ->orderBy('zone')
                ->get(),
            'states' => \App\Models\State::select('id', 'state', 'zone_id', 'status')
                ->where('status', true)
                ->orderBy('state')
                ->get(),
            'prisons' => \App\Models\Prison::select('id', 'prison_name', 'state_id', 'status')
                ->where('status', true)
                ->orderBy('prison_name')
                ->get(),
            'lgas' => \App\Models\LGA::select('id', 'lga', 'state_id', 'status')
                ->where('status', 1)
                ->orderBy('lga')
                ->get(),
            'rankings' => \App\Models\Ranking::select('id', 'title', 'status')
                ->where('status', true)
                ->orderBy('title')
                ->get(),
            'levels' => \App\Models\Level::select('id', 'level', 'level_number', 'status')
                ->where('status', true)
                ->orderBy('level_number')
                ->get(),
            'marital_statuses' => \App\Models\MaritalStatus::select('id', 'name', 'status')
                ->where('status', true)
                ->orderBy('name')
                ->get(),
            'blood_groups' => \App\Models\BloodGroup::select('id', 'title as name', 'status')
                ->where('status', true)
                ->orderBy('title')
                ->get(),
            'blood_genotypes' => \App\Models\BloodGenotype::select('id', 'title as name', 'status')
                ->where('status', true)
                ->orderBy('title')
                ->get(),
            'complexions' => \App\Models\Complexion::select('id', 'title as name', 'status')
                ->where('status', true)
                ->orderBy('title')
                ->get(),
            'hair_colours' => \App\Models\HairColour::select('id', 'title as name', 'status')
                ->where('status', true)
                ->orderBy('title')
                ->get(),
            'degree_types' => \App\Models\DegreeType::select('id', 'title', 'status')
                ->where('status', 1)
                ->orderBy('title')
                ->get(),
        ]);
    }
}
