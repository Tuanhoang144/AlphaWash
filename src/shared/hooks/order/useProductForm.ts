"use client";

import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/types/Product";
import { useProductManager } from "@/services/useProductManager";
import { useProductCategoryManager } from "@/services/useProductCategoryManager";

export function useProductForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { getActive: getActiveProducts } = useProductManager();
  const { getActive: getActiveCategories } = useProductCategoryManager();

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingProducts(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getActiveProducts(),
          getActiveCategories(),
        ]);

        if (mounted) {
          setProducts(productsData);
          setCategories(
            [...categoriesData].sort(
              (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
            )
          );
        }
      } catch (e) {
        console.error("[useProductForm] Error loading products:", e);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [getActiveProducts, getActiveCategories]);

  return { products, categories, loadingProducts };
}
