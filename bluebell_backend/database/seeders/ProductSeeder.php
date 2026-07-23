<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::create([
            'name' => 'Chocolate Cake',
            'description' => 'Rich chocolate sponge cake',
            'price' => 80,
            'category_id' => 1,
            'is_available' => true,
        ]);

        Product::create([
            'name' => 'Red Velvet Cake',
            'description' => 'Cream cheese frosting',
            'price' => 95,
            'category_id' => 1,
            'is_available' => true,
        ]);

        Product::create([
            'name' => 'Vanilla Cupcake',
            'description' => 'Soft vanilla cupcake',
            'price' => 12,
            'category_id' => 2,
            'is_available' => true,
        ]);

        Product::create([
            'name' => 'Chocolate Cookie',
            'description' => 'Crunchy chocolate cookie',
            'price' => 8,
            'category_id' => 3,
            'is_available' => true,
        ]);

    }
}
