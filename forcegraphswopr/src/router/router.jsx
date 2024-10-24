import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../components/Home.jsx';
//import NodeDetails from '../components/NodeDetails.jsx';
//import  getNodeByFid from '../services/nodeServices.js';    


const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
            },
]);
export default router;

