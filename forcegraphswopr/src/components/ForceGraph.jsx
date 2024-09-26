import { useEffect, useState } from "react";
import {  ForceGraph2D,  ForceGraph3D,  ForceGraphVR,  ForceGraphAR,} from "react-force-graph";

const ForceGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    fetch("../../server/db.json")
      .then((response) => response.json())
      .then((data) => {
        const adaptedData = adaptDbToGraph(data);
        setGraphData(adaptedData);
      })
      .catch((error) => console.error("🤷‍♀️ Error fetching data:", error));
  }, []);

  const typeMarkers = [
    "site",
    "instalacion",
    "instalZone",
    "tipoEquipo",
    "equip",
    "secEquip",
    "point",
  ];

   const getColorForNode = (typeMarker) => {
    const colors = {
      site: '#812921',
      instalacion: '#0c63ef',
      instalZone: '#f4bb00',
      tipoEquipo: '#85db15',
      equip: '#79e5f5',
      secEquip: '#9200f4',
      point: '#e61806',
    };
    return colors[typeMarker] || '#f94dbd';
  };

  // alineación vertical?
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
    const linksSet= new Set(); // track unique links
    const links = [];

    Object.keys(db).forEach((key) => {
      const item = db[key];
      const nodeType = typeMarkers.find(
        (marker) => item.markers && item.markers.includes(marker)
      );

      if (nodeType) {
        nodes.push({
          id: item.fid,
          name: item.navName || item.model_name || item.bmsUri,
          typeMarker: nodeType,
          yPosition: getPositionValues(nodeType)
        });
         // Function to add a link if it's unique and valid
      const addLink = (source, target) => {
        if (target && target.fid) {  // Ensure target is not undefined and has fid
          const linkId = `${source}->${target.fid}`;
          if (!linksSet.has(linkId)) {
            linksSet.add(linkId); // Track this link as added
            links.push({ source, target: target.fid });
          }
        } else {
          console.warn(`Missing target for source: ${source}`, target);  // Debugging log
        }
      };

        // Linking logic based on marker hierarchy
        if (item.siteRef && nodeType === 'site') {
          addLink({ source: item.fid, target: item.siteRef.fid });
        }
        if (item.siteRef && nodeType === 'instalacion') {
          addLink({ source: item.fid, target: item.siteRef.fid });
        }
        if (item.instalacionRef && nodeType === 'instalZone') {
          addLink({ source: item.fid, target: item.instalacionRef.fid });
        }
        if (item.instalZoneRef && nodeType === 'tipoEquipo') {
          addLink({ source: item.fid, target: item.instalZoneRef.fid });
        }
        if (item.tipoEquipoRef && nodeType === 'equip') {
          addLink({ source: item.fid, target: item.tipoEquipoRef.fid });
        }
        if (item.equipRef && nodeType === 'secEquip') {
          addLink({ source: item.fid, target: item.equipRef.fid });
        }
        if (item.secEquipRef && nodeType === 'point') {
          addLink({ source: item.fid, target: item.secEquipRef.fid });
        } else if (item.equipRef && nodeType === 'point') {
          addLink({ source: item.fid, target: item.equipRef.fid });
        }
      }
    });
    console.log("Generated Links:", links);
    return { nodes, links };
  };
  return (
    <ForceGraph2D
      graphData={graphData}
      nodeAutoColorBy="typeMarker"
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 15 / globalScale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = getColorForNode(node.typeMarker);
        ctx.fill();
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = "#000002";
        ctx.fillText(label, node.x, node.y);
      }}
    />
  );
};

export default ForceGraph;