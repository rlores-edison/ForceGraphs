import WOPRLogo from "../assets/WOPRLogo.png";
import { JSONTree } from "react-json-tree";

// Customize JSONTree theme
const customTheme = {
  tree: {
    backgroundColor: "#F3F4F6",
  },
};

const Modal = ({ node, on_close }) => {
  if (!node) return null; // Don't render if no node selected

  // Close Modal when clicking outside of it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      on_close();
    }
  };

  return (

    // Dark background
    <div
      className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick} // Click handler to close Modal when clicking outside of it
    >
      {/* Modal Content */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-screen-lg w-full relative min-h-[430px] max-h-[90vh] mt-10 flex flex-col">
        {/* Modal Header with Logo */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <img alt="logo" src={WOPRLogo} className="w-9 h-9 mt-9" />
        </div>


        <div className="flex flex-col justify-center items-center mt-8">
          <h1 id="modal-title" className="text-2xl font-bold">
            {" "}
            Node name
          </h1>
          <hr className="h-px w-full max-w-xs my-4 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>

        {/* JSON Data Display */}
        <div className="ml-4 mr-4 flex-1 overflow-y-auto max-h-[50vh] overflow-x-auto max-w-[90vw] p-2 whitespace-nowrap">
          {node && <JSONTree data={node} theme={customTheme} />}
        </div>

        {/* Close Icon */}
        <button
          className="absolute top-1 right-2 text-gray-600 hover:text-gray-800 p-1"
          onClick={on_close}
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        {/* Centered Close Button at Bottom */}
        <div className="flex flex-col items-center mt-8">
          <hr className="h-px w-full max-w-xs my-4 bg-gray-200 border-0 dark:bg-gray-700" />
          <button
            className="rounded-lg w-96 h-10 bg-blue-900 text-white shadow-md hover:shadow-lg transition-all focus:opacity-85 active:opacity-85 disabled:opacity-50 disabled:pointer-events-none"
            onClick={on_close}
          >
            Close
          </button>
        </div>


      </div>
    </div>
  );
};

export default Modal;
