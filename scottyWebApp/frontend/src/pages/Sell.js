import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, getCookie } from '../utils/utils';
import { withAuthProtection } from "../utils/withAuthProtection";
import { Toaster, toast } from "react-hot-toast";

import Breadcrumb from "../components/Breadcrumb";
import ProductView from "../components/ProductView";
import ProductForm from "../components/ProductForm";

import '../../static/css/Sell.css';

const Sell = () => {
    const [userId, setUserId] = useState('');
    const [products, setProducts] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const csrfToken = getCookie('csrftoken');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = BASE_URL + `/scotty/user/`;
                const response = await axios.get(url);
                setUserId(response.data.id);
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!userId) {
                return;
            }
            try {
                const url = BASE_URL + `/scotty/products/?seller=${userId}`;
                const response = await axios.get(url);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, [userId]);

    const handleSubmit = async (formData) => {
        formData.append('seller', userId);

        // Validate price before submitting
        const price = formData.get('price');
        if (isNaN(price) || price === '') {
            toast.error('Please enter a valid price.');
            return;
        }

        try {
            const response = await axios.post(BASE_URL + '/scotty/products/', formData, {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Product created:', response.data);
            setProducts([...products, response.data]);
        } catch (error) {
            console.error('Error posting new product:', error);
        }
    };

    return (
        <div>
            <Breadcrumb
                mainText="Sell"
                linkText="Home"
                currentText="Sell"
                linkHref="/"
            />

            <div className="sell-container">

                <div className="sell-header">
                    <h2 className="part-header">Add a New Product:</h2>
                    <ProductForm
                        initialData={null}
                        onSubmit={handleSubmit}
                        willRefresh={true}
                        readOnly={false}
                    />
                </div>

                <div className="sell-header">
                    <h2 className="part-header">Your Selling History:</h2>
                </div>

                <ul className="sell-products-list">
                    {products.map(product => (
                    <li key={product.id} className="product-item">
                        <ProductView
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        price={product.price}
                        showAddToCartButton={false}
                        />
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    )
};

export default withAuthProtection(Sell);
