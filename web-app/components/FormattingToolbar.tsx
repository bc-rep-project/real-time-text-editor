
"use client";
"use client";
const FormattingToolbar = ({ onFormat }) => {
  return (
    <div>
      <button onClick={() => onFormat('bold')}>Bold</button>
      <button onClick={() => onFormat('italic')}>Italic</button>
      <button onClick={() => onFormat('underline')}>Underline</button>
    </div>
  );
};

export default FormattingToolbar;
