<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

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
        DB::beginTransaction();

        try {

            // CREATE ORDER
            $order = Order::create([

                'user_id' => $auth()->id(),

                'status' => 'Pending',

                'total_price' => 0,
            ]);

            $total = 0;

            // SAVE ITEMS
            foreach ($request->items as $item) {

                $product = Product::findOrFail(
                    $item['product_id']
                );

                $subtotal =
                    $product->price * $item['quantity'];

                $total += $subtotal;

                OrderItem::create([

                    'order_id' => $order->id,

                    'product_id' => $product->id,

                    'quantity' => $item['quantity'],

                    'price' => $product->price,
                ]);
            }

            // UPDATE TOTAL
            $order->update([
                'total_price' => $total
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully'
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
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
            'message' => 'Order status updated successfully','order' => $order
        ]);
    }
}
