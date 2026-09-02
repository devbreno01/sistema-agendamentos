<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AttendanceController;

Route::post("/login", [AuthController::class, 'login']);
Route::post("/user", [UserController::class, 'store']);


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group(['middleware' => ['auth:sanctum']], function (){
    Route::get("/testeAuth", function () {
        return response()->json(["message" => "Autenticado"]);
    });


});
