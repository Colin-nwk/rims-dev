<?php

namespace App\Services;

abstract class BaseService
{
    /**
     * Create resource
     *
     * @return mixed
     */
    abstract public function create(array $data);

    /**
     * Update resource
     *
     * @param  int|string  $id
     * @return mixed
     */
    abstract public function update($id, array $data);

    /**
     * Delete resource
     *
     * @param  int|string  $id
     * @return bool
     */
    abstract public function delete($id);

    /**
     * Find resource
     *
     * @param  int|string  $id
     * @return mixed
     */
    abstract public function find($id);

    /**
     * List resources with filters
     *
     * @return mixed
     */
    abstract public function all(array $filters = []);

    /**
     * Perform the actual execution from a ChangeRequest
     *
     * @param  \App\Models\ChangeRequest  $request
     * @return mixed
     */
    abstract public function executeRequest($request);
}
