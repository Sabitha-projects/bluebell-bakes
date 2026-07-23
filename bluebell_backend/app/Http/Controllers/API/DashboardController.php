<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\Product;
use App\Models\Category;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalRevenue = Order::sum(
            'total_price'
        );

        $totalOrders = Order::count();

        $totalProducts = Product::count();

        $totalCategories = Category::count();

        // RECENT ORDERS
        $recentOrders = Order::latest()
            ->take(5)
            ->get();

        return response()->json([

            'totalRevenue' =>
                $totalRevenue,

            'totalOrders' =>
                $totalOrders,

            'totalProducts' =>
                $totalProducts,

            'totalCategories' =>
                $totalCategories,

            'recentOrders' =>
                $recentOrders,
        ]);
    }
}