<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait FileUploadTrait
{
    /**
     * Upload File with security validations
     *
     * @return string|false
     */
    public function uploadFile(UploadedFile $file, string $directory = 'uploads', string $disk = 'public', ?string $filename = null)
    {
        try {
            // Validate file type
            if (!$this->isValidFileType($file)) {
                throw new \Exception('Invalid file type');
            }
            
            // Validate file size
            if (!$this->isValidFileSize($file)) {
                throw new \Exception('File size exceeds limit');
            }
            
            // Validate file content (basic check)
            if (!$this->isValidFileContent($file)) {
                throw new \Exception('File content validation failed');
            }

            if ($filename) {
                // Sanitize filename to prevent path traversal
                $filename = $this->sanitizeFilename($filename).'.'.$file->getClientOriginalExtension();
            } else {
                $filename = Str::random(40).'.'.$file->getClientOriginalExtension();
            }

            $path = $file->storeAs($directory, $filename, $disk);

            // Return public URL or relative path depending on requirement.
            // For now, storing storage path. URL generation can happen in accessor.
            return $path;
        } catch (\Exception $e) {
            \Log::error('File upload error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Validate file type against allowed extensions
     */
    private function isValidFileType(UploadedFile $file): bool
    {
        $allowedExtensions = [
            // Images
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
            // Documents
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf',
            // Others as needed
        ];
        
        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, $allowedExtensions);
    }
    
    /**
     * Validate file size (default 10MB)
     */
    private function isValidFileSize(UploadedFile $file, int $maxSize = 10485760): bool
    {
        return $file->getSize() <= $maxSize;
    }
    
    /**
     * Basic file content validation
     */
    private function isValidFileContent(UploadedFile $file): bool
    {
        // Get the mime type of the uploaded file
        $mimeType = $file->getMimeType();
        
        // Define allowed mime types
        $allowedMimes = [
            // Images
            'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
            // Documents
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'application/rtf',
        ];
        
        return in_array($mimeType, $allowedMimes);
    }
    
    /**
     * Sanitize filename to prevent path traversal
     */
    private function sanitizeFilename(string $filename): string
    {
        // Remove any path traversal attempts
        $filename = str_replace(['../', './', '..\\', '.\\'], '', $filename);
        // Remove any non-alphanumeric characters except hyphens and underscores
        $filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $filename);
        return $filename;
    }

    /**
     * Delete File
     *
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
