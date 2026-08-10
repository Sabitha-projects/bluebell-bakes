export default function ProductCard({
  product,
  addToCart,
}) {

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

      {/* IMAGE */}
      {product.image && (
        <img
          src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_STORAGE_URL}/${product.image}`}
          alt={product.name}
          className="w-full h-52 object-cover"
        />
      )}

      <div className="p-5">

        <p className="text-sm text-gray-500 mb-2">
          {product.category?.name}
        </p>

        <h3 className="text-2xl font-bold mb-2">
          {product.name}
        </h3>

        <p className="text-gray-500 mb-4">
          {product.description}
        </p>

        <div className="flex justify-between items-center">

          <p className="text-pink-500 text-2xl font-bold">
            ₹ {product.price}
          </p>

          <button
            onClick={() => addToCart(product)}
            className="bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600"
          >
            Add
          </button>

        </div>
      </div>
    </div>
  );
}