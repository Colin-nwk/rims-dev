<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

/**
 * @method void assertArrayHasKey(int|string $key, array|\ArrayAccess $array, string $message = '')
 * @method void assertContains(mixed $needle, iterable $haystack, string $message = '')
 * @method void assertCount(int $expectedCount, \Countable|iterable $haystack, string $message = '')
 * @method void assertEmpty(mixed $actual, string $message = '')
 * @method void assertEquals(mixed $expected, mixed $actual, string $message = '')
 * @method void assertEqualsCanonicalizing(mixed $expected, mixed $actual, string $message = '')
 * @method void assertFalse(mixed $condition, string $message = '')
 * @method void assertGreaterThan(mixed $expected, mixed $actual, string $message = '')
 * @method void assertInstanceOf(string $expected, mixed $actual, string $message = '')
 * @method void assertIsArray(mixed $actual, string $message = '')
 * @method void assertIsInt(mixed $actual, string $message = '')
 * @method void assertIsString(mixed $actual, string $message = '')
 * @method void assertLessThan(mixed $expected, mixed $actual, string $message = '')
 * @method void assertNotEmpty(mixed $actual, string $message = '')
 * @method void assertNotNull(mixed $actual, string $message = '')
 * @method void assertNotSame(mixed $expected, mixed $actual, string $message = '')
 * @method void assertNull(mixed $actual, string $message = '')
 * @method void assertSame(mixed $expected, mixed $actual, string $message = '')
 * @method void assertStringContainsString(string $needle, string $haystack, string $message = '')
 * @method void assertTrue(mixed $condition, string $message = '')
 */
abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Cache::forget('app.permissions');
    }
}
