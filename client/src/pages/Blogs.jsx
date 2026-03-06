import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getBlogs } from "../api";
import Button from "../components/Button";

const Blogs = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  const getBlogsData = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    await getBlogs(token).then((res) => {
      setBlogs(res.data);
      // Get unique categories
      const categories = [...new Set(res.data.map((b) => b.category))];
      setAllCategories(categories);
      // Use last workout category or first available
      const lastCategory = localStorage.getItem("lastWorkoutCategory");
      const categoryToUse = lastCategory && categories.includes(lastCategory) ? lastCategory : categories[0];
      setSelectedCategory(categoryToUse || "");
      filterBlogs(res.data, categoryToUse || "");
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const filterBlogs = (allBlogs, category) => {
    if (category) {
      setFilteredBlogs(allBlogs.filter((b) => b.category === category));
    } else {
      setFilteredBlogs(allBlogs);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterBlogs(blogs, category);
  };

  useEffect(() => {
    if (currentUser) {
      getBlogsData();
    }
  }, [currentUser]);

  return (
    <div className="flex-1 min-h-screen flex justify-center py-6 px-4 bg-neutral-50 overflow-y-auto">
      <div className="flex-1 max-w-[1400px] flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-800">Suggested Reading</h1>
          <Button
            text="Refresh"
            onClick={getBlogsData}
            isLoading={loading}
            small
          />
        </div>

        {allCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-1">
            <span className="text-sm font-semibold text-neutral-600">Categories:</span>
            {allCategories.map((cat) => (
              <div
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300
                  ${selectedCategory === cat 
                    ? "bg-primary text-white shadow-md ring-2 ring-primary/20" 
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary/50"}
                `}
              >
                {cat}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1 pb-20">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <div 
                key={blog._id}
                className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">
                    {blog.category}
                  </div>
                </div>
                <h3 className="font-extrabold text-xl text-neutral-800 leading-tight group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
                <a 
                  href={blog.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto px-4 py-2 rounded-lg border border-neutral-200 text-center text-sm font-semibold text-neutral-700 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                >
                  Read Article
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-neutral-400 border border-dashed border-neutral-300 rounded-xl bg-white">
              No blogs available for this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blogs;