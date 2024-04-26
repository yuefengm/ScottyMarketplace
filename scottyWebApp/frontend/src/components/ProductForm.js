import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import '../../static/css/ProductForm.css';

const ProductForm = ({ initialData, onSubmit, willRefresh, readOnly }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [productImage, setProductImage] = useState(null);
    // Only support Paypal payment method for now
    const [paymentMethod, setPaymentMethod] = useState('Paypal');
    const [paypalEmail, setPaypalEmail] = useState(initialData?.paypal_email || '');

    const categoryOptions = [
        { value: 'cat1', label: 'Clothing & Apparel' },
        { value: 'cat2', label: 'Electronics' },
        { value: 'cat3', label: 'Home & Garden' },
        { value: 'cat4', label: 'Health & Beauty' },
        { value: 'cat5', label: 'Sports & Outdoors' },
    ];

    const refreshForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setProductImage(null);
        setPaypalEmail('');
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isNaN(parseFloat(price))) {
            toast.error('Price must be a valid number.');
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('availability', true);
        formData.append('paypal_email', paypalEmail);
        if (productImage) {
            formData.append('picture', productImage);
        }
        onSubmit(formData);
        toast.success('Product submitted successfully.');
        if (willRefresh) {
            refreshForm();
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="product-title">Product Title</label>
                    <input 
                        type="text" 
                        placeholder="Name" 
                        id="product-title"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        maxLength={50}
                        required 
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="product-description">Product Description</label>
                    <textarea 
                        placeholder="Description" 
                        id="product-description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        maxLength={500}
                        required 
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="product-price">Product Price</label>
                    <input 
                        type="text" 
                        placeholder="Price" 
                        id="product-price"
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        required 
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="product-category">Product Category</label>
                    <select 
                        id="product-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required>
                        <option value="">Select a category</option>
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="upload-image">Upload Image</label>
                    <input 
                        type="file" 
                        id="upload-image"
                        onChange={(e) => setProductImage(e.target.files[0])} 
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="payment-method-label">Payment Method: Paypal</label>
                </div>
                
                <div className="input-group">
                    <label htmlFor="paypal-email">Paypal Account</label>
                    <input 
                        type="text" 
                        placeholder="Your Paypal Email Address" 
                        id="paypal-email"
                        value={paypalEmail} 
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        maxLength={50}
                        required 
                    />
                </div>
                {readOnly ? null : (
                    <button type="submit">Submit Product</button>
                )}
            </form>
        </div>
    )
};

export default ProductForm;
