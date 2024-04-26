import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

import { withAuthProtection } from "../utils/withAuthProtection";
import Breadcrumb from "../components/Breadcrumb";
import HorizontalScrollList from "../components/HorizontalScrollList";
import ProductView from "../components/ProductView";
import { BASE_URL } from "../utils/utils";

import '../../static/css/Shop.css';

const Shop = () => {
    // State variable to store the fetched products
    let { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [userId, setUserId] = useState('');
    const onAddToCartResult = (result) => {
        if (!result.success) {
            toast.error(result.message);
        } else {
            toast.success(result.message);
        }
    };
    
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
        try {
            let response = null;
            if (categoryId) {
                response = await axios.get(BASE_URL + `/scotty/products/?category=cat${categoryId}`);
            } else {
                response = await axios.get(BASE_URL + '/scotty/products/');
            }
            // Update the state with the fetched products
            setProducts(response.data);
        } catch (error) {
            // Handle errors, such as network errors or API errors
            console.error('Error fetching products:', error);
        }
        };

        // Call the fetchProducts function when the component mounts
        fetchProducts();
    }, [categoryId]);

    return (
        <div>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
            <Breadcrumb 
                mainText="Shop" 
                linkText="Home" 
                currentText="Shop" 
                linkHref="/" 
            />
            <HorizontalScrollList />
            <ul className="products-list">
                {products.map(product => (
                    product.availability ? (
                        <div key={product.id}>
                            <ProductView 
                                id={product.id} 
                                productOwnerId={product.seller}
                                name={product.name} 
                                description={product.description} 
                                price={product.price} 
                                onAddToCartResult={onAddToCartResult}
                                showAddToCartButton={true}
                                userId={userId}
                            />
                        </div>
                        
                    ) : null
                ))}
            </ul>


        </div>
    )
};

export default withAuthProtection(Shop);