<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafeUrl implements ValidationRule
{
    protected array $whitelist;

    public function __construct(?array $whitelist = null)
    {
        $this->whitelist = $whitelist ?? config('security.ssrf_whitelist', []);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Basic URL validation
        if (! filter_var($value, FILTER_VALIDATE_URL)) {
            $fail('The :attribute must be a valid URL.');

            return;
        }

        // Parse URL components
        $parsed = parse_url($value);
        
        if (! $parsed || ! isset($parsed['host'])) {
            $fail('The :attribute must have a valid host.');

            return;
        }

        $host = $parsed['host'];
        $scheme = $parsed['scheme'] ?? '';

        // Validate scheme
        if (! in_array(strtolower($scheme), ['http', 'https'])) {
            $fail('The :attribute must use HTTP or HTTPS protocol.');

            return;
        }

        // Check whitelist
        if (in_array($host, $this->whitelist)) {
            return;
        }

        // Prevent localhost and private IP ranges
        if ($this->isLocalhostOrPrivateIp($host)) {
            $fail('The :attribute must resolve to a public IP address.');

            return;
        }

        // If the host is an IP address, validate it
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if (! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $fail('The :attribute must resolve to a public IP address.');

                return;
            }
        } else {
            // Resolve hostname to IP and validate
            $ips = $this->resolveHostnameToIP($host);

            if ($ips === false) {
                $fail('The :attribute host could not be resolved.');

                return;
            }

            foreach ($ips as $ip) {
                if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    $fail('The :attribute must resolve to a public IP address.');

                    return;
                }
            }
        }
    }

    /**
     * Check if host is localhost or private IP
     */
    private function isLocalhostOrPrivateIp(string $host): bool
    {
        // Check for localhost variations
        $lowerHost = strtolower($host);
        if (in_array($lowerHost, ['localhost', 'localhost.localdomain', 'local', 'broadcasthost'])) {
            return true;
        }

        // Check if it's an IP address and if it's private
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return !filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
        }

        return false;
    }

    /**
     * Safely resolve hostname to IP with timeout
     */
    private function resolveHostnameToIP(string $host)
    {
        // Use dns_get_record as a safer alternative to gethostbynamel
        $result = @dns_get_record($host, DNS_A);
        
        if ($result === false || empty($result)) {
            return false;
        }

        $ips = [];
        foreach ($result as $record) {
            if (isset($record['ip'])) {
                $ips[] = $record['ip'];
            }
        }

        return $ips;
    }
}
