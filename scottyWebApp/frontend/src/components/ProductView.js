import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/utils';
import '../../static/css/ProductView.css';
import { handleAddToCart } from "../utils/cartUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';

const Product = ({ id, productOwnerId, name, description, price, onAddToCartResult, showAddToCartButton = true, userId}) => {
  return (
    <div className="product-card">
      <Link to={`/shop/product/${id}`}>
        <img src={BASE_URL + `/scotty/productphoto/${id}`} alt={name} className="product-image" />
      </Link>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-description">{description}</p>
        <p className="product-price">${price}</p>
        {showAddToCartButton && (
          <button onClick={() => handleAddToCart(id, productOwnerId, onAddToCartResult, userId)} className="btn btn-primary add-to-cart-button">
            <FontAwesomeIcon icon={faCartPlus} className="icon"/> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
