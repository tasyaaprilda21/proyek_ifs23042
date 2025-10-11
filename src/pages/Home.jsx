// src/pages/Home.jsx
import React from "react";
import StoryList from "../components/StoryList";
import PostsList from "./PostsList"; // pakai PostsList yang sudah ada

export default function Home() {
  return (
    <div className="home-layout">
      <StoryList />
      <PostsList />
    </div>
  );
}
