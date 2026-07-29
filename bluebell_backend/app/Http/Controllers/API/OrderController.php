<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\CartItem;

class OrderController extends Controller
{
    public function index()
    {
        // Fetch all orders with their items and associated products
        $orders = Order::with('items.product')->get();

        return response()->json($orders);
    }


    // CREATE ORDER
    public function store(Request $request)
    {
        $user = $request->user();

        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 422);
        }

        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id'     => $user->id,
                'status'      => 'pending',
                'total_price' => 0,
            ]);

            $total = 0;

            foreach ($cartItems as $cartItem) {
                $subtotal = $cartItem->product->price * $cartItem->quantity;
                $total += $subtotal;

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity'   => $cartItem->quantity,
                    'price'      => $cartItem->product->price,
                ]);
            }

            $order->update(['total_price' => $total]);

            // Clear the cart after ordering
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order'   => $order->load('items.product'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function invoice($id)
    {
        $order = Order::with(
            'items.product'
        )->findOrFail($id);

        $pdf = Pdf::loadView(
            'invoice',
            compact('order')
        );

        return $pdf->download(
            'invoice-' . $order->id . '.pdf'
        );
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:Pending,Processing,Completed,Cancelled',
        ]);

        $order->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    public function myOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::with('items.product')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
            // dd($orders);

        return response()->json($orders);
    }
}
