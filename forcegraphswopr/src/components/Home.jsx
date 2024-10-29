import Graph from "./Graph.jsx";
import { useEffect, useState } from "react";


  
const Home = () => {
  const [jsonData, setJsonData] = useState({});


  useEffect(() => {
    fetch("../../server/db.json")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setJsonData(data);
      })
      .catch((error) => console.error("🤷 Error fetching data:", error));

    }, [])

   return (

    <div>
      {/* Graph component is rendered here */}
      <Graph json_data={jsonData} />
    </div>

);
};

export default Home;

