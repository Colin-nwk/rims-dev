<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\Validator;

class GlobalSafeUrlTest extends TestCase
{
    public function test_safe_url_is_registered_globally()
    {
        // Valid URL
        $validator = Validator::make(
            ['website' => 'https://google.com'],
            ['website' => 'required|safe_url']
        );
        $this->assertTrue($validator->passes(), 'Safe URL should pass global validation');

        // Invalid URL (Private IP)
        $validator = Validator::make(
            ['website' => 'http://192.168.1.1'],
            ['website' => 'required|safe_url']
        );
        $this->assertFalse($validator->passes(), 'Private IP should fail global validation');
        $this->assertEquals(
            'The website must be a safe URL (publicly accessible).', 
            $validator->errors()->first('website')
        );
    }
}
