import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";

import { getCookie } from "../utils/utils";
import { BASE_URL } from "../utils/utils";

const Paypal = ({ productIDs, onCheckoutComplete}) => {
    const [orderIDs, setOrderIDs] = useState(null);
    const [products, setProducts] = useState([]);
    const orderIDsRef = useRef(orderIDs); // use useRef tracking the orderIDs state
    const productsRef = useRef(products); // use useRef tracking the products state

    axios.defaults.withCredentials = true;
    const csrfToken = getCookie('csrftoken');
    useEffect(() => {
        orderIDsRef.current = orderIDs; // update the ref when orderIDs state changes
    }, [orderIDs]);

    useEffect(() => {
        productsRef.current = products; // update the ref when products state changes
    }, [products]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!productIDs || productIDs.length === 0) {
                return;
            }
            const idsQueryParam = productIDs.join(',');
            try {
                const url = BASE_URL + `/scotty/products/?ids=${idsQueryParam}`;
                const response = await axios.get(url);
                setProducts(response.data);
            } catch (error) {
                toast.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, [productIDs]);

    const createOrder = async(data, actions) => {
        const currentProducts = productsRef.current;
        if (!currentProducts.length) {
            toast.error("No products to purchase.");
            onCheckoutComplete(false);
            return;
        }
    
        // Calculate the subtotal of the products
        const subtotal = currentProducts.reduce((total, product) => {
            return total + parseFloat(product.price);
        }, 0);
    
        // Calculate the service fee
        const serviceFee = subtotal * 0.05;
    
        const purchase_units = currentProducts.map(product => ({
            reference_id: product.id.toString(),
            description: product.description,
            amount: {
                currency_code: "USD",
                value: product.price.toString(),
            }
        }));
    
        // Add the service fee as a separate item
        const fee_unit ={
            reference_id: "fee",
            description: "Service Fee",
            amount: {
                currency_code: "USD",
                value: serviceFee.toFixed(2).toString(),
            }
        };

        const createOrderAPI = async (products) => {
            try {
                const url = BASE_URL + `/scotty/create-order/`;
                const data = {
                    product_ids: products.map(product => product.id),
                };
                const config = {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                };
                const response = await axios.post(url, data, config);
                setOrderIDs(response.data.order_ids);
                return true;
            } catch (error) {
                toast.error(`Error: ${error.response.data.error}`, {
                    duration: 6000,
                });
                return false;
            }
        };
        
        const orderCreatedSuccessfully = await createOrderAPI(currentProducts);
        if (!orderCreatedSuccessfully) {
            return;
        }
        
        return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [...purchase_units, fee_unit],
        });
    };
    
    

    const onApprove = (data, actions) => {
        const approveOrderAPI = async (orderIDs) => {
            try {
                const url = BASE_URL + `/scotty/approve-order/`;
                const data = {
                    order_ids: orderIDs,
                };
                const config = {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                };
                const response = await axios.post(url, data, config);
                setOrderIDs(null);
            } catch (error) {
                console.error('Error approving order in the backend:', error);
            }
        };
        return actions.order.capture().then(function (details) {
            toast.success('Payment completed. Thank you, ID: ' + details.id, {
                duration: 6000,
            });
            approveOrderAPI(orderIDsRef.current);
            onCheckoutComplete(true);
        });
    };

    const onCancel = () => {
        const cancelOrderAPI = async (orderIDs) => {
            try {
                const url = BASE_URL + `/scotty/cancel-order/`;
                const data = {
                    order_ids: orderIDs,
                };
                const config = {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                };
                const response = await axios.post(url, data, config);
                setOrderIDs(null);
            } catch (error) {
                console.error('Error cancelling order in the backend:', error);
            }
        }

        toast("You cancelled the payment. Try again by clicking the PayPal button", {
            duration: 6000,
        });
        cancelOrderAPI(orderIDsRef.current);
        onCheckoutComplete(false);
    };

    const onError = (err) => {
        // toast.error(`There was an error: ${err.message}`, {
        //     duration: 6000,
        // });
        onCheckoutComplete(false);
    };

    return (
        <div>
            <PayPalButtons
                style={{ layout: "horizontal" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={onCancel}
                onError={onError}
            />
        </div>
    );
};

export default Paypal;
