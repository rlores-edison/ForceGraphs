import { GoInfo } from "react-icons/go";
import WOPRLogo from "../assets/WOPRLogo.png";


// node is an object, passed as a prop
const Modal = ({ node, onClose }) => {
  if (!node) return null; // Don't render the modal if no node is selected

  return (
    <> 
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-screen-lg w-full relative min-h-[300px] max-h-[80vh] mt-10 overflow-y-auto overflow-x-hidden">
        <div className="bg-[#f5f7fa] shadow-sm border border-slate-300 rounded-lg p-7 relative min-h-[200px] max-h-[calc(100vh_-_100px)]">
          
          {/* Modal header with logo and node name */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <img alt="logo" src={WOPRLogo} className="w-9 h-9 mt-9" />
          </div>

          <div className="flex flex-col justify-center items-center mt-8">
            <h1 className="text-2xl font-bold">{node.name}</h1>
          </div>
          <h3>
            <GoInfo />
          </h3>

           {/* Node data in json format */}
          <div className="text-gray-700 mt-3">
            <pre>{JSON.stringify( node, null, 2 )}</pre>{" "}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center mt-6">
          <button
            className="rounded-lg w-96 h-10 bg-blue-900 text-white shadow-md hover:shadow-lg transition-all focus:opacity-85 active:opacity-85 disabled:opacity-50 disabled:pointer-events-none"
            onClick={onClose}
          >Close
          </button>
        </div>

        {/* Cross-icon for Closing */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 p-1"
          onClick={onClose}
        >
          &#x2715;
        </button>
      


      </div>
    </div>
    </>
  );
};

export default Modal;
