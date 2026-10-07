import {
  ProductGrid,
  ProductGridProps,
} from "../components/product/ProductGrid";
import { dataService } from "../utils/dataService";
export const WomenPage = (props: ProductGridProps) => (
  <ProductGrid
    {...props}
    products={dataService.getProducts({ ...props.filters, gender: "women" })}
    title="Women's collection"
    department="women"
  />
);
