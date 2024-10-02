import { useEffect, useState } from "react";
import {  ForceGraph2D,  ForceGraph3D,  ForceGraphVR,  ForceGraphAR,} from "react-force-graph";

const Group = () => {  
  const [graphData, setGraphData] = useState({nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []); 
  
  useEffect(() => {
       fetch("../../server/db.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        const adaptedData = adaptDbToGraph(data);
        console.log("**", adaptedData);
        setGraphData(adaptedData);
      })
      .catch((error) => console.error("🤷‍♀️ Error fetching data:", error));
  }, []);
  

const typeMarkers = ["site", "instalacion", "instalZone", "tipoEquipo", "equip", "secEquip", "point"];

  const groupedMarkers = {
    group1: ['site'],
    group2: ['instalacion'],
    group3: ['instalZone'],
    group4: ['tipoEquipo'],
    group5: ['equip'],
    group6: ['secEquip'],  
    group7: ['point'],
  };
  
   const positionValues = {
    group1: 0,   // Top
    group2: 10,
    group3: 20,
    group4: 40,
    group5: 60,
    group6: 80,
    group7: 100
   };

   const getColorForNode = (group) => {
  const colors = {
    group1: '#812921',
    group2: '#0c63ef',
    group3: '#f4bb00',
    group4: '#85db15',
    group5: '#79e5f5',
    group6: '#9200f4',
    group7: '#e61806',
  };
  return colors[group] || '#f94dbd';
};


  // Helper function to determine the group of a node
  const getGroupForMarker = (marker) => {
    for (const group in groupedMarkers) {
      if (groupedMarkers[group].includes(marker)) {
        return group;
      }
}
    return null;
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
          group: nodeType, // Assign the node's group
          // y-coordinate is locked based on group
          x: Math.random() * 1000,
          y: positionValues[nodeType]
        });
        // Helper function to create unique links
        const createUniqueLink = (source, target, group) => {
          const linkKey = `${source}-${target}-${group}`;
          if (!existingLinks.has(linkKey)) {
            links.push({
              source: source,
              target: target,
              group: groupedMarkers // Include the group in the link
            });
            existingLinks.add(linkKey);
          }
        };
        // Connect "instalacion" to "site" using siteRef.fid
        if (item.markers && item.markers.includes("instalacion") && item.siteRef && item.siteRef.fid) {
          createUniqueLink(item.siteRef.fid, item.fid, 'group1'); // Link instalacion to site
        }
       
        if (item.secEquipRef) {
          createUniqueLink(item.secEquipRef.fid, item.fid, 'group6'); // Connect secEquip to point
        } else if (item.equipRef) {
          createUniqueLink(item.equipRef.fid, item.fid, 'group5'); // Connect equip to point if no secEquip
        } else if (item.tipoEquipoRef) {
          createUniqueLink(item.tipoEquipoRef.fid, item.fid, 'group4'); // Connect tipoEquipo to equip
        } else if (item.instalZoneRef) {
          createUniqueLink(item.instalZoneRef.fid, item.fid, 'group3'); // Connect instalZone to tipoEquipo
        } else if (item.instalacionRef) {
          createUniqueLink(item.instalacionRef.fid, item.fid, 'group2'); // Connect instalacion to instalZone
        }
      }          
    });
    return { nodes, links };            
};              
  return (
    <ForceGraph2D
      graphData={graphData}
      width={dimensions.width}   // Dynamically adjust width
      height={dimensions.height} // Dynamically adjust height
      backgroundColor="#141a23"
      nodeAutoColorBy="group"   // Automatically color nodes by their group
      linkColor={() => '#f6f1fb'}
      linkDirectionalParticles={4}
      linkDirectionalParticleSpeed={0.01}// Adds 4 particles per link
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 7 / globalScale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI, false);
        ctx.fillStyle = getColorForNode(node.group);
        ctx.fill();
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        //const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
        //ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColorForNode(node.group);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, node.x, node.y);
      }}
      />
    );
  };
        
export default Group;