import React, { useEffect, useState, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
import dagre from "@dagrejs/dagre";
import NodeCard from "./NodeCard.jsx";

const Graph = ({
  json_data,
  background_color,
  label_color,
  link_color,
  graph_type,
}) => {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [graphDataFull, setGraphDataFull] = useState({ nodes: [], links: [] });
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [nodeJsonFound, setNodeJsonFound] = useState(null);

  // State to store the Ids of right-clicked nodes
  const [selectedNodeId, setSelectedNodeId] = useState([]);
  const [selectedNodeGroup, setSelectedNodeGroup] = useState([]);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize); // Clean up the event listener
  }, []);

  var extraWidth = 0;

  useEffect(() => {
    if (json_data && Object.keys(json_data).length > 0) {
      const adaptedData = adaptDbToGraph(json_data, groupedMarkers, graph_type);
      setGraphDataFull(adaptedData);

      // Filter to show only "group1" nodes initially
      const graph_data = {
        nodes: adaptedData.nodes
          .filter((node) => node.group === "group1")
          .map((node) => ({ ...node })),
        links: [],
      };

      setGraphData(getLayout(graph_data));

      const collapsed_nodes = {};
      graph_data.nodes.forEach((node) => {
        collapsed_nodes[node.id] = true;
      });

      setCollapsedNodes(collapsed_nodes);
    }
  }, [json_data, graph_type]);

  // Adapt to different data structures
  const groupedMarkers = {
    standard: {
      group1: ["site"],
      group2: ["instalacion"],
      group3: ["instalZone"],
      group4: ["tipoEquipo"],
      group5: ["equip"],
      group6: ["secEquip"],
      group7: ["point"],
    },

    location_group: {
      group1: ["locationGroup"],
      group2: ["site"],
      group3: ["instalacion"],
      group4: ["instalZone"],
      group5: ["tipoEquipo"],
      group6: ["equip"],
      group7: ["secEquip"],
      group8: ["point"],
    },

    bmslytics: {
      group1: ["bms"],
      group2: ["station"],
      group3: ["controller"],
      group4: ["point"],
    },
  };

  const groupToMarkerMap = Object.entries(groupedMarkers[graph_type]).reduce(
    (acc, [group, markers]) => {
      markers.forEach((marker) => {
        acc[group] = marker; // Reverse mapping of groupedMarkers to make it easy to access the marker by the node.group to display the marker in the node label.
      });
      return acc;
    },
    {}
  );

  const getColorForNode = {
    standard: {
      group1: "#812921",
      group2: "#0c63ef",
      group3: "#f4bb00",
      group4: "#85db15",
      group5: "#79e5f5",
      group6: "#9200f4",
      group7: "#e61806",
    },
    location_group: {
      group1: "#0d9488",
      group2: "#812921",
      group3: "#0c63ef",
      group4: "#f4bb00",
      group5: "#85db15",
      group6: "#79e5f5",
      group7: "#9200f4",
      group8: "#e61806",
    },
    bmslytics: {
      group1: "#84cc16",
      group2: "#c026d3",
      group3: "#7c3aed",
      group4: "#e61806",
    },
  };

  

  // Function to adapt the database data into the graph format
  const adaptDbToGraph = (json_data, groupedMarkers, graph_type) => {
    const nodes = [];
    const links = [];
    const existingLinks = new Set();

    // Get the last group dynamically from groupedMarkers for the current graph_type
    const groupKeys = Object.keys(groupedMarkers[graph_type]);
    const lastGroup = groupKeys[groupKeys.length - 1]; // identify it for parents' links (secEquip & equip) logic for point nodes
 
    Object.entries(json_data).forEach(([key, item]) => {
      // Validate item structure
      if (!item.fid) {
        console.error("Skipping item with missing fid:", item);
        return;
      }
    
      // Determine the node type based on markers and group type
      const nodeType = groupKeys.find((group) =>
        groupedMarkers[graph_type][group]?.some((marker) =>
          item.markers?.includes(marker)
        )
      ) || (item.markers?.length === 0 && "group1");



      const getParentGroup = (nodeType, item, groupedMarkers, graph_type) => {
        // Retrieve all groups for the current graph type
        const keys = Object.keys(groupedMarkers[graph_type]);
      
        // Find the index of the current group
        const currentGroupIndex = keys.indexOf(nodeType);
      
        if (currentGroupIndex === -1) {
          console.warn(`NodeType ${nodeType} not found in groupedMarkers for graph_type: ${graph_type}`);
          return null;
        }
      
        if (currentGroupIndex === 0) {
          // If it's the first group, no parent exists
          console.log(`No parent group for the first group: ${nodeType}`);
          return null;
        }
      
        // Get the previous group in the sequence
        const previousGroup = keys[currentGroupIndex - 1];
        const previousMarkers = groupedMarkers[graph_type][previousGroup];
      
        if (!previousMarkers || previousMarkers.length === 0) {
          console.warn(`No markers found for the previous group ${previousGroup}`);
          return null;
        }
      
        // Check the item for references based on the previous group's marker
        for (const marker of previousMarkers) {
          const refKey = `${marker}Ref`; // Construct reference key dynamically
          console.log(`Checking reference key: ${refKey} for marker: ${marker}`);
      
          if (item[refKey]?.fid) {
            console.log(`Found reference for marker: ${marker}, key: ${refKey}, fid: ${item[refKey].fid}`);
            return item[refKey].fid; // Return the reference ID if found
          }
        }
      };
    
      if (!nodeType) {
        console.warn("No nodeType determined for item:", key, item);
        return; // Skip items with no matching node type
      }
    
      let parent = null;
    
      if (graph_type === "standard" || graph_type === "location_group") {
        // Use secEquipRef or equipRef logic for the last groups: point
        const groupKeys = Object.keys(groupedMarkers[graph_type]);
        const lastGroup = groupKeys[groupKeys.length - 1];
    
        if (nodeType === lastGroup) {
          // Check for secEquipRef first, then fallback to equipRef to resolve parent for "point"
          parent = item.secEquipRef?.fid || item.equipRef?.fid || null;
    
          // If secEquip exists, add a link from equip to secEquip
          if (item.secEquipRef) {
            const equipParent = item.equipRef?.fid || null;
            if (equipParent) {
              const equipLinkKey = `${equipParent}-${item.secEquipRef.fid}`;
              if (!existingLinks.has(equipLinkKey)) {
                links.push({
                  source: equipParent,
                  target: item.secEquipRef.fid,
                  group: "secEquip",
                });
                existingLinks.add(equipLinkKey);
              }
            }
          }
        } else if (nodeType === "group6") {
          if (graph_type === "standard") {
            // Handle "secEquip" logic for standard graph_type
            parent = item.equipRef?.fid || null; // Equip is parent of secEquip
          } else if (graph_type === "location_group") {
            // Handle "equip" logic for location_group graph_type
            parent = item.instalZoneRef?.fid || null; // Example: Adjust based on location_group structure
          } else {
            console.warn(
              `Unhandled logic for group6 in graph_type: ${graph_type}`
            );
            parent = null;
          }
        } else {
          // Resolve parent dynamically for all groups
          parent = getParentGroup(nodeType, item, groupedMarkers, graph_type);
        }
      } else if (graph_type === "bmslytics") {
        const groupKeys = Object.keys(groupedMarkers[graph_type]);
        const currentGroupIndex = groupKeys.indexOf(nodeType);
    
        if (currentGroupIndex > 0) {
          // Sequential parent resolution for bmslytics
          const parentGroup = groupKeys[currentGroupIndex - 1];
          const markerKey = groupedMarkers[graph_type][parentGroup]?.[0];
          if (markerKey) {
            parent = item[`${markerKey}Ref`]?.fid || null;
          }
        }
      }
    
      // Add the current node to the nodes array
      nodes.push({
        id: item.fid,
        name: item.navName || item.id || item.locationGroup,
        group: nodeType,
        parent,
      });
    
      // Add a link to the parent, if it exists
      if (parent) {
        const linkKey = `${parent}-${item.fid}-${nodeType}`;
        if (!existingLinks.has(linkKey)) {
          links.push({ source: parent, target: item.fid, group: nodeType });
          existingLinks.add(linkKey);
        }
      }
    });
    
    return { nodes, links };
  }
  

  const textWidth = (text) => {
    // Create a temporary canvas to perform the measurement
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Setting the font style
    const fontSize = 12; // Size in pixels
    ctx.font = `${fontSize}px Arial, Sans-Serif`;

    return ctx.measureText(text).width;
  };

  // Function to calculate the positions of nodes using dagre
  const getLayout = ({ nodes, links }) => {
    // Initialize dagre
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      rankdir: "TB", // Direction of the graph, in this case top to bottom
      nodesep: 60, // Minimum horizontal spacing between nodes, in units of pixels
      ranksep: 20, // Minimum vertical spacing between graph levels, in units of pixels
      edgesep: 50, // Minimum spacing between edges (links or connections)
    });

    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => {
      //Add nodes and set default width/height
      graph.setNode(node.id, { width: 20, height: 30 });
    });

    links.forEach((link) => {
      //Add edges
      graph.setEdge(link.source, link.target);
    });

    dagre.layout(graph); //Run the layout

    /* Adjust number of rows in last branch */
    // Step 1: Find the maximum value of 'y'
    const maxY = Math.max(
      ...Object.values(graph["_nodes"]).map((item) => item.y)
    );

    // Step 2: Filter items with the maximum value of 'y'
    const elementsWithMaxY = Object.entries(graph["_nodes"]).filter(
      ([key, value]) => value.y === maxY
    );

    // Step 3: Filter items with 'y' value less than the maximum value
    const elementsLTMaxY = Object.entries(graph["_nodes"]).filter(
      ([key, value]) => value.y < maxY
    );

    // Step 4: Calculates the number of pixels to add to center the graph
    const foundNode = nodes.find((node) => node.id === elementsWithMaxY[0][0]);

    // extraWidth = textWidth(foundNode.name);                  //COMMENTED CODE BECAUSE NAME RETURNS UNDEFINED

    let initColumnMaxY = 0;
    // Step5: If there are more than 8 elements, recalculate their positions
    if (elementsWithMaxY.length > 8) {
      const itemsPerRow = 8; // Limit to 8 items per row
      const rowHeight = 20; // Vertical space between rows
      const itemWidth = 70; // Horizontal space between elements

      let initColumnMaxY =
        elementsWithMaxY[Math.floor(elementsWithMaxY.length / 2) - 4][1]["y"];

      if (elementsWithMaxY.length % 2 == 0) {
        initColumnMaxY = initColumnMaxY - itemWidth / 2;
      }

      elementsWithMaxY.forEach(([key, item], index) => {
        const row = Math.floor(index / itemsPerRow);
        const column = index % itemsPerRow;

        item.x = column * itemWidth;
        item.y = maxY + row * rowHeight;
      });

      elementsLTMaxY.forEach(([key, item], index) => {
        item.x = elementsWithMaxY[3][1].x + itemWidth / 2;
      });
    }

    // Update node positions
    const updatedNodes = nodes.map((node) => {
      const dagreNode = graph.node(node.id);

      let reduceName = false;
      if (elementsLTMaxY.length === 0 && elementsWithMaxY.length > 1) {
        reduceName = true;
      } else {
        if (elementsWithMaxY.length > 1) {
          reduceName = elementsWithMaxY.some((item) => item[0] === node.id);
        }
      }

      if (node.name.length > 15 && reduceName) {
        node.name = node.name.substring(0, 12) + "...";
      }

      return { ...node, x: dagreNode.x, y: dagreNode.y };
    });

    return { nodes: updatedNodes, links };
  };

  // Function to build the dynamic graph
  function buildBranch(node, graph, collapsed_nodes, last_level) {
    let nodes = [node];
    let links = [];

    collapsed_nodes[node.id] = true;

    for (var i = 0; i < graph.links.length; i++) {
      if (graph.links[i].source === node.id) {
        links.push(graph.links[i]);

        let nod = graph.nodes.filter((n) => n.id === graph.links[i].target);
        nodes.push(nod[0]);

        collapsed_nodes[nod[0].id] = true;

        last_level["parent"] = nod[0].parent;
      }
    }

    // Recursive function
    const upperBranch = (node) => {
      if (node.parent) {
        collapsed_nodes[node.parent] = false;

        let nod = graph.nodes.filter((n) => n.id === node.parent);
        nodes.push(nod[0]);

        let lin = graph.links.filter(
          (n) => n.source === node.parent && n.target === node.id
        );
        links.push(lin[0]);

        upperBranch(nod[0]);
      }
    };

    upperBranch(node);

    return { nodes: nodes, links: links };
  }

  // Function to recursively collapse all descendants of a node
  const collapseBranch = (node, allNodes, collapsedNodes) => {
    // Collapse the current node
    let updatedCollapsedNodes = {
      ...collapsedNodes,
      [node.id]: true, // Ensure this node is collapsed
    };
    // Find all children (nodes whose parent is this node's id)
    const children = allNodes.filter((n) => n.parent === node.id);

    //Recursively collapse each child node
    children.forEach((child) => {
      updatedCollapsedNodes = collapseBranch(
        child,
        allNodes,
        updatedCollapsedNodes
      );
    });

    return updatedCollapsedNodes;
  };

  // Function to collapse/expand a node
  const handleNodeClick = (node) => {
    let graph_data = structuredClone(graphDataFull);
    let collapsed_nodes = {};
    let last_level = { parent: "" };
    let action = true;

    if (collapsedNodes[node.id]) {
      graph_data = buildBranch(node, graph_data, collapsed_nodes, last_level);
    } else {
      let node_prev = graph_data.nodes.filter((n) => n.id === node.parent);

      if (node.group === "group1" || node_prev[0].group === "group1") {
        graph_data = {
          nodes: graph_data.nodes.filter((node) => node.group === "group1"),
          links: [],
        };

        graph_data.nodes.forEach((nod) => {
          collapsed_nodes[nod.id] = true;
        });

        last_level["parent"] = "";

        action = false;
      } else {
        node_prev = graph_data.nodes.filter(
          (n) => n.id === node_prev[0].parent
        );

        graph_data = buildBranch(
          node_prev[0],
          graph_data,
          collapsed_nodes,
          last_level
        );

        node = node_prev[0];
      }
    }

    setGraphData(getLayout(graph_data, last_level["parent"]));

    setCollapsedNodes(collapsed_nodes);

    if (action) {
      setCollapsedNodes((prev) => {
        // If the node is collapsed, expand it
        if (prev[node.id]) {
          return {
            ...prev,
            [node.id]: false, // Expand the node
          };
        } else {
          // If the node is being collapsed, collapse the node and all its child nodes
          return collapseBranch(node, graph_data.nodes, prev);
        }
      });
    }
  };

  // Function to determine which nodes are down
  const getVisibleGraph = () => {
    // List of visible (not collapsed) nodes
    const visibleNodes = [];
    const visibleLinks = [];
    // Create a node map by ID for easy access to parents
    const nodeMap = new Map(graphData.nodes.map((node) => [node.id, node]));
    // Adding visible nodes
    graphData.nodes.forEach((node) => {
      let isVisible = true;
      let parent = nodeMap.get(node.parent);
      //If any of the parents is collapsed, the node is not visible
      while (parent) {
        if (collapsedNodes[parent.id]) {
          isVisible = false;
          break;
        }
        parent = nodeMap.get(parent.parent);
      }
      if (isVisible) {
        visibleNodes.push(node);
      }
    });

    // Adding visible links
    graphData.links.forEach((link) => {
      const found = visibleNodes.some((node) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        return sourceId === node.parent && targetId === node.id;
      });
      if (found) {
        visibleLinks.push(link);
      }
    });

    return { nodes: visibleNodes, links: visibleLinks };
  };

  // NodeCard opens on right-click on the node
  const handleNodeRightClick = (node) => {
    const objectFound = Object.entries(json_data).find(
      ([key, value]) => value.fid === node.id
    );
    setNodeJsonFound(objectFound);
    // Set the currently right-cliked node ID
    setSelectedNodeId(node.id);
    setSelectedNodeGroup(node.group);
  };

  // Function to close the Modal
  const handleCloseModal = () => {
    setNodeJsonFound(null);

    // Clear the right-clicked node ID
    setSelectedNodeId(null);
  };

  const calculateGraphDimensions = () => {
    const nodes = graphData.nodes;

    if (nodes.length === 0) return { width: 0, height: 0 };

    // Find the minimum and maximum coordinates of the nodes
    const minX = Math.min(...nodes.map((node) => node.x || 0));
    const maxX = Math.max(...nodes.map((node) => node.x || 0));
    const minY = Math.min(...nodes.map((node) => node.y || 0));
    const maxY = Math.max(...nodes.map((node) => node.y || 0));

    // Calculate the width and height

    const width = maxX - minX + extraWidth;
    const height = maxY - minY;

    return { width, height };
  };

  // Trigger methods after the graph data is updated
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const { width, height } = calculateGraphDimensions();

      fgRef.current.zoom(2, 500); // Only after the data is loaded

      fgRef.current.centerAt(Math.trunc(width / 2), 200, 100);
    }
  }, [graphData]);

  return (
    <div className="w-full flex">
      {/* Container for ForceGraph2D */}
      <div
        className={`${
          nodeJsonFound ? "w-2/3" : "w-full"
        } flex justify-center items-center`}
      >
        <ForceGraph2D
          graphData={getVisibleGraph()}
          width={nodeJsonFound ? dimensions.width * (2 / 3) : dimensions.width}
          height={dimensions.height}
          backgroundColor={background_color}
          nodeAutoColorBy="group"
          linkColor={() => link_color}
          ref={fgRef}
          cooldownTicks={0}
          onNodeClick={handleNodeClick} // Call handleNodeClick in the nodes
          onNodeRightClick={handleNodeRightClick}
          nodeLabel={(node) => `${groupToMarkerMap[node.group]}: ${node.name}`}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = getColorForNode[graph_type][node.group];
            ctx.fill();

            // Apply a colored border if this node is the selected one
            if (node.id === selectedNodeId) {
              ctx.lineWidth = 2;
              ctx.strokeStyle = "##404040"; // Gray border color on nodes right-clicked.
              ctx.stroke();
            }

            // Draw the label
            ctx.font = `${fontSize}px 'Arial', 'Sans-Serif'`;
            ctx.textAlign = "right";
            ctx.textBaseline = "right";
            ctx.fillStyle = label_color;
            ctx.fillText(label, node.x - 9, node.y + 1);
          }}
        />
      </div>

      {/* Container for NodeCard to scroll inside */}
      <div className="w-1/3 h-full overflow-hidden">
        {nodeJsonFound && (
          <NodeCard
            node={nodeJsonFound}
            on_close={handleCloseModal}
            grouped_markers={groupedMarkers}
            get_color_for_node={getColorForNode}
            graph_type={graph_type}
            selected_node_group={selectedNodeGroup}
          />
        )}
      </div>
    </div>
  );
};

export default Graph;
