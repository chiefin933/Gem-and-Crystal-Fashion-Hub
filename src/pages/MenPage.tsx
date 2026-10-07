import {
  ProductGrid,
  ProductGridProps,
} from "../components/product/ProductGrid";
import { dataService } from "../utils/dataService";
export const MenPage = (props: ProductGridProps) => (
  <ProductGrid
    {...props}
    products={dataService.getProducts({ ...props.filters, gender: "men" })}
    title="Men's collection"
    department="men"
  />
);
