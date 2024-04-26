import React from 'react';
import { Link } from 'react-router-dom';
import '../../static/css/HorizontalScrollList.css';

const items = [
  { text: 'All Products', link: '/shop', isAllProducts: true },
  { imageUrl: '../../static/images/cat_clothes.jpeg', text: 'Clothing & Apparel', link: '/shop/category/1' },
  { imageUrl: '../../static/images/cat_electronics.jpeg', text: 'Electronics', link: '/shop/category/2' },
  { imageUrl: '../../static/images/cat_home.jpeg', text: 'Home & Garden', link: '/shop/category/3' },
  { imageUrl: '../../static/images/cat_beauty.jpeg', text: 'Health & Beauty', link: '/shop/category/4' },
  { imageUrl: '../../static/images/cat_sports.jpeg', text: 'Sports & Outdoors', link: '/shop/category/5' }
];

const HorizontalScrollList = () => {
  return (
    <div className="scroll-list">
      {items.map((item, index) => {
        if (item.isAllProducts) {
          // Render a button or special item for "All Products"
          return (
            <Link to={item.link} className="item all-products" key={index}>
              <div className="text">{item.text}</div>
            </Link>
          );
        }
        // Render normal category items
        return (
          <Link to={item.link} className="item" key={index}>
            <img src={item.imageUrl} alt={item.text} />
            <div className="text">{item.text}</div>
          </Link>
        );
      })}
    </div>
  );
};

export default HorizontalScrollList;
