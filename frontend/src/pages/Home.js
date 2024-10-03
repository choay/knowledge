import React from 'react';
import { Link } from 'react-router-dom';
import musiqueImage from '../assets/images/musique.webp';
import informatiqueImage from '../assets/images/computer-room-8135519_640.webp';
import jardinageImage from '../assets/images/garden-2218786_640.webp';
import cuisineImage from '../assets/images/cooking.webp';

const Card = ({ to, imageSrc, altText, title, description, bgColor }) => (
  <Link
    to={to}
    className="shadow-md rounded-lg p-6 transition transform hover:scale-105"
    style={{ backgroundColor: bgColor, color: '#f1f8fc' }}
  >
    <img src={imageSrc} alt={altText} className="w-full h-32 object-cover mb-4" />
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p>{description}</p>
  </Link>
);

const Home = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f1f8fc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mt-8 p-4" style={{ color: '#384050' }}>
          Welcome to Knowledge
        </h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          <Card
            to="/themes/1"
            imageSrc={musiqueImage}
            altText="A violin"
            title="Music"
            description="Explore the world of music and learn about various instruments and styles."
            bgColor="#0074c7"
          />
          <Card
            to="/themes/2"
            imageSrc={informatiqueImage}
            altText="Computer"
            title="Informatics"
            description="Dive into the realm of computer science and programming."
            bgColor="#00497c"
          />
          <Card
            to="/themes/3"
            imageSrc={jardinageImage}
            altText="Garden"
            title="Gardening"
            description="Learn the art of gardening and plant care."
            bgColor="#384050"
          />
          <Card
            to="/themes/4"
            imageSrc={cuisineImage}
            altText="Cooking"
            title="Cooking"
            description="Master culinary skills and discover new recipes."
            bgColor="#cd2c2e"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
