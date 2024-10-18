import WOPRLogo from "../assets/WOPRLogo.png";

const NodeDetails = ({ ModelName, node, learnMoreLink }) => {
  return (
    <div className="container mx-auto">
      {/* //The container takes up the full width of the viewport and is centered horizontally. See tailwind.config.js for the container class */}
      <div className="bg-[#f5f7fa] shadow-sm border border-slate-300 rounded-lg p-10">
        <div className="flex justify-center items-center mb-6">
          <img alt="logo" src={WOPRLogo} className="w-10 h-10 mb-1" />
          <h1 className="ml-3 text-slate-800 text-xl font-semibold">
            ATM_Raquel Oreilly_Jace__RAW
            /Drivers/Modbus/PM5100_E7_RED/points/Energia$20Activa
            {ModelName}
          </h1>
        </div>

        <p className="flex justify-center items-center mb-6 block text-center leading-8 text-slate-600 leading normal font-light mt-6">
          NODE DATA
          {node}
        </p>

        <div className="flex justify-center items-center">
          <button className="mb-6 rounded-lg text-lg  w-96 h-10 bg-blue-900 text-[#ffffff] justify-center shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetails;

// import { useLoaderData } from 'react-router-dom';
// import { useEffect, useState } from "react";

// const NodeDetails = () => {
//   const [loadingData, setLoadingData] = useState(true);
//   const node = useLoaderData();

//   useEffect(() => {
//     if (node) {
//       setLoadingData(false);
//     }
//   }, [loadingData]);//Fetch data returned by the Loader

//   return (
//     <div className='flex flex-col gap-3 h-full'>

//       <Link to={`/node/${encodeURIComponent(node.fid)}`}>
//         View Node
//       </Link>
//     </div>
//   );
// };
