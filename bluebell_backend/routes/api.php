<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {


//Route::apiResource('categories', CategoryController::class);

Route::get('products-trash', [ProductController::class, 'trash']);

Route::post('products-restore/{id}', [ProductController::class, 'restore']);

Route::delete('products-force-delete/{id}', [ProductController::class, 'forceDelete']);

Route::get('products-trash-count', [ProductController::class, 'trashCount']);

Route::get('/orders', [OrderController::class, 'index']);

Route::post('/orders', [OrderController::class, 'store']);

Route::get('/orders/{id}/invoice', [OrderController::class, 'invoice']);

Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

Route::apiResource('cart-items', CartItemController::class)->only(['index', 'store', 'update', 'destroy']);
Route::delete('/cart', [CartItemController::class, 'clear']);
});

Route::apiResource('products', ProductController::class);
Route::apiResource('categories', CategoryController::class);
    