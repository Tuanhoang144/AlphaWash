"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import type { Product, ProductCategory } from "@/types/Product";
import type { OrderProductDTO } from "@/types/OrderResponse";
import ProductPickerModal from "./ProductPickerModal";
import ProductLineItem from "./ProductLineItem";
import { formatPrice } from "@/shared/utils/checkValidate";
import { getProductLineTotal } from "@/shared/utils/order/calculatePrice";

interface ProductSectionProps {
  products: OrderProductDTO[];
  allProducts: Product[];
  categories: ProductCategory[];
  loadingProducts: boolean;
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (index: number) => void;
  onQuantityChange: (index: number, qty: number) => void;
}

export default function ProductSection({
  products,
  allProducts,
  categories,
  loadingProducts,
  onAddProduct,
  onRemoveProduct,
  onQuantityChange,
}: ProductSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedCodes = products.map((p) => p.productCode);
  const productSubtotal = products.reduce(
    (sum, p) => sum + getProductLineTotal(p),
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sản Phẩm
            {products.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({products.length})
              </span>
            )}
          </CardTitle>
          {products.length > 0 && (
            <span className="text-sm font-medium text-green-600">
              {formatPrice(productSubtotal)}đ
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((product, index) => (
          <ProductLineItem
            key={`${product.productCode}-${index}`}
            product={product}
            onQuantityChange={(qty) => onQuantityChange(index, qty)}
            onRemove={() => onRemoveProduct(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => setPickerOpen(true)}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Sản Phẩm
        </Button>

        <ProductPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          allProducts={allProducts}
          categories={categories}
          loadingProducts={loadingProducts}
          selectedProductCodes={selectedCodes}
          onSelectProduct={onAddProduct}
        />
      </CardContent>
    </Card>
  );
}
