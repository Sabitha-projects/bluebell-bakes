<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;

        $products = Product::with('category')
            ->when($search, function ($query, $search) {

                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(5);

        return response()->json($products);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $imageUrl = null;

       if ($request->hasFile('image')) {
    try {
        $uploaded = Cloudinary::upload(
            $request->file('image')->getRealPath(),
            ['folder' => 'products']
        );
        $imageUrl = $uploaded->getSecurePath();
        } catch (\Exception $e) {
        return response()->json([
            'message' => 'REAL ERROR: ' . $e->getMessage(),
            'file_path' => $request->file('image')->getRealPath(),
            'file_exists' => file_exists($request->file('image')->getRealPath()),
        ], 500);
        }
    }

        $product = Product::create([
            'name'        => $request->name,
            'price'       => $request->price,
            'description' => $request->description,
            'image'       => $imageUrl,          // full Cloudinary URL (or null)
            'category_id' => $request->category_id,
            'available_today' => $request->available_today ? true : false,
        ]);

        UserLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'CREATE',
            'module'     => 'PRODUCT',
            'module_id'  => $product->id,
            'description' => 'Product created: ' . $product->name,
        ]);

        return response()->json([
            'message' => 'Product added successfully',
            'product' => $product
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        // start with the existing image, so it's kept if no new one is uploaded
        $imageUrl = null;

        if ($request->hasFile('image')) {
            $uploaded = Cloudinary::upload(
                $request->file('image')->getRealPath(),
                ['folder' => 'products']
            );
            $imageUrl = $uploaded->getSecurePath();
        }
        // $imageUrl = $product->image;

        // if ($request->hasFile('image')) {
        //     // upload the new image to Cloudinary
        //     $uploaded = $request->file('image')->storeOnCloudinary('products');
        //     $imageUrl = $uploaded->getSecurePath();
        // }

        $product->update([
            'name'        => $request->name,
            'price'       => $request->price,
            'description' => $request->description,
            'image'       => $imageUrl,        // keeps old image, or uses new Cloudinary URL
            'category_id' => $request->category_id,
            'available_today' => $request->available_today? true : false,
        ]);

        UserLog::create([
            'user_id'    => Auth::id(),
            'action'     => 'UPDATE',
            'module'     => 'PRODUCT',
            'module_id'  => $product->id,
            'description' => 'Product updated: ' . $product->name,
            
        ]);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        UserLog::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'module' => 'PRODUCT',
            'module_id' => $product->id,
            'description' => 'Product deleted: ' . $product->name,
        ]);


        return response()->json([
            'message' => 'Product moved to trash'
        ]);
    }

    public function trash()
    {
        $products = Product::onlyTrashed()->get();

        return response()->json($products);
    }

    public function restore($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);

        $product->restore();

        return response()->json([
            'message' => 'Product restored'
        ]);
    }

    public function forceDelete($id)
    {
        $product = Product::onlyTrashed()->findOrFail($id);

        $product->forceDelete();

        return response()->json([
            'message' => 'Product permanently deleted'
        ]);
    }

    public function trashCount()
    {
        return Product::onlyTrashed()->count();
    }
}
