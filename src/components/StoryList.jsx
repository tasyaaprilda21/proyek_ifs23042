// src/components/StoryList.jsx
import React from "react";

const sampleStories = [
  { id: 1, name: "You", img: "/img/foto1.png" },
  { id: 2, name: "Tasya", img: "/img/login.jpg" },
  { id: 3, name: "Friend1", img: "/img/blog.png" },
  { id: 4, name: "Friend2", img: "/img/gemastik.png" },
];

export default function StoryList() {
  return (
    <div className="story-list" aria-hidden={false}>
      {sampleStories.map((s) => (
        <div key={s.id} className="story-item">
          <img src={s.img} alt={s.name} />
          <small>{s.name}</small>
        </div>
      ))}
    </div>
  );
}
