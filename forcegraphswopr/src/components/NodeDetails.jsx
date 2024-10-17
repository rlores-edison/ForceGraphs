import WOPRLogo from "../assets/WOPRLogo.png";

const NodeDetails = ({ ModelName, node, learnMoreLink }) => {
  

  return (
    <div className="relative flex flex-col my-6 bg-light-gray shadow-sm border border-slate-300 rounded-lg w-100 p-10">
      <div className="flex items-center mb-20">
      <img
            alt="logo"
            src={WOPRLogo}
            className="w-10 h-10 mb-1"
          />

        <h5 className="ml-3 text-slate-800 text-xl font-semibold">
          ATM_Raquel Oreilly_Jace__RAW
          /Drivers/Modbus/PM5100_E7_RED/points/Energia$20Activa
          {ModelName}
        </h5>
      </div>
      <p className="block text-slate-600 leading-normal font-light mb-20">
        {" "}
        NODE DATA
        {node}
      </p>

      <button
        className="middle none w-1/2 rounded-lg bg-blue-900 py-3 px-6 text-center align-middle font-sans text-md  text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        type="button"
      >Close
      </button>
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
