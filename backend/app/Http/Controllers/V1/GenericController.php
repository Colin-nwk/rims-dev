<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
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
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::create($request->all());

        return $this->successResponse($item, 'Created successfully.', 201);
    }

    public function update(Request $request, string $model, $id)
    {
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::findOrFail($id);
        $item->update($request->all());

        return $this->successResponse($item, 'Updated successfully.');
    }

    public function destroy(string $model, $id)
    {
        $modelClass = $this->resolveModel($model);
        $item = $modelClass::findOrFail($id);
        $item->delete();

        return response()->noContent();
    }
}
