import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getTutorials } from "../api";
import Button from "../components/Button";

const Tutorials = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  const getTutorialsData = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    await getTutorials(token).then((res) => {
      setTutorials(res.data);
      // Get unique categories
      const categories = [...new Set(res.data.map((t) => t.category))];
      setAllCategories(categories);
      // Use last workout category or first available
      const lastCategory = localStorage.getItem("lastWorkoutCategory");
      const categoryToUse = lastCategory && categories.includes(lastCategory) ? lastCategory : categories[0];
      setSelectedCategory(categoryToUse || "");
      filterTutorials(res.data, categoryToUse || "");
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const filterTutorials = (allTutorials, category) => {
    if (category) {
      setFilteredTutorials(allTutorials.filter((t) => t.category === category));
    } else {
      setFilteredTutorials(allTutorials);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterTutorials(tutorials, category);
  };

  useEffect(() => {
    if (currentUser) {
      getTutorialsData();
    }
  }, [currentUser]);

  return (
    <div className="flex-1 min-h-screen flex justify-center py-6 px-4 bg-neutral-50 overflow-y-auto">
      <div className="flex-1 max-w-[1400px] flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-800">Suggested Tutorials</h1>
          <Button
            text="Refresh"
            onClick={getTutorialsData}
            isLoading={loading}
            small
          />
        </div>

        {allCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-1">
            <span className="text-sm font-semibold text-neutral-600">Filters:</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-1 pb-20">
          {filteredTutorials.length > 0 ? (
            filteredTutorials.map((tutorial) => (
              <div 
                key={tutorial._id}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 group"
              >
                {tutorial.thumbnail && (
                  <div className="overflow-hidden rounded-lg">
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title} 
                      className="w-full h-44 object-cover" 
                    />
                  </div>
                )}
                <div className="inline-block w-fit px-2.5 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  {tutorial.category}
                </div>
                <h3 className="font-bold text-lg text-neutral-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {tutorial.title}
                </h3>
                <a 
                  href={tutorial.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto text-sm font-semibold text-secondary hover:text-primary transition-colors"
                >
                  Watch Video →
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-neutral-400 border border-dashed border-neutral-300 rounded-xl bg-white">
              No tutorials available for this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorials;