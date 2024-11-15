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

  const FormDisplay = ({ data }) => (
    <form>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="form-field mb-1">
          <label className="font-bold">{key}</label>
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

  return (
    <div>
      <div
        className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-screen-lg w-full relative min-h-[430px] max-h-[90vh] mt-10 flex flex-col"
        style={{ height: `${graphHeight}px` }}
      >

        {/* Header title with animated sliding text (view tailwind.config.js) */}
        <div className="overflow-hidden whitespace-nowrap w-full pb-5">
          <h1
            id="modal-title"
            className="inline-block ml-3 text-base font-bold animate-marquee"
          >
            {nodeData.markers[defaultMarker]} : {nodeData.id}
          </h1>
        </div>


        <div className="mt-3"></div>
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

        <div className="flex row justify-center">
          <button
            className="rounded-lg w-full h-10 bg-blue-900 text-white shadow-md hover:shadow-lg transition-all mt-4"
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
