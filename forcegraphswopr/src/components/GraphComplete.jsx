import { useEffect, useState, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
import dagre from "@dagrejs/dagre";

const Graph = () => {
const fgRef = useRef();
const [graphData, setGraphData] = useState({ nodes: [], links: [] });
const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Recalculate dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Clean up the event listener
  }, []);
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
  //Use dagre to calculate the layout
  const layoutData = getLayout ({ nodes, links });
  return layoutData;
};
const getLayout = ({ nodes, links }) => {   // This function initializes a dagre graph. 
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    nodesep: 90,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  //Add nodes and set default width/height
nodes.forEach((node) => {
graph.setNode(node.id, { width: 20, height: 30 });
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
// Trigger zoomToFit after the graph data is updated
useEffect(() => {
  if (fgRef.current && graphData.nodes.length > 0) {
    fgRef.current.zoomToFit(400); // Only after the data is loaded
  }
}, [graphData]);
return (
  <ForceGraph2D
    graphData={graphData}
    width={dimensions.width} // Dynamically adjustment 
    height={dimensions.height} 
    backgroundColor="#192c4b"
    nodeAutoColorBy="group" 
    linkColor={() => "#f6f1fb"}
    ref={fgRef}
    cooldownTicks={0}
    onEngineStop={() => fgRef.current.zoomToFit(400)}
    nodeCanvasObject={(node, ctx, globalScale) => {
      const label = node.name;
      const fontSize = 5.5 / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = getColorForNode(node.group);
      ctx.fill();
      ctx.font = `${fontSize}px 'Sans-Serif', 'Helvetica'`;
      ctx.textAlign = "top";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, node.x, node.y);
    }}
  />
);
};

export default Graph;