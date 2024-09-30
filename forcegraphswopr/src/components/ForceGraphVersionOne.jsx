// import { useEffect, useState } from "react";
// import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';

// const ForceGraphVersionOne = () => {
//   const [graphData, setGraphData] = useState({ nodes: [], links: [] });

//   useEffect(() => {
//     fetch("../../server/db.json")
//       .then(response => response.json())
//       .then(data => {
//         console.log('dataReceived', data);
        
//         // Procesar los datos para el ForceGraph
//         const nodes = data.markers.filter(marker => {
//           // Filtrar marcadores que contienen al menos una de las propiedades definidas
//           return ["site", "instalacion", "instalzone", "tipoEquipo", "equip", "secEquip", "point"].some(prop => prop in marker);
//         }).map(marker => ({
//           id: marker.fid,
//           name: marker.navName,
//           typeMarker: Object.keys(marker)[0],
//            }));

//         setGraphData({ nodes });
//       })
//       .catch(error => console.error('Error al obtener los datos:', error));
//   }, []);

//   const getColorForNode = (typeMarker) => {
//     const colors = {
//       site: '#FF6347',
//       instalacion: '#4682B4',
//       instalZone: '#32CD32',
//       tipoEquipo: '#FFD700',
//       equip: '#BA55D3',
//       secEquip: '#FF4500',
//       point: '#00BFFF',
//     };
//     return colors[typeMarker] || '#000000'; // Color por defecto
//   };

//   return (
//     <div style={{ height: 600, width: '100%' }}>
//       <ForceGraph2D
//         graphData={graphData}
//         nodeAutoColorBy="typeMarker"
//         nodeCanvasObject={(node, ctx, globalScale) => {
//           const label = node.name;
//           const fontSize = 12 / globalScale;
//           ctx.font = `${fontSize}px Sans-Serif`;
//           const textWidth = ctx.measureText(label).width;
//           const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // Algun padding
//           ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
//           ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
//           ctx.textAlign = 'center';
//           ctx.textBaseline = 'middle';
//           ctx.fillStyle = getColorForNode(node.typeMarker);
//           ctx.fillText(label, node.x, node.y);
//         }}
//         linkCanvasObjectMode={() => 'after'}
//       />
//     </div>
//   );
// };

// export default ForceGraphVersionOne;