import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { getBlogs } from "../api";
import Button from "../components/Button";

const CategoryTag = styled.div`
  display: inline-block;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
`;
const Wrapper = styled.div`
  flex: 1;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Title = styled.div`
  padding: 0px 16px;
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 100px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Card = styled.div`
  flex: 1;
  min-width: 280px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 1px 10px 30px 0px ${({ theme }) => theme.primary + 20};
  }
  @media (max-width: 600px) {
    padding: 16px;
  }
`;
const BlogTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.primary};
  line-height: 1.4;
`;
const BlogExcerpt = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 14px;
  line-height: 1.5;
`;
const BlogLink = styled.a`
  color: ${({ theme }) => theme.text_secondary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.primary};
  }
`;

const Blogs = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  // Clear blogs when user changes
  useEffect(() => {
    setBlogs([]);
    setFilteredBlogs([]);
    setSelectedCategory("");
    setAllCategories([]);
  }, [currentUser?.id]);

  const getBlogsData = useCallback(async () => {
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
      console.log(err);
      alert("Error loading blogs");
      setLoading(false);
    });
  }, []);

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
    getBlogsData();
  }, [getBlogsData]);

  return (
    <Container>
      <Wrapper>
        <Title>Blogs</Title>
        {allCategories.length > 0 && (
          <div style={{ padding: "0px 16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Category:</span>
            {allCategories.map((cat) => (
              <CategoryTag
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  cursor: "pointer",
                  opacity: selectedCategory === cat ? 1 : 0.6,
                  border: selectedCategory === cat ? "2px solid white" : "none",
                }}
              >
                {cat}
              </CategoryTag>
            ))}
          </div>
        )}
        <div style={{ padding: "0px 16px" }}>
          <Button
            text="Refresh"
            onClick={getBlogsData}
            isLoading={loading}
            small
          />
        </div>
        <CardWrapper>
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <Card key={blog._id}>
                <BlogTitle>{blog.title}</BlogTitle>
                <BlogExcerpt>{blog.excerpt}</BlogExcerpt>
                <BlogLink href={blog.url} target="_blank" rel="noopener noreferrer">
                  Read Full Article
                </BlogLink>
              </Card>
            ))
          ) : (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              No blogs available for this category
            </div>
          )}
        </CardWrapper>
      </Wrapper>
    </Container>
  );
}

export default Blogs;