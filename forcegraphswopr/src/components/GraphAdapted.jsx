import { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import dagre from "@dagrejs/dagre";

const Graph = () => {
const graphRef = useRef();
const [graphData, setGraphData] = useState({ nodes: [], links: [] });
const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

//Recalculate dimensions on window resize

const handleResize = () => {
  const graphContainer = document.querySelector(".w-full.h-screen");
  if (graphContainer) {
    const rect = graphContainer.getBoundingClientRect();
    const adjustedWidth = Math.max(rect.width, 400);  // Minimum width of 400px
    const adjustedHeight = Math.max(rect.height, 400); // Minimum height of 400px

    console.log("Adjusted Container size:", adjustedWidth, adjustedHeight);
    console.log("Window size:", window.innerWidth, window.innerHeight);

    setDimensions({ width: adjustedWidth, height: adjustedHeight });
  }
};

  /*window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);//Clean up the event listener
}, []);*/
useEffect(() => {
  if (graphRef.current) {
    graphRef.current.zoomToFit(200, 50);  // Zoom to fit with proper padding
  }
}, [dimensions]);

useEffect(() => {
  fetch("../../server/db.json")
    .then((response) => response.json())
    .then((data) => {
      const adaptedData = adaptDbToGraph(data);
      setGraphData(adaptedData);
    })
    .catch((error) => console.error("🤷‍♀️ Error fetching data:", error));  
}, []);

const groupedMarkers = {
  group1: ["site"],
  group2: ["instalacion"],
  group3: ["instalZone"],
  group4: ["tipoEquipo"],
  group5: ["equip"],
  group6: ["secEquip"],
  group7: ["point"],
};

const getColorForNode = (group) => {
  const colors = {
    group1: "#812921",
    group2: "#0c63ef",
    group3: "#f4bb00",
    group4: "#85db15",
    group5: "#79e5f5",
    group6: "#9200f4",
    group7: "#e61806",
  };
  return colors[group] || "#f94dbd";
};

// Function to adapt the database data into the graph format
const adaptDbToGraph = (db) => {
  const nodes = [];
  const links = [];

  // Store existing links to avoid duplicates
  const existingLinks = new Set();

  Object.keys(db).forEach((key) => {
    const item = db[key];

    // Ensure the item has an 'fid' before processing
    if (!item || !item.fid) {
      console.error(`Skipping item with missing fid:`, item);
      return; // Skip this item if 'fid' is missing
    }

    const nodeType = Object.keys(groupedMarkers).find(group =>
      groupedMarkers[group].some(marker => item.markers && item.markers.includes(marker))
    );

    if (nodeType) {
      // Create the node
      nodes.push({
        id: item.fid, // Unique identifier for the node
        name: item.navName || item.model_name || item.bmsUri, // Use the available name fields
        group: nodeType // Assign the node's group
        }); 
      
        // Helper function to create unique links
      const createUniqueLink = (source, target, group) => {
        const linkKey = `${source}-${target}-${group}`;
        if (!existingLinks.has(linkKey)) {
          links.push({ source, target, group });// Include the group in the link
          existingLinks.add(linkKey);
        }
      };
      
      if (item.markers.includes("instalacion") && item.siteRef?.fid) {
        createUniqueLink(item.siteRef.fid, item.fid, "group1"); // Link instalacion to site using siteRef.fid
      }

      if (item.secEquipRef) {
        createUniqueLink(item.secEquipRef.fid, item.fid, "group6"); // Connect secEquip to point
      } else if (item.equipRef) {
        createUniqueLink(item.equipRef.fid, item.fid, "group5"); // Connect equip to point if no secEquip
      } else if (item.tipoEquipoRef) {
        createUniqueLink(item.tipoEquipoRef.fid, item.fid, "group4"); // Connect tipoEquipo to equip
      } else if (item.instalZoneRef) {
        createUniqueLink(item.instalZoneRef.fid, item.fid, "group3"); // Connect instalZone to tipoEquipo
      } else if (item.instalacionRef) {
        createUniqueLink(item.instalacionRef.fid, item.fid, "group2"); // Connect instalacion to instalZone
      }
    }
  });
  //Let's use dagre to calculate the layout
  const layoutData = getLayout ({ nodes, links });
  return layoutData;
};
const getLayout = ({ nodes, links }) => {   // This function initializes a dagre graph. 
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir:"TB", //adjust to direction TB, BT, LR, RL
    nodesep: 20,
    edgesep:50,
    ranksep:100, //separation between levels
  });
  graph.setDefaultEdgeLabel(() => ({}));

//Add nodes and set default width/height
nodes.forEach((node) => {
graph.setNode(node.id, { width: 100, height: 50 });
});
//Add edges
links.forEach((link) => {
  graph.setEdge(link.source, link.target);
});

//Run the layout
dagre.layout(graph);

//Update node positions
const updatedNodes = nodes.map((node) => {
  const dagreNode = graph.node(node.id);
  return { ...node, x: dagreNode.x, y: dagreNode.y };
});
return { nodes: updatedNodes, links };
};

const calculateBoundingBox = (nodes) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  });
  return { minX, maxX, minY, maxY };
};

useEffect(() => {
  if (graphData.nodes.length) {
    const { minX, maxX, minY, maxY } = calculateBoundingBox(graphData.nodes);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    graphRef.current.zoomToFit(400, 700, (node) => {
      return node.x === centerX && node.y === centerY; 
    });
  }
}, [graphData]);

return (
  <ForceGraph2D
    ref={graphRef}
    graphData={graphData}
    width={Math.min(dimensions.width)} 
    height={Math.min(dimensions.height)} 
    backgroundColor="#141a23"
    nodeAutoColorBy="group" 
    linkColor={() => "#f6f1fb"}
    nodeCanvasObject={(node, ctx, globalScale) => {
      const label = node.name;
      const fontSize = 7 / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI, false);
      ctx.fillStyle = getColorForNode(node.group);
      ctx.fill();
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, node.x, node.y);
    }}
  />
);
};

export default Graph;
