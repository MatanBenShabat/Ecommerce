import axios from "axios";
import { useQuery } from "react-query";

const useGetProducts = () => {
  const { data, refetch, isLoading } = useQuery(
    "fetch-products",
    () => {
      return axios.get("http://localhost:5000/api-products/products");
    },
    {
      staleTime: 1 * 60 * 1000,
    }
  );
  const products = data?.data.data.products || [];

  return { products, getProducts: refetch, isLoading };
};

export default useGetProducts;
