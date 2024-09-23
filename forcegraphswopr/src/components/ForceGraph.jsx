import { useEffect, useState } from "react";
import { ForceGraph2D } from 'react-force-graph';

const ForceGraph = () => {  
  const [graphData, setGraphData] = useState({nodes: [], links: [] });

  useEffect(() => {
    fetch ("../../server/db.json")
    .then(response => response.json())
    .then (data => {
      console.log ('data', data);
      const adaptedData = adaptDbToGraph(data);
      console.log ("adaptDbToGraph",adaptedData);
      setGraphData(adaptedData);
    })
    .catch(error => console.error("🤷‍♀️ Error fetching data:", error));
  }, []);

  // Grouped markers with their corresponding types
  const groupedMarkers = {
    group1: ['site'],
    group2: ['instalacion'],
    group3: ['instalZone'],
    group4: ['tipoEquipo'],
    group5: ['equip'],
    group6: ['secEquip'],  // Secondary equipment group, which is not visible in the visualization
    group7: ['point'],
  };

  // Position values for each group (Group 1 at the top, Group 6 at the bottom)
  const positionValues = {
    group1: 100,   // Top
    group2: 80,
    group3: 60,
    group4: 40,
    group5: 20,
    group6: 10,
    group7: 0     // Bottom
  };

  // Helper function to determine the group of a node
  const getGroupForMarker = (typeMarker) => {
    for (const group in groupedMarkers) {
      if (groupedMarkers[group].includes(typeMarker)) {
        return group;
      }
    }
    return null;
  };

  // Function to adapt the database data into the graph format
  const adaptDbToGraph = (db) => {
    const nodes = [];
    const links = [];

    Object.keys(db).forEach((key) => {
      const item = db[key];
      const nodeType = Object.keys(groupedMarkers).find(group =>
        groupedMarkers[group].some(marker => item.markers && item.markers.includes(marker))
      );

      if (nodeType) {
        // Create the node
        nodes.push({
          id: item.fid, // Unique identifier for the node
          name: item.navName || item.model_name || item.bmsUri, // Use the available name fields
          group: nodeType, // Assign the node's group
          y: positionValues[nodeType], // Set y-coordinate based on group
          x: Math.random() * 1000 // Random x-coordinate for horizontal distribution
        });

        // Create the link if a siteRef or other parent reference exists
        if (item.siteRef) {
          links.push({
            source: item.fid, // Current node id
            target: item.siteRef.fid // Parent node id
          });
        } else if (item.instalacionRef) {
          links.push({
            source: item.fid, 
            target: item.instalacionRef.fid 
          });
        } else if (item.instalZoneRef) {
          links.push({
            source: item.fid, 
            target: item.instalZoneRef.fid
          });
        } else if (item.tipoEquipoRef) {
          links.push({
            source: item.fid, 
            target: item.tipoEquipoRef.fid
          });
        }
      }
    });

    return { nodes, links };
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeAutoColorBy="group" // Automatically color nodes by their group
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColorForNode(node.group);
        ctx.fillText(label, node.x, node.y);
      }}
      linkCanvasObjectMode={() => 'after'}
    />
  );
};

// Function to assign colors to nodes based on their group
const getColorForNode = (group) => {
  const colors = {
    group1: '#FF6347',
    group2: '#4682B4',
    group3: '#32CD32',
    group4: '#FFD700',
    group5: '#BA55D3',
    group6: '#00BFFF',
    group7: '#FFD700',
  };
  return colors[group] || '#BA55D3'; // Default color
};

export default ForceGraph;
