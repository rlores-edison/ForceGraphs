import React from "react";

const NodeCard = ({
  node,
  get_color_for_node,
  graph_type,
  selected_node_group,
  on_close,
}) => {

  if (!node) return null;


  const nodeData = node[1] || {};


  const arrayNodeType = {
    standard: [
      "site",
      "instalacion",
      "instalZone",
      "tipoEquipo",
      "equip",
      "secEquip",
      "point",
    ],

    location_group: [
      "locationGroup",
      "site",
      "instalacion",
      "instalZone",
      "tipoEquipo",
      "equip",
      "secEquip",
      "point",
    ],

    bmslytics: ["bms", "station", "controller", "point"],
  };

  const defaultMarker = nodeData.markers.findIndex((item) =>
    arrayNodeType[graph_type].includes(item)
  );

  
  const FormDisplay = ({ data }) => {
    
    const handleCopy = (value) => {
      // Convert value from object to string
      const textToCopy =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : value;
      navigator.clipboard.writeText(textToCopy);
    };

    return (
      <form>
        {Object.entries(data).map(([key, value]) => {
          
          const shouldRenderMarkers =
            key === "markers" && Array.isArray(value) && value.length > 0;

          const shouldRenderInputField =
            key !== "markers" || (key === "markers" && shouldRenderMarkers);

          return (
            <div key={key} className="h-full">
              
              {shouldRenderInputField && (
                <label className="font-bold mr-4">{key}</label>
              )}


              {/* Button to copy data to clipboard */}
              {key.endsWith("Ref") && (
                <button
                  type="button"
                  onClick={() => handleCopy(value)}
                  className="bg-gray-200 hover:bg-blue-900 hover:text-white text-gray-600 py-1 px-3 rounded-lg ml-1"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              )}


              {/* Render markers as a bulleted list in two columns */}
              {shouldRenderMarkers ? (
                <div
                  className="border p-2 rounded w-full mt-1 mb-3 border-gray-300 bg-white"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px",
                  }}
                >
                  {value.map((marker, index) => (
                    <div key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{marker}</span>
                    </div>
                  ))}
                </div>

              ) : typeof value === "object" &&
                value !== null &&
                Object.keys(value).includes("fid") &&
                Object.keys(value).includes("repr") ? (
                <div className="border p-2 rounded w-full mt-1 mb-3 border-gray-300 bg-white">

                  {/* Row for fid */}
                  <div className="flex items-center mb-2">
                    <p className="font-bold mr-2">fid:</p>
                    <input
                      type="text"
                      value={value.fid}
                      readOnly
                      className="flex-grow p-1 rounded w-full"
                      title={value.fid}
                    />
                  </div>

                  {/* Row for repr */}
                  <div className="flex items-center">
                    <p className="font-bold mr-2">repr:</p>
                    <input
                      type="text"
                      value={value.repr}
                      readOnly
                      className="flex-grow p-1 rounded w-full"
                      title={value.repr}
                    />
                  </div>
                </div>

              ) : shouldRenderInputField ? (
                <input
                  type="text"
                  value={
                    typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : value
                  }
                  readOnly
                  className="border p-2 rounded w-full mt-1 mb-3 border-gray-300"
                />
              ) : null}
            </div>
          );
        })}
      </form>
    );
  };


  // Card title on top
  const widthName = (
    node,
    get_color_for_node,
    graph_type,
    selected_node_group
  ) => {
    // Split the name in two lines
    const firstLine = "locationGroup" in node && graph_type === "location_group" ? "locationGroup" : node.markers[defaultMarker];
    let secondLine = `${node.id}`;
   
    if (secondLine.length > 50) {
      secondLine = secondLine.substring(0, 47) + "...";
    }

    // Add color to the first line of card title - marker - based on node group
    const color = get_color_for_node[graph_type]?.[selected_node_group];

    return (
      <div className="text-center">
        <p>
          <span style={{ color, fontWeight: "bold" }}>{firstLine}</span>
        </p>
        <span>
          <p>{secondLine}</p>
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-gray-100 p-7 max-w-screen-lg w-full relative h-[74vh] flex flex-col">
        <div className="w-full pb-2 flex justify-center items-center ">
          <h1 id="modal-title" className="text-base font-bold mt-1">
            {widthName(
              nodeData,
              get_color_for_node,
              graph_type,
              selected_node_group
            )}
          </h1>
        </div>
        <div className="overflow-y-auto px-3">
          <FormDisplay data={nodeData} />
        </div>

        <button
          className="absolute top-1 right-2 text-gray-600 hover:text-black p-1"
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
