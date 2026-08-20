<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function createIntent(Request $request)
    {
        $user = $request->user();

        // Get the user's cart to calculate the amount
        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 422);
        }

        // Calculate total in the smallest currency unit (fils for AED)
        $total = $cartItems->sum(fn($item) => $item->product->price * $item->quantity);
        $amount = (int) round($total * 100); // AED → fils

        // Set the Stripe secret key
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Create a Payment Intent
        $intent = PaymentIntent::create([
            'amount'   => $amount,
            'currency' => 'aed',
            'metadata' => ['user_id' => $user->id],
        ]);

        return response()->json([
            'clientSecret' => $intent->client_secret,
            'amount'       => $total,
        ]);
    }
}