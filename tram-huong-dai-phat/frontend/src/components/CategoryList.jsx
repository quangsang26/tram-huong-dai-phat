function CategoryList({ categories }) {
  return (
    <div className="category-grid">
      {categories.map((category) => (
        <div key={category.id} className="category-card">
          <h3>{category.name}</h3>
          <p>{category.description || "Chưa có mô tả"}</p>
        </div>
      ))}
    </div>
  );
}

export default CategoryList;