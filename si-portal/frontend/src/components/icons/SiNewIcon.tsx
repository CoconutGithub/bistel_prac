import React from "react";

const SiNewIcon = ({
  fillColor = "black",
  width = 16,
  height = 16,
  currentFill = false,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={currentFill ? "currentColor" : fillColor}
      className="bi bi-plus-lg si-new-icon"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
      />
    </svg>
  );
};

export default SiNewIcon;
