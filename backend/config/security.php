<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SSRF Protection Whitelist
    |--------------------------------------------------------------------------
    |
    | This whitelist contains a list of domains or IPs that are allowed to be
    | accessed even if they resolve to private/local IP addresses.
    | Set this in your .env via SSRF_WHITELIST (comma separated).
    |
    */
    'ssrf_whitelist' => array_filter(explode(',', env('SSRF_WHITELIST', ''))),
];
