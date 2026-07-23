import { useEffect, useState } from "react";
import axios from "axios";

import CategorySidebar from "../components/CategorySidebar";
import ProductCard from "../components/ProductCard";
import CartPanel from "../components/CartPanel";

export default function Orders() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [cart, setCart] = useState([]);

  // LOAD PRODUCTS
  const getProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // LOAD CATEGORIES
  const getCategories = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/categories");

      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getProducts();

    getCategories();
  }, []);

  // FILTER PRODUCTS
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  // ADD TO CART
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
  };

  // REMOVE CART ITEM
  const removeFromCart = (id) => {
    const updated = cart.filter((item) => item.id !== id);

    setCart(updated);
  };

  // CHANGE QUANTITY
  const updateQuantity = (id, qty) => {
    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: qty,
          }
        : item,
    );

    setCart(updated);
  };

  // TOTAL
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,

    0,
  );

  return (
  <div className="min-h-screen bg-gray-100 flex">

    {/* CATEGORY SIDEBAR */}
    <CategorySidebar
      categories={categories}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
    />


    {/* PRODUCTS */}
    <div className="flex-1 p-6">

      <h1 className="text-4xl font-bold text-pink-500 mb-8">
        BlueBell Bakes 🧁
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {filteredProducts.length > 0 ? (

          filteredProducts.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />

          ))

        ) : (

          <p className="text-gray-500">
            No products available
          </p>

        )}

      </div>

    </div>



    {/* CART PANEL */}
    <div className="w-80">

      <CartPanel
        cart={cart}
        total={total}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        setCart={setCart}
      />


      {/* CHECKOUT BUTTON */}

      {cart.length > 0 && (

        <div className="p-4">

          <button
            onClick={placeOrder}
            className="
              w-full
              bg-pink-500
              text-white
              py-3
              rounded-lg
              hover:bg-pink-600
              transition
            "
          >
            Place Order
          </button>

        </div>

      )}

    </div>


  </div>
);
}
