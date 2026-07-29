<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Psy\Readline\Hoa\Console;

class CartItemController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

            

        $total = $items->sum(fn($item) => $item->product->price * $item->quantity);
        return response()->json(['items' => $items, 'total' => $total, 'count' => $items->sum('quantity')]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::firstOrNew([
            'user_id'    => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        $item->quantity = ($item->quantity ?? 0) + ($request->quantity ?? 1);
        $item->save();

        return response()->json([
            'message' => 'Added to cart',
            'item'    => $item->load('product'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->quantity = $request->quantity;
        $item->save();

        return response()->json([
            'message' => 'Cart item updated',
            'item'    => $item->load('product'),
        ]);
    }


    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Cart cleared']);
    }

    public function destroy(Request $request, $id)
    {
        $item = CartItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Cart item removed']);
    }
}
