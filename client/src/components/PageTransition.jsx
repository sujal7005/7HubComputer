import React from 'react';
import { CSSTransition } from 'react-transition-group';
import './PageTransition.css'; // Import your CSS for transitions

const PageTransition = ({ children, nodeRef, in: inProp = false, ...props }) => (
  <CSSTransition
   nodeRef={nodeRef} 
   in={inProp}
   timeout={300} 
   classNames="fade"
   {...props}
   >
    <div ref={nodeRef}>{children}</div>
  </CSSTransition>
);

export default PageTransition;