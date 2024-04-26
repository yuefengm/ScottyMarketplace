import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/utils';
import axios from 'axios';

import '../../static/css/Comments.css';

const Comment = ({ commentID, user, creationTime, text, onReply }) => {
    const [currentUserId, setUserId] = useState(''); 
    const [isHovered, setIsHovered] = useState(false);
    const formattedTime = new Date(creationTime).toLocaleString();

    const handleReply = () => {
        onReply({ commentID: commentID, receiverID: user.id });
        window.scrollTo(0, document.body.scrollHeight);
    }

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

    const linkToProfile = user.id === currentUserId;
    return (
        <li className="comment" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >   
            <div className='comment-username'>
                {linkToProfile ? (
                    <Link to={`/myprofile`}>
                        <dd>{user.username}</dd>
                    </Link>
                ) : (
                    <Link to={`/profile/${user.id}`}>
                        <dd>{user.username}</dd>
                    </Link>
                )}
            </div>

            <div className='comment-content'>
                <p className="comment-timestamp">{formattedTime}</p>
                <p className="comment-text">{text}</p>
            </div>
            {isHovered && (
                <button onClick={ handleReply }>reply</button>
            )}
        </li>
    );
};

const SubComment = ({ commentID, fromUser, toUser, creationTime, text, onReply }) => {
    const [currentUserId, setUserId] = useState(''); 
    const [isHovered, setIsHovered] = useState(false);
    const formattedTime = new Date(creationTime).toLocaleString();

    const handleReply = () => {
        onReply({ commentID: commentID, receiverID: fromUser.id });
        window.scrollTo(0, document.body.scrollHeight);
    }
    const linkToProfile = toUser.id === currentUserId;
    const linkFromProfile = fromUser.id === currentUserId;

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
  
    return (
        <li className="comment"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >   
            <div className="subcomment-username">
                {linkFromProfile ? (
                    <Link to={`/myprofile`}>
                        <span>{fromUser.username}</span>
                    </Link>
                ) : (
                    <Link to={`/profile/${fromUser.id}`}>
                        <span>{fromUser.username}</span>
                    </Link>
                )}
                <span> reply to </span>
                {linkToProfile ? (
                    <Link to={`/myprofile`}>
                        <span>{toUser.username}</span>
                    </Link>
                ) : (
                    <Link to={`/profile/${toUser.id}`}>
                        <span>{toUser.username}</span>
                    </Link>
                )}
            </div>
            <div className='comment-content'>
                <p className="comment-timestamp">{formattedTime}</p>
                <p className="comment-text">{text}</p>
            </div>
            {isHovered && (
                <button onClick={ handleReply }>reply</button>
            )}
        </li>
    );
}

const NewComment = ({replyCommentID, receiverID, onSubmit, onComlete}) => {
    const [comment, setComment] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [receiverName, setReceiverName] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = BASE_URL + `/scotty/users/${receiverID}`;
                const response = await axios.get(url);
                setReceiverName(response.data.username);
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        console.log('Fetching user info for:', receiverID);
        if (receiverID !== null) {
            fetchUser();
        }
        
    }, [receiverID]);

    const handleNewComment = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('text', comment);
        if (replyCommentID !== -1) {
            formData.append('comment', replyCommentID)
            formData.append('to_user', receiverID);
        }
        onSubmit(replyCommentID, formData);
        onComlete();
        setComment('');
    }

    const changeToPost = () => {
        onComlete();
    }

    return (
        <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
            <form onSubmit={handleNewComment} className="comment-form">
                {replyCommentID !== -1 ? (
                    <label htmlFor="new-comment">Reply to {receiverName}</label>
                ) : (
                    <label htmlFor="new-comment">New Comment</label>
                )}
                {isHovered && replyCommentID !== -1 &&(
                    <button onClick={ changeToPost }>Reply to the Product Post</button>
                )}
                <textarea 
                    placeholder="Make a comment..." 
                    id="new-comment"
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    required 
                />
                {replyCommentID !== -1 ? (
                    <button className="comment-button" type="submit">Reply</button>
                ) : (
                    <button className="comment-button" type="submit">Post</button>
                )}
            </form>
        </div>
    )
};
  
const CommentsList = ({ comments, subComments, onSubmit }) => {
    const [replyCommentID, setReplyCommentID] = useState(-1);
    const [replyTo, setReplyTo] = useState(null);

    useEffect(() => {
        console.log('Replying to:', replyTo);
    }, [replyTo]);

    const conditionalReply = ({commentID, receiverID}) => {
        setReplyCommentID(commentID);
        setReplyTo(receiverID);
    }
    return (
        <ul className='comment-list-panel'>
            {comments.map(comment => (
                <li key={comment.id} className='comment-panel'>
                    <Comment
                        commentID={comment.id}
                        user={comment.user}
                        creationTime={comment.creation_time}
                        text={comment.text}
                        onReply={conditionalReply}
                    />
                    <ul>
                        {subComments[comment.id] && subComments[comment.id].map(subComment => (
                            <li key={subComment.id} className='sub-comment-panel'>
                                <SubComment
                                    commentID={comment.id}
                                    fromUser={subComment.from_user}
                                    toUser={subComment.to_user}
                                    creationTime={subComment.creation_time}
                                    text={subComment.text}
                                    onReply={conditionalReply}
                                />
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
            <NewComment 
                replyCommentID={replyCommentID}
                receiverID={replyTo}
                onSubmit={onSubmit} 
                onComlete={() => {
                    setReplyCommentID(-1);
                    setReplyTo(null);
                }}
            />
        </ul>
    )
};


export default CommentsList;

