"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Category, Order, OrderStatus, Product, Slider } from "@/types/database";
import { supabase } from "@/lib/supabase";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: p },
          { data: c },
          { data: s },
          { data: o }
        ] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("categories").select("*"),
          supabase.from("sliders").select("*").order("sort_order", { ascending: true }),
          supabase.from("orders").select("*").order("created_at", { ascending: false })
        ]);
        if (p) setProducts(p);
        if (c) setCategories(c);
        if (s) setSliders(s);
        if (o) setOrders(o);
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
      }
    }
    loadData();

    // Optional: Add realtime subscription for products
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => {
              if (prev.find((p) => p.id === payload.new.id)) return prev;
              return [payload.new as Product, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) => prev.map((item) => item.id === payload.new.id ? (payload.new as Product) : item));
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = useCallback((p: Partial<Product>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: crypto.randomUUID?.() || uid("p"),
      name: p.name ?? "Nomsiz",
      slug: (p.name ?? "nomsiz").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4),
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
      colors: [],
      mechanism: p.mechanism ?? "Avtomatik",
      is_active: p.is_active ?? true,
      is_new: p.is_new ?? true,
      created_at: now,
      updated_at: now,
    };
    // Optimistic
    setProducts((prev) => [newProduct, ...prev]);
    // Supabase
    supabase.from('products').insert(newProduct).then(({ error }) => {
      if (error) console.error("Error adding product:", error);
    });
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...p, updated_at: new Date().toISOString() } : item)));
    supabase.from('products').update({ ...p, updated_at: new Date().toISOString() }).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating product:", error);
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    supabase.from('products').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("Error deleting product:", error);
    });
  }, []);

  const addCategory = useCallback((c: Partial<Category>) => {
    const newCategory: Category = {
      id: crypto.randomUUID?.() || uid("c"),
      name: c.name ?? "Yangi kategoriya",
      slug: (c.name ?? "kategoriya").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: c.description ?? "",
      image_url: c.image_url ?? null,
      is_active: c.is_active ?? true,
      product_count: 0,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
    supabase.from('categories').insert(newCategory).then(({ error }) => {
      if (error) console.error("Error adding category:", error);
    });
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, c: Partial<Category>) => {
    setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
    supabase.from('categories').update(c).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating category:", error);
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((p) => p.id !== id));
    supabase.from('categories').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("Error deleting category:", error);
    });
  }, []);

  const addSlider = useCallback((s: Partial<Slider>) => {
    const newSlider: Slider = {
      id: crypto.randomUUID?.() || uid("s"),
      title: s.title ?? "Yangi Slayder",
      subtitle: s.subtitle ?? "",
      image_url: s.image_url ?? "",
      button_text: s.button_text ?? "",
      link: s.link ?? "/",
      sort_order: sliders.length + 1,
      is_active: s.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    setSliders((prev) => [...prev, newSlider]);
    supabase.from('sliders').insert(newSlider).then(({ error }) => {
      if (error) console.error("Error adding slider:", error);
    });
    return newSlider;
  }, [sliders.length]);

  const updateSlider = useCallback((id: string, s: Partial<Slider>) => {
    setSliders((prev) => prev.map((item) => (item.id === id ? { ...item, ...s } : item)));
    supabase.from('sliders').update(s).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating slider:", error);
    });
  }, []);

  const deleteSlider = useCallback((id: string) => {
    setSliders((prev) => prev.filter((p) => p.id !== id));
    supabase.from('sliders').delete().eq('id', id).then(({ error }) => {
      if (error) console.error("Error deleting slider:", error);
    });
  }, []);

  const reorderSlider = useCallback((id: string, direction: "up" | "down") => {
    // simplified optimistic
  }, []);

  const createOrder = useCallback((o: Omit<Order, "id" | "order_number" | "status" | "created_at">) => {
    const num = Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...o,
      id: crypto.randomUUID?.() || uid("o"),
      order_number: `ORD-${num}`,
      status: "new",
      created_at: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    supabase.from('orders').insert(newOrder).then(({ error }) => {
      if (error) console.error("Error adding order:", error);
    });
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    supabase.from('orders').update({ status }).eq('id', id).then(({ error }) => {
      if (error) console.error("Error updating order status:", error);
    });
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
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}

export async function fileToDataUrl(file: File, maxSize: number = 800, quality: number = 0.85): Promise<string> {
  // If we wanted to upload directly to supabase here, we could.
  // But for base64 fallback:
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
