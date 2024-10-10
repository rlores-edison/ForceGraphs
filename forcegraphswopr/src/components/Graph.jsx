import { useEffect, useState, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
import dagre from "@dagrejs/dagre";

const Graph = () => {
  const fgRef = useRef();
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

  useEffect(() => {
    fetch("../../server/db.json")
      .then((response) => response.json())
      .then((data) => {
        const prunedData = getPrunedTree(data); // Process and prune the data
        setGraphData(prunedData);
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

  // Function to process the raw data and prune nodes/links based on collapsed state
  const getPrunedTree = (data) => {
    const nodes = [];
    const links = [];
    const visibleNodes = [];
    const visibleLinks = [];
    const existingLinks = new Set(); // Avoid duplicate links

    const nodesById = {}; // Create a map of nodes by their ID for easy lookup

    // Iterate over each item in the data object
    Object.keys(data).forEach((key) => {
      const item = data[key];
      if (!item || !item.fid) {
        console.error("Skipping item with missing fid:", item); 
        return;  // Skip this item
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
          console.log(`Creating link from ${source} to ${target} in ${group}`);
          const linkKey = `${source}-${target}-${group}`;
          if (!existingLinks.has(linkKey)) {
            links.push({ source, target, group });
            existingLinks.add(linkKey);
            
            // Add child link to the parent node
            const parentNode = nodesById[source];
            if (parentNode) {
              parentNode.childLinks.push({ source, target });
            }
          }
        };
        // Linking strategy: Each group links to its parent group
        // link from site to instalacion
        if (item.markers.includes("instalacion") && item.siteRef?.fid) {
          createUniqueLink(item.siteRef.fid, item.fid, "group2");
        }
    
        // link from instalacion to instalZone
        if (item.markers.includes("instalZone") && item.instalacionRef?.fid) {
          createUniqueLink(item.instalacionRef.fid, item.fid, "group3");
        }
    
        // link from instalZone to tipoEquipo
        if (item.markers.includes("tipoEquipo") && item.instalZoneRef?.fid) {
          createUniqueLink(item.instalZoneRef.fid, item.fid, "group4");
        }
    
        // link from tipoEquipo to equip
        if (item.markers.includes("equip") && item.tipoEquipoRef?.fid) {
          createUniqueLink(item.tipoEquipoRef.fid, item.fid, "group5");
        }
    
        // link from equip to secEquip
        if (item.markers.includes("secEquip") && item.equipRef?.fid) {
          createUniqueLink(item.equipRef.fid, item.fid, "group6");
        }
    
        // link point to secEquip, if secEquipRef exists, otherwise link point to equip
        if (item.markers.includes("point")) {
          if (item.secEquipRef?.fid) {
            createUniqueLink(item.fid, item.secEquipRef.fid, "group7");
          } else if (item.equipRef?.fid) {
            createUniqueLink(item.fid, item.equipRef.fid, "group7");
          }
        }
      }
    });

    // Traverse from root nodes (group1) to expand them
    nodes.filter((node) => node.group === "group1").forEach((node) => {
      traverseTree(node, visibleNodes, visibleLinks, nodesById, existingLinks);
    });

    // Return visible nodes and links after layout adjustment
    return getLayout({ nodes: visibleNodes, links: visibleLinks });
  };

  // Recursive tree traversal
  const traverseTree = (node, visibleNodes, visibleLinks, nodesById, existingLinks) => {
    if (!node) return;

    visibleNodes.push(node); // Add the current node to the visible list

    if (node.collapsed) return; // Stop if the node is collapsed

    node.childLinks.forEach((link) => {
      // Add link if it's not already visible
      if (!existingLinks.has(link.source + "-" + link.target)) {
        visibleLinks.push(link);
        existingLinks.add(link.source + "-" + link.target);
      }

      // Recursively traverse child nodes
      const childNode = nodesById[link.target];
      traverseTree(childNode, visibleNodes, visibleLinks, nodesById, existingLinks);
    });
  };

  const getLayout = ({ nodes, links }) => {
    // Initialize a dagre graph
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      nodesep: 110,
    });
    graph.setDefaultEdgeLabel(() => ({}));

    // Add nodes with default width/height
    nodes.forEach((node) => {
      graph.setNode(node.id, { width: 20, height: 30 });
    });

    // Add edges
    links.forEach((link) => {
      graph.setEdge(link.source, link.target);
    });

    // Run the layout algorithm
    dagre.layout(graph);

    // Update node positions
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

  const handleNodeClick = (node) => {
    if (node.childLinks.length > 0) {
      node.collapsed = !node.collapsed; // Toggle the collapsed state
      const updatedGraphData = getPrunedTree(graphData); // Recalculate the pruned tree
      setGraphData(updatedGraphData); // Update the graph data
    }
  };

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
        const fontSize = 14 / globalScale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = getColorForNode(node.group);
        ctx.fill();
        ctx.font = `${fontSize}px 'Sans-Serif', 'Helvetica'`;
        ctx.textAlign = "right";
        ctx.textBaseline = "right";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, node.x - 12, node.y + 4);
      }}
    />
  );
};

export default Graph;
