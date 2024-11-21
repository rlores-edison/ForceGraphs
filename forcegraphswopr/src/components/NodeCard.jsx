import React from "react";

const NodeCard = ({
  node,
  grouped_markers,
  get_color_for_node,
  graph_type,
  selected_node_group,
  on_close,
}) => {
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
      // Convert value from object to string
      const textToCopy =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : value;
      navigator.clipboard.writeText(textToCopy);
    };

    return (
      <form>
        {Object.entries(data).map(
          ([key, value]) => (
            console.log(key, value),
            (
              <div key={key} className="h-full">
                <label className="font-bold mr-4">{key}</label>

                {/* Button to copy data to clipboard */}
                {[
                  "instalacionRef",
                  "siteRef",
                  "tipoEquipoRef",
                  "instalZoneRef",
                  "fid",
                  "equipRef",
                  "secEquipRef",
                  "cleanRef",
                ].includes(key) && (
                  <button
                    type="button"
                    onClick={() => handleCopy(value)}
                    className="bg-gray-200 hover:bg-blue-900 hover:text-white text-gray-600 py-1 px-3 rounded-lg ml-1"
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                )}

                {/* Dropdown list for markers, with node marker as default */}
                {key === "markers" && Array.isArray(value) ? (
                  <select
                    id="markers-list"
                    defaultValue={nodeData.markers[defaultMarker]}
                    className="border p-2 rounded w-full mt-1 mb-3 border-gray-300 bg-white"
                  >
                    {value.map((marker, index) => (
                      <option key={index} value={marker}>
                        {marker}
                      </option>
                    ))}
                  </select>
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
                        title={value.fid} // Tooltip for full visibility on hover
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
                        title={value.repr} // Tooltip for full visibility on hover
                      />
                    </div>
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
                    className="border p-2 rounded w-full mt-1 mb-3 border-gray-300"
                  />
                )}
              </div>
            )
          )
        )}
      </form>
    );
  };

  // Card title
  const widthName = (
    node,
    get_color_for_node,
    graph_type,
    selected_node_group
  ) => {
    const name = node.markers[defaultMarker];
    let id = node.id;

    // Split the name into two lines
    const firstLine = `${name}`;
    const secondLine = `${id}`;
    if (id.length > 50) {
      id = id.substring(0, 47) + "...";
    }
    // Add color to the first line of card title - marker - based on the node group
    const color = get_color_for_node[graph_type]?.[selected_node_group];
    return (
      <div className="text-center">
        <p>
          <span style={{ color, fontWeight: "bold" }}>{name}</span>
        </p>
        <span>
          <p>{id}</p>
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
