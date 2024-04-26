import React from 'react';
import '../../static/css/Breadcrumb.css';

const Breadcrumb = ({ mainText, linkText, currentText, linkHref }) => {
  return (
    <div className="breadcrumb">
      <div className="big-text">{mainText}</div>
      <div className="links-container">
        <a href={linkHref}>{linkText}</a>
        <span className="divider">{'>'}</span>
        <div className="current">{currentText}</div>
      </div>
    </div>
  );
};

export default Breadcrumb;