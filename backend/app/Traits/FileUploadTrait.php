<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait FileUploadTrait
{
    /**
     * Upload File
     *
     * @param UploadedFile $file
     * @param string $directory
     * @param string $disk
     * @param string|null $filename
     * @return string|false
     */
    public function uploadFile(UploadedFile $file, string $directory = 'uploads', string $disk = 'public', ?string $filename = null)
    {
        try {
            if ($filename) {
                $filename = $filename . '.' . $file->getClientOriginalExtension();
            } else {
                $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
            }
            
            $path = $file->storeAs($directory, $filename, $disk);
            
            // Return public URL or relative path depending on requirement. 
            // For now, storing storage path. URL generation can happen in accessor.
            return $path; 
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Delete File
     * 
     * @param string $path
     * @param string $disk
     * @return bool
     */
    public function deleteFile(string $path, string $disk = 'public')
    {
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }
        return false;
    }
}
