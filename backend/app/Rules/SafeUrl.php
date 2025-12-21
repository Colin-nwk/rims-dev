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
        if (! filter_var($value, FILTER_VALIDATE_URL)) {
            $fail('The :attribute must be a valid URL.');

            return;
        }

        $host = parse_url($value, PHP_URL_HOST);

        if (! $host) {
            $fail('The :attribute must have a valid host.');

            return;
        }

        // Check whitelist
        if (in_array($host, $this->whitelist)) {
            return;
        }

        // Check if the host is an IP address
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if (! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $fail('The :attribute must resolve to a public IP address.');

                return;
            }
        } else {
            // Resolve hostname to IP
            $ips = gethostbynamel($host);

            if ($ips === false) {
                // If we can't resolve it, and it wasn't whitelisted, it's unsafe or invalid
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
}
