import Graph from "./Graph.jsx";
import { useEffect, useState } from "react";


  
const Home = () => {
  const [jsonData, setJsonData] = useState({});


  useEffect(() => {
    fetch("../../server/db_nodetres.json")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setJsonData(data);
      })
      .catch((error) => console.error("🤷 Error fetching data:", error));

    }, [])

   return (
<div>
    <div className="flex mx-8 my-4 h-[74vh] text-base overflow-hidden border-gray-300 border rounded-lg">
      <div className="relative w-full">
      {/* Graph component is rendered here */}
      <Graph 
        json_data={jsonData}
        background_color={"#fdfdfd"}
        link_color={"#BDBDBD"}
        label_color={"#0000FF"} 
        graph_type={"standard"}
      />
      </div>
    </div>
  </div>

);
};

export default Home;

