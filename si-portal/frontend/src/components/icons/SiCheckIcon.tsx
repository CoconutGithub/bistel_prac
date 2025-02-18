import React from "react";

const SiCheckIcon = ({
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
      className="bi bi-check2"
      viewBox="0 0 16 16"
    >
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />{" "}
    </svg>
  );
};

export default SiCheckIcon;
