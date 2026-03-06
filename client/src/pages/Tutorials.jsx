import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { getTutorials } from "../api";
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
const TutorialTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.primary};
  line-height: 1.4;
`;
const TutorialLink = styled.a`
  color: ${({ theme }) => theme.text_secondary};
  text-decoration: none;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.primary};
  }
`;
const Thumbnail = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
`;

const Tutorials = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  // Clear tutorials when user changes
  useEffect(() => {
    setTutorials([]);
    setFilteredTutorials([]);
    setSelectedCategory("");
    setAllCategories([]);
  }, [currentUser?.id]);

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
      console.log(err);
      alert("Error loading tutorials");
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
    getTutorialsData();
  }, [currentUser?.id]);

  return (
    <Container>
      <Wrapper>
        <Title>Tutorials</Title>
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
            onClick={getTutorialsData}
            isLoading={loading}
            small
          />
        </div>
        <CardWrapper>
          {filteredTutorials.length > 0 ? (
            filteredTutorials.map((tutorial) => (
              <Card key={tutorial._id}>
                {tutorial.thumbnail && <Thumbnail src={tutorial.thumbnail} alt={tutorial.title} />}
                <TutorialTitle>{tutorial.title}</TutorialTitle>
                <TutorialLink href={tutorial.url} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </TutorialLink>
              </Card>
            ))
          ) : (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              No tutorials available for this category
            </div>
          )}
        </CardWrapper>
      </Wrapper>
    </Container>
  );
}

export default Tutorials;