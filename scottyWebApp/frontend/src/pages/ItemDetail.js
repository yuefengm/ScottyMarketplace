import React, { useEffect, useState } from 'react';
import { useParams,  useNavigate, Link} from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { BASE_URL, getCookie } from '../utils/utils';
import { withAuthProtection } from '../utils/withAuthProtection';
import { handleAddToCart } from '../utils/cartUtils';

import PayPal from "../components/PayPal";
import Breadcrumb from '../components/Breadcrumb';
import ProductForm from '../components/ProductForm';
import CommentsList from '../components/CommentsList';
import { findLabel } from '../components/Categories';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons'; // 'Add to Cart' icon

import '../../static/css/ItemDetail.css';

const ItemDetail = () => {
    let { productId } = useParams();
    const [userId, setUserId] = useState(''); 
    const [sellerName, setSellerName] = useState(''); // Initialize `sellerName`
    const [product, setProduct] = useState(null); // Initialize `product`
    const [comments, setComments] = useState([]); // Initialize `comments`
    const [subComments, setSubComments] = useState([]); // Initialize `subComments`
    const [addCartMessage] = useState(''); // Initialize `addCartMessage`
    
    const [checkout, setCheckOut] = useState(false);

    axios.defaults.withCredentials = true;

    const onAddToCartResult = (result) => {
        if (!result.success) {
            toast.error(result.message);
        } else {
            toast.success(result.message);
        }
    };
    
    const navigate = useNavigate();
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
    }, []); // Empty dependency array ensures this effect runs only once

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            try {
                const productResponse = await axios.get(`${BASE_URL}/scotty/products/${productId}`);
                setProduct(productResponse.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            }

        };
        const fetchComments = async () => {
            if (!productId) return;
            try {
                const commentsResponse = await axios.get(`${BASE_URL}/scotty/comments/?product=${productId}`);
                setComments(commentsResponse.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchProduct();
        fetchComments();
        const intervalId = setInterval(fetchComments, 3000);
        return () => clearInterval(intervalId);
    }, [productId]);

    useEffect(() => {
        const fetchSubComments = async () => {
            try {
            const commentIDs = comments.map(comment => comment.id);
            const response = await axios.get(`${BASE_URL}/scotty/fetch-subcomments/?comment_ids=${JSON.stringify(commentIDs)}`);
            setSubComments(response.data);
            } catch (error) {
            console.error('Error fetching sub-comments:', error);
            }
        };

        if (comments.length > 0) {
            fetchSubComments();
        }
    }, [comments]);
    
    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const response = await axios.get(BASE_URL + `/scotty/profile/${product.seller}`);
                setSellerName(response.data.username);
            } catch (error) {
                console.error('Error fetching seller:', error);
            }
        }

        if (product) {
            fetchSeller();
        }
    }, [product]); // Include `product` as a dependency so it refetches when the product changes

    const handleUpdateSubmit = async (formData) => {        
        try {
            await axios.put(BASE_URL + `/scotty/products/${productId}/`, formData, {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate(`/shop/product/${productId}`);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(BASE_URL + `/scotty/products/${productId}`, {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });
            navigate('/shop')
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handlePostComment = async (replyCommentID,formData) => {
        let url = "";
        if (replyCommentID === -1) {
            formData.append('product', productId);
            url = BASE_URL + '/scotty/comments/';
        } else {
            url = BASE_URL + `/scotty/subcomments/`;
        }
        
        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                }
            });

            //update comments/subcomments
            if (replyCommentID === -1) {
                setComments([...comments, response.data]);
            } else {
                setSubComments(prevSubComments => ({
                    ...prevSubComments,
                    [replyCommentID]: [...(prevSubComments[replyCommentID] || []), response.data]
                }));
            }
        } catch (error) {
            console.error('Error posting new comment:', error);
        }
    }

    const FeeToast = ({ id, text }) => (
        <div>
          {text}
          <button onClick={() => toast.dismiss(id)} style={{ marginLeft: '10px' }}>
            Close
          </button>
        </div>
      );

    const showFeeToast = () => {
        const toastId = toast((t) => (
          <FeeToast id={t.id} text="Your total will include an additional 5% fee, broken down as follows: a 3.5% service fee by PayPal and a 1.5% operational fee by ScottyMarketplace." />
        ), {
            duration: Infinity,
            position: 'top-center',
        });
    };

    const onCheckoutComplete = (success) => {
        setCheckOut(false);
    };
    
    // Handle Loading or error message
    if (!product) {
        return <div>Loading...</div>;
    }

    const isSeller = userId && product.seller === userId;
    return (
        <div>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
            <Breadcrumb 
                mainText="Product Details" 
                linkText="Home" 
                currentText="Product Details" 
                linkHref="/" 
            />
            <div className='detail-container'>
                {product.picture && (
                    // Use a timestamp to force the browser to reload the image
                    <div className="left-panel">
                        <img src={BASE_URL + `/scotty/productphoto/${product.id}?${new Date().getTime()}`} alt={product.name} style={{ width: '400px', height: '400px' }}/>
                    </div>)}
                {isSeller ? (
                    <div className='right-panel'>
                        <ProductForm initialData={product} onSubmit={handleUpdateSubmit} willRefresh={false} readOnly={!product.availability}/>
                        {product.availability && (
                            <button onClick={handleDelete}>Delete</button>
                        )}
                    </div>
                ) : (
                    <div className='right-panel'>
                        <h2 style={{ marginBottom: '10px' }}>{product.name}</h2>
                        <dl className="product-details">
                            <dt>Category:</dt>
                            <dd><strong>{findLabel(product.category)}</strong></dd>

                            <dt>Description:</dt>
                            <dd><strong>{product.description}</strong></dd>

                            <dt>Seller:</dt>
                            <dd><Link to={`/profile/${product.seller}`}>
                                <span><strong>{sellerName}</strong></span>
                            </Link></dd>
                                
                            <dt>Price:</dt>
                            <dd className="product-price"><strong>${product.price}</strong></dd>
                        </dl>
                        {!product.availability ? (
                            <button className="btn btn-secondary add-to-cart-button">
                                <FontAwesomeIcon icon={faCartPlus} className="icon"/> Out of Stock
                            </button>
                        ) : (
                            <div>
                                <button onClick={() => handleAddToCart(product.id,product.seller, onAddToCartResult, userId)} className="btn btn-primary add-to-cart-button">
                                    <FontAwesomeIcon icon={faCartPlus} className="icon"/> Add to Cart
                                </button>
                            
                                {checkout ? (
                                <PayPal productIDs={[productId]} onCheckoutComplete={onCheckoutComplete}/>
                                ) : (
                                <button
                                    className="btn buy-now-button"
                                    onClick={() => {
                                    setCheckOut(true);
                                    showFeeToast();
                                    }}
                                >
                                    Buy Now
                                </button>
                                )}
                            </div>
                        )}
                        {addCartMessage && <span>{addCartMessage}</span>}
                    </div>
                )}
            </div>
            <div style={{ padding: '20px' }}>
                <CommentsList comments={comments} subComments={subComments} onSubmit={handlePostComment}/>
            </div>
        </div>
    );
};

export default withAuthProtection(ItemDetail);
