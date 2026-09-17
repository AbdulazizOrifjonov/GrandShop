"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Category, Order, OrderStatus, Product, Slider } from "@/types/database";
import { sampleCategories, sampleProducts, sampleSliders, sampleOrders } from "@/lib/sample-data";

const KEYS = {
  products: "gws_products",
  categories: "gws_categories",
  sliders: "gws_sliders",
  orders: "gws_orders",
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface StoreValue {
  products: Product[];
  categories: Category[];
  sliders: Slider[];
  orders: Order[];
  ready: boolean;

  addProduct: (p: Partial<Product>) => Product;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCategory: (c: Partial<Category>) => Category;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addSlider: (s: Partial<Slider>) => Slider;
  updateSlider: (id: string, s: Partial<Slider>) => void;
  deleteSlider: (id: string) => void;
  reorderSlider: (id: string, direction: "up" | "down") => void;

  createOrder: (o: Omit<Order, "id" | "order_number" | "status" | "created_at">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  profileSidebarOpen: boolean;
  setProfileSidebarOpen: (v: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [sliders, setSliders] = useState<Slider[]>(sampleSliders);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [ready, setReady] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(true);

  useEffect(() => {
    const loadedProducts = load(KEYS.products, sampleProducts);
    const missingProducts = sampleProducts.filter(sp => !loadedProducts.some((lp: Product) => lp.id === sp.id));
    setProducts([...missingProducts, ...loadedProducts]);
    
    setCategories(load(KEYS.categories, sampleCategories));
    const loadedSliders = load(KEYS.sliders, sampleSliders);
    setSliders(loadedSliders.length < 5 ? sampleSliders : loadedSliders);
    setOrders(load(KEYS.orders, sampleOrders));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) save(KEYS.products, products); }, [products, ready]);
  useEffect(() => { if (ready) save(KEYS.categories, categories); }, [categories, ready]);
  useEffect(() => { if (ready) save(KEYS.sliders, sliders); }, [sliders, ready]);
  useEffect(() => { if (ready) save(KEYS.orders, orders); }, [orders, ready]);

  const addProduct = useCallback((p: Partial<Product>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: uid("p"),
      name: p.name ?? "Nomsiz mahsulot",
      slug: (p.name ?? "mahsulot").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4),
      description: p.description ?? "",
      price: p.price ?? 0,
      old_price: p.old_price ?? null,
      discount: p.discount ?? null,
      category_id: p.category_id ?? null,
      brand: p.brand ?? "",
      stock: p.stock ?? 0,
      sku: p.sku ?? "",
      rating: p.rating ?? 0,
      reviews_count: 0,
      image: p.image ?? null,
      images: p.images ?? [],
      specifications: p.specifications ?? {},
      is_active: p.is_active ?? true,
      is_new: p.is_new ?? true,
      created_at: now,
      updated_at: now,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...p, updated_at: new Date().toISOString() } : item))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCategory = useCallback((c: Partial<Category>) => {
    const newCategory: Category = {
      id: uid("c"),
      name: c.name ?? "Yangi kategoriya",
      slug: (c.name ?? "kategoriya").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: c.description ?? "",
      image_url: c.image_url ?? null,
      is_active: c.is_active ?? true,
      product_count: 0,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, c: Partial<Category>) => {
    setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addSlider = useCallback((s: Partial<Slider>) => {
    const newSlider: Slider = {
      id: uid("s"),
      title: s.title ?? "Yangi slider",
      subtitle: s.subtitle ?? "",
      image_url: s.image_url ?? "",
      button_text: s.button_text ?? "Ko'rish",
      link: s.link ?? "/products",
      sort_order: s.sort_order ?? 99,
      is_active: s.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    setSliders((prev) => [...prev, newSlider]);
    return newSlider;
  }, []);

  const updateSlider = useCallback((id: string, s: Partial<Slider>) => {
    setSliders((prev) => prev.map((item) => (item.id === id ? { ...item, ...s } : item)));
  }, []);

  const deleteSlider = useCallback((id: string) => {
    setSliders((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderSlider = useCallback((id: string, direction: "up" | "down") => {
    setSliders((prev) => {
      const sorted = [...prev].sort((a, b) => a.sort_order - b.sort_order);
      const idx = sorted.findIndex((s) => s.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const tmp = sorted[idx].sort_order;
      sorted[idx].sort_order = sorted[swapIdx].sort_order;
      sorted[swapIdx].sort_order = tmp;
      return sorted.map((s) => ({ ...s }));
    });
  }, []);

  const createOrder = useCallback(
    (o: Omit<Order, "id" | "order_number" | "status" | "created_at">) => {
      const newOrder: Order = {
        ...o,
        id: uid("o"),
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "new",
        created_at: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        sliders,
        orders,
        ready,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSlider,
        updateSlider,
        deleteSlider,
        reorderSlider,
        createOrder,
        updateOrderStatus,
        profileSidebarOpen,
        setProfileSidebarOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function fileToDataUrl(file: File, maxSize: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG to save huge amounts of space in localStorage
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Rasm yuklashda xatolik"));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
