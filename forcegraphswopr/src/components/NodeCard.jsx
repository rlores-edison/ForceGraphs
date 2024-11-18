import React from "react";

const NodeCard = ({ node, on_close, graphHeight }) => {
  if (!node) return null;

  const nodeData = node[1] || {};
  const arrayNodeType = [
    "site",
    "instalacion",
    "instalZone",
    "tipoEquipo",
    "equip",
    "secEquip",
    "point",
  ];
  const defaultMarker = nodeData.markers.findIndex((item) =>
    arrayNodeType.includes(item)
  );

  const FormDisplay = ({ data }) => {
    const handleCopy = (value) => {
      // Convert value to a string if it's an object
      const textToCopy =
        typeof value === "object" && value !== null ? JSON.stringify(value) : value;
      navigator.clipboard.writeText(textToCopy);
      //alert(`Copied to clipboard: ${textToCopy}`);
    };


    return (
      <form>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="form-field mb-1 display-flex">
            <label className="font-bold mr-2">{key}</label>


            {/* Button to copy data in input to clipboard */}
            {(key === "instalacionRef" || key === "siteRef" || key === "tipoEquipoRef" || key === "instalZoneRef" || key === "fid") && (
              <button
                type="button"
                onClick={() => handleCopy(value)}
                className="bg-gray-200 hover:bg-blue-900 hover:text-white text-gray-600 py-1 px-3 rounded-lg ml-1"
                title="Copy to clipboard"
              >
                Copy
              </button>
            )}
  
            {key === "markers" && Array.isArray(value) ? (
              <select
                id="markers-list"
                defaultValue={nodeData.markers[defaultMarker]}
                className="border p-2 rounded w-full mt-1 mb-3 border-gray-300 bg-white overflow-x-auto break-word"
              >
                {value.map((marker, index) => (
                  <option key={index} value={marker}>
                    {marker}
                  </option>
                ))}
              </select>
            ) : typeof value === "object" &&
              value !== null &&
              value.fid &&
              value.repr ? (
              <div className="border p-2 rounded w-full mt-1 mb-3 border-gray-300 bg-white overflow-x-auto break-word">
                <p>
                  <strong>fid:</strong> {value.fid}
                </p>
                <p>
                  <strong>repr:</strong> {value.repr}
                </p>
              </div>
            ) : (
              <input
                type="text"
                value={
                  typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : value
                }
                readOnly
                className="border p-2 rounded w-full border-gray-300 mt-1 mb-3"
              />
            )}
          </div>
        ))}
      </form>
    );
  };


  const widthName = (node) => {

    let name = node.markers[defaultMarker] + ": " + node.navName;
    if (name.length > 50) {
      name = name.substring(0, 27) + '...';
    }

    return name;
  };

  
  return (
    <div>
      <div
        className="bg-gray-100 p-8 shadow-lg max-w-screen-lg w-full relative min-h-[430px] max-h-[90vh] flex flex-col"
      >
        {/* Header title */}
        <div className="w-full pb-5 flex justify-center items-center overflow-hidden whitespace-nowrap">
          <h1
            id="modal-title"
            className="text-base font-bold mt-2"
          >
              {widthName(nodeData)}
          </h1>
        </div>

        <div className="overflow-y-auto max-h-[75vh] px-3">
          <FormDisplay data={nodeData} />
        </div>

        <button
          className="absolute top-1 right-2 text-gray-500 hover:text-gray-900 p-1"
          onClick={on_close}
          aria-label="Close modal"
        >
          &#x2715;
        </button>
      </div>

    </div>
  );
};

export default NodeCard;
