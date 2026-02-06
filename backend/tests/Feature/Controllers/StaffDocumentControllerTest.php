<?php

namespace Tests\Feature\Controllers;

use App\Models\Staff;
use App\Models\StaffDocument;
use App\Models\User;
use App\Services\ChangeRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffDocumentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected ChangeRequestService $changeRequestService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->changeRequestService = app(ChangeRequestService::class);
        Storage::fake('public');
    }

    public function test_store_creates_change_request(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'DOC_TEST_01']);
        $this->actingAs($user);

        Gate::define('staff-document.create', fn () => true);

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $data = [
            'service_no' => 'DOC_TEST_01',
            'document_type' => 'birth_certificate',
            'document_name' => 'My Birth Certificate',
            'file' => $file,
            'notes' => 'Test document',
        ];

        $response = $this->postJson('/api/v1/staff-documents', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.model_type', 'App\Models\StaffDocument')
            ->assertJsonPath('data.type', 'CREATE');

        // Verify change request was created
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'DOC_TEST_01',
            'model_type' => 'App\Models\StaffDocument',
            'type' => 'CREATE',
            'status' => 'PENDING',
        ]);
    }

    public function test_staff_can_upload_own_document(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'DOC_SELF_01']);
        $this->actingAs($staff, 'sanctum');

        $file = UploadedFile::fake()->create('passport.jpg', 100);

        $data = [
            'service_no' => 'DOC_SELF_01',
            'document_type' => 'passport',
            'document_name' => 'My Passport',
            'file' => $file,
        ];

        $response = $this->postJson('/api/v1/staff-documents', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING');

        // Verify change request
        $this->assertDatabaseHas('change_requests', [
            'service_no' => 'DOC_SELF_01',
            'model_type' => 'App\Models\StaffDocument',
        ]);
    }

    public function test_admin_can_verify_document(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'DOC_VERIFY_01']);
        
        // Create an existing document
        $document = StaffDocument::factory()->create([
            'service_no' => 'DOC_VERIFY_01',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($admin);
        Gate::define('staff-document.verify', fn () => true);

        $response = $this->postJson("/api/v1/staff-documents/{$document->id}/verify");

        $response->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'verified')
            ->assertJsonPath('data.verifier_id', $admin->id)
            ->assertJsonPath('data.verifier_type', User::class);

        $document->refresh();
        $this->assertEquals('verified', $document->verification_status);
        $this->assertEquals($admin->id, $document->verifier_id);
        $this->assertEquals(User::class, $document->verifier_type);
    }

    public function test_staff_approver_can_verify_document(): void
    {
        // Simulate a staff member with approval rights
        $approverStaff = Staff::factory()->create(['service_no' => 'APPROVER_01']);
        $staff = Staff::factory()->create(['service_no' => 'DOC_VERIFY_02']);
        
        $document = StaffDocument::factory()->create([
            'service_no' => 'DOC_VERIFY_02',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($approverStaff, 'sanctum');
        Gate::define('staff-document.verify', fn () => true);

        $response = $this->postJson("/api/v1/staff-documents/{$document->id}/verify");

        $response->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'verified')
            ->assertJsonPath('data.verifier_id', $approverStaff->id)
            ->assertJsonPath('data.verifier_type', Staff::class);
            
        $document->refresh();
        $this->assertEquals('verified', $document->verification_status);
        $this->assertEquals($approverStaff->id, $document->verifier_id);
        $this->assertEquals(Staff::class, $document->verifier_type);
    }

    public function test_admin_can_reject_document(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'DOC_REJECT_01']);
        
        $document = StaffDocument::factory()->create([
            'service_no' => 'DOC_REJECT_01',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($admin);
        Gate::define('staff-document.verify', fn () => true);

        $response = $this->postJson("/api/v1/staff-documents/{$document->id}/reject", [
            'reason' => 'Photo too blurry'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'Photo too blurry')
            ->assertJsonPath('data.verifier_id', $admin->id)
            ->assertJsonPath('data.verifier_type', User::class);

        $document->refresh();
        $this->assertEquals('rejected', $document->verification_status);
        $this->assertEquals('Photo too blurry', $document->rejection_reason);
        $this->assertEquals($admin->id, $document->verifier_id);
        $this->assertEquals(User::class, $document->verifier_type);
    }

    public function test_update_creates_change_request(): void
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'DOC_UPDATE_01']);
        $document = StaffDocument::factory()->create(['service_no' => 'DOC_UPDATE_01', 'document_name' => 'Old Name']);
        $this->actingAs($user);

        Gate::define('staff-document.edit', fn () => true);

        $data = [
            'document_name' => 'New Name',
            'notes' => 'Updated notes',
        ];

        $response = $this->putJson("/api/v1/staff-documents/{$document->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.type', 'UPDATE');

        // Verify change request
        $this->assertDatabaseHas('change_requests', [
            'model_id' => $document->id,
            'model_type' => 'App\Models\StaffDocument',
            'type' => 'UPDATE',
            'status' => 'PENDING',
        ]);

        // Verify original record untouched
        $document->refresh();
        $this->assertEquals('Old Name', $document->document_name);
    }

    public function test_staff_can_view_own_document_inline(): void
    {
        $staff = Staff::factory()->create(['service_no' => 'DOC_VIEW_01']);
        Storage::fake('public');
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $path = $file->store('staff/documents', 'public');

        $document = StaffDocument::factory()->create([
            'service_no' => 'DOC_VIEW_01',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
        ]);

        $this->actingAs($staff, 'sanctum');

        $response = $this->get("/api/v1/staff-documents/{$document->id}/view");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('Content-Disposition', 'inline; filename="'.$document->document_name.'"');
    }

    public function test_staff_cannot_view_others_document(): void
    {
        $staff1 = Staff::factory()->create(['service_no' => 'DOC_SEC_01']);
        $staff2 = Staff::factory()->create(['service_no' => 'DOC_SEC_02']);

        $document = StaffDocument::factory()->create(['service_no' => 'DOC_SEC_02']); // Belongs to staff2

        $this->actingAs($staff1, 'sanctum');

        $response = $this->get("/api/v1/staff-documents/{$document->id}/view");

        $response->assertStatus(403);
    }

    public function test_admin_can_download_document(): void
    {
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'DOC_DL_01']);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('report.pdf', 100);
        $path = $file->store('staff/documents', 'public');

        $document = StaffDocument::factory()->create([
            'service_no' => 'DOC_DL_01',
            'file_path' => $path,
            'document_name' => 'Report.pdf',
        ]);

        $this->actingAs($admin);
        Gate::define('staff-document.view', fn () => true);

        $response = $this->get("/api/v1/staff-documents/{$document->id}/download");

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('Content-Disposition'), 'filename=Report.pdf') ||
            str_contains($response->headers->get('Content-Disposition'), 'filename="Report.pdf"')
        );
    }

    public function test_delete_removes_document_and_file(): void
    {
        $admin = User::factory()->create();
        $staff = Staff::factory()->create(['service_no' => 'DOC_DEL_01']);
        
        Storage::fake('public');
        $file = UploadedFile::fake()->create('todelete.jpg', 100);
        $path = $file->store('staff/documents', 'public');
        
        $document = StaffDocument::factory()->create([
            'service_no' => 'DOC_DEL_01',
            'file_path' => $path,
        ]);

        $this->actingAs($admin);
        Gate::define('staff-document.delete', fn () => true);

        $response = $this->deleteJson("/api/v1/staff-documents/{$document->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('staff_documents', ['id' => $document->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_index_returns_documents(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        Gate::define('staff-document.view', fn () => true);

        StaffDocument::factory()->create();

        $response = $this->getJson('/api/v1/staff-documents');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }
}
