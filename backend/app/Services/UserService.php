<?php

namespace App\Services;

use App\Models\User;
use App\Models\ChangeRequest;
use Illuminate\Support\Facades\Hash;
use Exception;

class UserService extends BaseService
{
    /**
     * Create User locally (direct)
     */
    public function create(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        return User::create($data);
    }

    /**
     * Update User direct
     */
    public function update($id, array $data)
    {
        $user = $this->find($id);
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data);
        return $user;
    }

    public function delete($id)
    {
        $user = $this->find($id);
        return $user->delete();
    }

    public function find($id)
    {
        return User::findOrFail($id);
    }

    public function all(array $filters = [])
    {
        return User::filter($filters)->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Execute Change Request
     */
    public function executeRequest($request)
    {
        $data = $request->data;
        
        if ($request->type === 'CREATE') {
            return $this->create($data);
        } elseif ($request->type === 'UPDATE') {
            return $this->update($request->model_id, $data);
        }
        
        throw new Exception("Invalid request type: " . $request->type);
    }
}
