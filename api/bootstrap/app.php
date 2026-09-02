<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, $request) {
            if (
                $request->is('api/*')
                && ! $e instanceof ValidationException
                && ! $e instanceof AuthenticationException
                && ! $e instanceof AuthorizationException
                && ! $e instanceof HttpExceptionInterface
            ) {
                return response()->json([
                    'status' => 'error',
                    'message' => config('app.debug')
                        ? $e->getMessage()
                        : 'Unexpected error occurred.',
                ], 500);
            }
        });
    })->create();
