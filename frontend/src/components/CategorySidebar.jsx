export default function CategorySidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
}) {

  return (
    <div className="w-64 bg-white shadow-lg p-6">

      <h2 className="text-2xl font-bold text-pink-500 mb-6">
        Categories
      </h2>

      <div className="space-y-3">

        <button
          onClick={() =>
            setSelectedCategory(null)
          }
          className={`w-full text-left px-4 py-3 rounded-xl ${
            selectedCategory === null
              ? "bg-pink-500 text-white"
              : "bg-gray-100"
          }`}
        >
          All Products
        </button>

        {categories.map((cat) => (

          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(cat.id)
            }
            className={`w-full text-left px-4 py-3 rounded-xl ${
              selectedCategory === cat.id
                ? "bg-pink-500 text-white"
                : "bg-gray-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}