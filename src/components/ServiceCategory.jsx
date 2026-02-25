import { Navigate, useLocation, useParams } from "react-router-dom";
import { buildServicesUrl, parseServicesParams } from "../utils/serviceRouting";

export default function ServiceCategory() {
  const location = useLocation();
  const routeParams = useParams();

  const { category, subcategory } = parseServicesParams(location.search, routeParams);
  const redirectUrl = buildServicesUrl(category, subcategory);

  return <Navigate to={redirectUrl} replace />;
}
