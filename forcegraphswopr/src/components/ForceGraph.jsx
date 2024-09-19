import { useEffect, useState } from "react";
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';


const ForceGraph = () => {  
  const [graphData, setGraphData] = useState({nodes: [], links: [] });

  useEffect(() => {
    fetch ("../../server/db.json")
    .then(response => response.json())
    .then (data => {
      console.log ('data', data);
    
        const adaptedData = adaptDbToGraph(data);
        console.log ("**",adaptedData);
      setGraphData(adaptedData);
    })
    .catch(error => console.error("🤷‍♀️ Error fetching data:", error));
  }, []);

    const typeMarkers = ['site', 'instalacion', 'instalZone', 'tipoEquipo', 'equip', 'secEquip', 'point'];
    const getPositionValues = (typeMarker) => {	    
      const positions = {
        site: 100,
        instalacion: 80,
        instalZone: 60,
        tipoEquipo: 40,
        equip: 30,
        secEquip: 20,
        point: 10,
      };
      return positions[typeMarker] || 0;
    };

      const adaptDbToGraph = (db) => {
      const nodes = [];
      const links = [];
      
      Object.keys(db).forEach((key) => {
        const item = db[key];
        const nodeType = typeMarkers.find(marker => item.markers && item.markers.includes(marker));

        if (nodeType) {
          // Create the node
          nodes.push({
            typeMarker: nodeType,
            id: item.fid, // Unique identifier for the node
            name: item.navName || item.model_name || item.bmsUri, // Use the available name fields
            nodeColors: nodeType,                 
            positionValues: getPositionValues(nodeType) // Position for vertical alignment
          });
    
          // Create the link if a siteRef or other parent reference exists
          if (item.siteRef) {
            links.push({
              typeMarker: nodeType,
              source: item.fid, // Current node id
              target: item.siteRef.fid // Parent node id
            });
          } else if (item.instalacionRef) {
            links.push({
              typeMarker: nodeType,
              source: item.fid, 
              target: item.instalacionRef.fid 
            });
          } else if (item.instalZoneRef) {
            links.push({
              typeMarker: nodeType,
              source: item.fid, 
              target: item.instalZoneRef.fid
            });
          } else if (item.tipoEquipoRef) {
            links.push({
              typeMarker: nodeType,
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
        nodeAutoColorBy="typeMarker"
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
          ctx.fillStyle = getColorForNode(node.typeMarker);
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObjectMode={() => 'after'}
        />
      );
    };
    const getColorForNode = (typeMarker) => {
      const colors = {
        site: '#FF6347',
        instalacion: '#4682B4',
        instalZone: '#32CD32',
        tipoEquipo: '#FFD700',
        equip: '#BA55D3',
        secEquip: '#FF4500',
        point: '#00BFFF',
      };
      return colors[typeMarker] || '#000000'; // Default color
    };
    export default ForceGraph;


