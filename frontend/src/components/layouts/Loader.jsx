import React from "react";

import "../style/loader.css";

function Loader() {
  return (
    <div className="loader-container">
      <div className="three-body">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
}

export default Loader;
