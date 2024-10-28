import WOPRLogo from "../assets/WOPRLogo.png";
import { JSONTree } from "react-json-tree";

// Customize JSONTree theme
const customTheme = {
  tree: {
    backgroundColor: "#F3F4F6",
  },
};

const ModalTest = ({ node, onClose, jsonData }) => {
  if (!node) return null; // Don't render if no node selected

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-screen-lg w-full relative min-h-[300px] max-h-[80vh] mt-10">
        
        {/* Modal Header with Logo */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <img alt="logo" src={WOPRLogo} className="w-9 h-9 mt-9" />
        </div>

        <div className="flex flex-col justify-center items-center mt-8">
          <h1 id="modal-title" className="text-2xl font-bold">{node.name} Node name</h1>
        </div>

        {/* JSON Data Display */}
        <div className="ml-4 mr-4 flex-1">
          <div className="overflow-y-auto max-h-[50vh] overflow-x-auto max-w-[90vw] p-2 whitespace-nowrap">
            <pre>
              {JSON.stringify(node, null, 2)}
              {jsonData && (
                <JSONTree
                  data={jsonData}
                  theme={customTheme}
                  invertTheme/>
              )}
            </pre>
          </div>
        </div>

        

        {/* Close Icon */}
        <button
          className="absolute top-1 right-2 text-gray-600 hover:text-gray-800 p-1"
          onClick={onClose}
          aria-label="Close modal"
        >
          &#x2715;
        </button>
      </div>
      {/* Close Button */}
      <div className="flex justify-center fixed bottom-12">
          <button
            className="rounded-lg w-96 h-10 bg-blue-900 text-white shadow-md hover:shadow-lg transition-all focus:opacity-85 active:opacity-85 disabled:opacity-50 disabled:pointer-events-none"
            onClick={onClose}
          >
            Close
          </button>
        </div>
    </div>
  );
};

export default ModalTest;
