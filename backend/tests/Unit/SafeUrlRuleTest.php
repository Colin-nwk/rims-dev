<?php

namespace Tests\Unit;

use App\Rules\SafeUrl;
use Tests\TestCase;

class SafeUrlRuleTest extends TestCase
{
    /**
     * A basic unit test example.
     */
    public function test_safe_url_allows_public_https()
    {
        $rule = new SafeUrl();
        $this->callRule($rule, 'https://google.com', true);
    }

    public function test_safe_url_allows_public_ip()
    {
        $rule = new SafeUrl();
        $this->callRule($rule, 'http://8.8.8.8', true);
    }

    public function test_safe_url_blocks_localhost()
    {
        $rule = new SafeUrl();
        $this->callRule($rule, 'http://localhost', false);
    }

    public function test_safe_url_blocks_loopback_ip()
    {
        $rule = new SafeUrl();
        $this->callRule($rule, 'http://127.0.0.1', false);
    }

    public function test_safe_url_blocks_private_ip()
    {
        $rule = new SafeUrl();
        // 192.168.x.x is private
        $this->callRule($rule, 'http://192.168.1.1', false);
        // 10.x.x.x is private
        $this->callRule($rule, 'http://10.0.0.1', false);
    }

    public function test_safe_url_respects_whitelist()
    {
        // Whitelist localhost and specific private IP
        $rule = new SafeUrl(['localhost', '192.168.1.50']);
        
        $this->callRule($rule, 'http://localhost', true);
        $this->callRule($rule, 'http://192.168.1.50', true);
        $this->callRule($rule, 'http://192.168.1.51', false); // Not whitelisted
    }

    public function test_safe_url_uses_config_whitelist()
    {
        // Mock config
        \Illuminate\Support\Facades\Config::set('security.ssrf_whitelist', ['localhost']);
        
        $rule = new SafeUrl();
        
        $this->callRule($rule, 'http://localhost', true);
        $this->callRule($rule, 'http://127.0.0.1', false); 
    }

    public function test_safe_url_blocks_invalid_url()
    {
        $rule = new SafeUrl();
        $this->callRule($rule, 'not-a-url', false);
    }

    protected function callRule(SafeUrl $rule, mixed $value, bool $shouldPass)
    {
        $failed = false;
        $fail = function ($message) use (&$failed) {
            $failed = true;
        };

        $rule->validate('url', $value, $fail);

        if ($shouldPass) {
            $this->assertFalse($failed, "Failed validating safe URL: $value");
        } else {
            $this->assertTrue($failed, "Allowed unsafe URL: $value");
        }
    }
}
