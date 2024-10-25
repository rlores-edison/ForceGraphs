import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../components/Home.jsx';
//import NodeDetails from '../components/NodeDetails.jsx';
//import  getNodeByFid from '../services/nodeServices.js';    


const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
            // children: [
            // {
            // path: 'node:fid',
            // element: <NodeDetails />,
            // loader: async ({ params }) => {  // Fetch request 
            //     return getNodeByFid(params.fid);
            //    },
            },
]);
export default router;

