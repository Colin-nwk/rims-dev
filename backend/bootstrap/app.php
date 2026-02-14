<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->prefix('api/v1')
                ->group(base_path('routes/api/v1.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $statusCode = 500;

                if ($e instanceof HttpException) {
                    $statusCode = $e->getStatusCode();
                } elseif ($e instanceof AuthenticationException) {
                    $statusCode = 401;
                } elseif ($e instanceof AuthorizationException) {
                    $statusCode = 403;
                } elseif ($e instanceof ValidationException) {
                    $statusCode = 422;
                }

                $response = [
                    'status' => 'Error',
                    'message' => $e->getMessage() ?: 'An error occurred',
                    // 'data' => null,
                ];

                if ($e instanceof ValidationException) {
                    // $response['data'] = $e->errors();
                    $response['errors'] = $e->errors(); // Laravel test helper compatibility
                }

                // if (config('app.debug')) {
                //     $response['debug'] = [
                //         'exception' => get_class($e),
                //         'file' => $e->getFile(),
                //         'line' => $e->getLine(),
                //         'trace' => collect($e->getTrace())->take(10)->toArray(),
                //     ];
                // }
                if (config('app.debug')) {
                    $response['debug'] = [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => array_slice(array_map(fn ($t) => [
                            'file' => $t['file'] ?? 'unknown',
                            'line' => $t['line'] ?? 0,
                            'function' => $t['function'] ?? 'unknown',
                        ], $e->getTrace()), 0, 10),
                    ];
                }

                return response()->json($response, $statusCode);
            }
        });
    })->create();
