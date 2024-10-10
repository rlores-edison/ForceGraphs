import { useEffect, useState, useRef } from "react"; 
import { ForceGraph2D } from "react-force-graph";
import dagre from "@dagrejs/dagre";

const Graph = () => {
  const fgRef = useRef();
  const N = 300;
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Recalculate dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Clean up the event listener
  }, []);

  // Fetch data from the server and process it
  useEffect(() => {
    fetch("../../server/db.json")
      .then((response) => response.json())
      .then((data) => {
        const adaptedData = adaptDbToGraph(data);
        setGraphData(getPrunedTree(adaptedData));
      })
      .catch((error) => console.error("Error fetching data:", error));
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

  // Adapt database data into graph format
  const adaptDbToGraph = (data) => {
    const nodes = [];
    const links = [];
    console.log("Nodes: ", nodes);
    console.log("Links: ", links);
    const existingLinks = new Set();

    Object.keys(data).forEach((key) => {
      const item = data[key];
    
      // Ensure the item has an 'fid' before processing
      if (!item || !item.fid) {
        console.error(`Skipping item with missing fid:`, item);
        return; // Skip this item if 'fid' is missing
      }
    
      const nodeType = Object.keys(groupedMarkers).find((group) =>
        groupedMarkers[group].some(
          (marker) => item.markers && item.markers.includes(marker)
        )
      );
    
      if (nodeType) {
        const newNode = {
          id: item.fid,
          name: item.navName || item.model_name || item.bmsUri,
          group: nodeType,
          collapsed: nodeType !== "group1", // Only group1 nodes expanded initially
          childLinks: [], // Empty initially, will be populated during link creation
        };
    
        nodes.push(newNode);
        nodesById[item.fid] = newNode; // Store node by its fid for easy lookup
    
        // Helper function to create a unique link between nodes
        const createUniqueLink = (source, target, group) => {
          const linkKey = `${source}-${target}-${group}`;
          if (!existingLinks.has(linkKey)) {
            links.push({ source, target, group }); // Add the link
            existingLinks.add(linkKey);
    
            const parentNode = nodesById[source];
            if (parentNode) {
              parentNode.childLinks.push({ source, target });
            }
          }
        };
    
        // Linking strategy: Each group links to its parent group
        // Group 2 links to Group 1 (sites)
        if (item.markers.includes("instalacion") && item.siteRef?.fid) {
          createUniqueLink(item.siteRef.fid, item.fid, "group2");
        }
    
        // Group 3 links to Group 2
        if (item.instalZoneRef) {
          createUniqueLink(item.instalacionRef.fid, item.fid, "group3");
        }
    
        // Group 4 links to Group 3
        if (item.tipoEquipoRef) {
          createUniqueLink(item.instalZoneRef.fid, item.fid, "group4");
        }
    
        // Group 5 links to Group 4
        if (item.equipRef) {
          createUniqueLink(item.tipoEquipoRef.fid, item.fid, "group5");
        }
    
        // Group 6 links to Group 5
        if (item.secEquipRef) {
          createUniqueLink(item.equipRef.fid, item.fid, "group6");
        }
    
        // Group 7 links to Group 6
        if (item.markers.includes("point") && item.secEquipRef?.fid) {
          createUniqueLink(item.secEquipRef.fid, item.fid, "group7");
        }
      }
    });


  // Use dagre to calculate the layout
  const layoutData = getLayout({ nodes, links });
  return layoutData;
};

  const getLayout = ({ nodes, links }) => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ nodesep: 90 });
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => graph.setNode(node.id, { width: 20, height: 30 }));
    links.forEach((link) => graph.setEdge(link.source, link.target));

    dagre.layout(graph);

    return {
      nodes: nodes.map((node) => {
        const dagreNode = graph.node(node.id);
        return { ...node, x: dagreNode.x, y: dagreNode.y };
      }),
      links,
    };
  };

  // Prune the tree based on collapsed nodes
  const getPrunedTree = (data) => {
    const visibleNodes = [];
    const visibleLinks = [];
  
    // Create a map of nodes by their ID for easy lookup
    const nodesById = Object.fromEntries(data.nodes.map((node) => [node.id, node]));
  
    // Function to traverse the tree, starting from root nodes
    const traverseTree = (node) => {
      if (!node) {
        console.error("Node is missing or undefined.");
        return;
      }
  
      // Add the current node to the visible list
      visibleNodes.push(node);
      
      // If the node is collapsed, do not continue to its children
      if (node.collapsed) return;
  
      // Add child links to the visible links array
      visibleLinks.push(...node.childLinks);
  
      // Recursively traverse through child nodes
      node.childLinks.forEach((link) => {
        const childNode = nodesById[link.target];
        if (childNode) {
          traverseTree(childNode); // Recursively traverse child nodes
        }
      });
    };
  
    // Find root nodes (those with markers: ["site"])
    const rootNodes = Object.values(nodesById).filter((node) => node.group === "group1");
  
    // Traverse from each root node
    rootNodes.forEach((rootNode) => {
      traverseTree(rootNode);
    });
  
    return { nodes: visibleNodes, links: visibleLinks };
  };
  
   
  const handleNodeClick = (node) => {
    if (node.childLinks && node.childLinks.length > 0) {
      node.collapsed = !node.collapsed;
      Graph.graphData(getPrunedTree());
    } else {
      console.log(`Node ${node.name} has no child links to expand.`);
    }
  };
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0 ) {
      fgRef.current.zoomToFit(400);
    }
  }, [graphData]);

  return (
    <ForceGraph2D
      graphData={graphData}
      width={dimensions.width}
      height={dimensions.height}
      backgroundColor="#192c4b"
      nodeAutoColorBy="group"
      linkColor={() => "#f6f1fb"}
      ref={fgRef}
      cooldownTicks={0}
      onEngineStop={() => fgRef.current.zoomToFit(400)}
      onNodeClick={handleNodeClick}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 5.5 / globalScale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = getColorForNode(node.group);
        ctx.fill();
        ctx.font = `${fontSize}px Sans-Serif, Helvetica`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, node.x, node.y);     
      }}
    />
  );
};

export default Graph;
