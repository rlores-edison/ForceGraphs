import React from "react";
import WOPRLogo from "../assets/WOPRLogo.png";


const Modal = ({ node, on_close }) => {
  if (!node) return null; // Don't render if no node selected

  // Close Modal when clicking outside of it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      on_close();
    }
  };

  // Access node data
  const nodeData = node ? node[1] : {};


// To place the correct Marker - by default - in markers dropdown list
  const arrayNodeType =["site","instalacion","instalZone","tipoEquipo","equip","secEquip","point"]; 
  
  const defaultMarker = nodeData.markers.findIndex(item => arrayNodeType.includes(item))
  

  // Function to render JSON data as form fields
  const FormDisplay = ({ data }) => {
    return (
      <form>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="form-field mb-2">
            <label className="font-bold">{key}</label>
          
            {key === "markers" && Array.isArray(value) ? (
              <select
              id="markers-list"
              defaultValue={nodeData.markers[defaultMarker]}
              className="border p-2 rounded w-full mt-1 border-gray-300">
                {value.map((marker, index)=>(<option key={index} value={marker}>
                  {marker}
                </option>
              ))}
              </select>
            ): typeof value === "object" && value !== null && value.fid && value.repr ? (
              <div className="border p-2 rounded w-full mt-1 border-gray-300 bg-gray-100">
              <p><strong>fid:</strong> {value.fid}</p>
              <p><strong>repr:</strong> {value.repr}</p>
            </div>
          ) : (         
            <input
              type="text"
              value={typeof value === "object" && value !== null ? JSON.stringify(value) : value}
              readOnly
              className="border p-2 rounded w-full mt-1 border-gray-300"/>
          )}
          </div>
        ))}
      </form>
    );
  };

  return (
    // Dark background overlay
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick} // Click handler to close Modal when clicking outside of it
    >
      {/* Modal */}
      <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-screen-lg w-full relative min-h-[430px] max-h-[90vh] mt-10 flex flex-col">
        
        {/* Modal Header with Logo */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <img alt="logo" src={WOPRLogo} className="w-9 h-9 mt-9" />
        </div>
        <div className="flex space-x-3 flex- justify-center items-center mt-8">
          <h1 id="modal-title" className="text-xl font-bold flex items-center">
          {nodeData.markers[defaultMarker]} : {nodeData.id} 
          </h1>
        </div>

        <div className="mt-2 px-6 w-auto h-0.5 bg-gray-300 flex-grow mb-4"></div>
        {/* JSON Data Display */}
        <div className="overflow-y-auto max-h-[60vh] px-4">
          <FormDisplay data={nodeData} />
        </div>
        

        {/* Close Icon */}
        <button
          className="absolute top-1 right-2 text-gray-600 hover:text-gray-800 p-1"
          onClick={on_close}
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        <div className="mt-0 px-6 w-auto h-0.5 bg-gray-300 flex-grow mb-2"></div>

        {/* Centered Close Button at Bottom */}
        <div className="flex flex-col items-center pt-1">
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
