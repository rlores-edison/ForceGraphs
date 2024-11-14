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
      navigator.clipboard.writeText(value);
      alert("Copied!");
    };

    return (
      <form>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="form-field mb-1 flex items-center">
            <label className="font-bold mr-2">{key}</label>
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
              <div className="flex w-full items-center">
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
                {(key === "instalacionRef" || key === "siteRef") && (
                  
                  <div class="text-center min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
                  <button
                    type="button"
                    onClick={() => handleCopy(value)}
                    className="text-indigo-500 background-transparent font-bold uppercase px-3 py-1 text-xs outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
            With Text
            </button>			
              </div>
            )}
          </div>
        ))}
      </form>
    );
  };

  return (
    <div
      className="flex justify-right z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-screen-lg w-full relative min-h-[430px] max-h-[90vh] mt-10 flex flex-col"
        style={{ height: `${graphHeight}px` }}
      >
        {/* Header title with animated sliding text (view tailwind.config.js) */}
        <div className="overflow-hidden whitespace-nowrap w-full">
          <h1
            id="modal-title"
            className="inline-block ml-3 text-base font-bold animate-marquee"
          >
            {nodeData.markers[defaultMarker]} : {nodeData.id}
          </h1>
        </div>

        <div className="mt-3"></div>
        <div className="overflow-y-auto max-h-[70vh] px-3">
          <FormDisplay data={nodeData} />
        </div>
        <button
          className="absolute top-1 right-2 text-gray-600 hover:text-gray-800 p-1"
          onClick={on_close}
          aria-label="Close modal"
        >
          &#x2715;
        </button>

        <div className="flex row justify-center mt-3">
          <button
            className="rounded-lg w-96 h-10 bg-blue-900 text-white shadow-md hover:shadow-lg transition-all mt-2"
            onClick={on_close}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeCard;
