/**
 * Mad Over Tiramisu — Express Backend
 * Run: npx ts-node server/index.ts
 * Install: npm install express cors uuid && npm install -D @types/express @types/cors @types/uuid ts-node
 */

import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  name: string;
  size?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  items: OrderItem[];
  location: string;
  deliveryType: "delivery" | "pickup";
  address: { name: string; street?: string; suburb?: string; phone: string } | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// In-memory store — swap for Postgres/MySQL in production
const orders: Order[] = [];

// ─── ROUTES ──────────────────────────────────────────────────────────────────

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Mad Over Tiramisu API" });
});

// All orders (admin use)
app.get("/api/orders", (_req: Request, res: Response) => {
  res.json({ orders });
});

// Single order
app.get("/api/orders/:id", (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

// Create order
app.post("/api/orders", (req: Request, res: Response) => {
  const { items, location, deliveryType, address } = req.body as {
    items: OrderItem[];
    location: string;
    deliveryType: "delivery" | "pickup";
    address: Order["address"];
  };

  if (!items?.length) return res.status(400).json({ error: "Cart is empty" });
  if (!location) return res.status(400).json({ error: "Location is required" });
  if (!deliveryType) return res.status(400).json({ error: "Delivery type is required" });

  const subtotal = parseFloat(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );
  const deliveryFee = deliveryType === "delivery" ? 5 : 0;
  const total = parseFloat((subtotal + deliveryFee).toFixed(2));

  const order: Order = {
    id: `MOT-${uuidv4().slice(0, 6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    items,
    location,
    deliveryType,
    address: address ?? null,
    subtotal,
    deliveryFee,
    total,
  };

  orders.push(order);
  console.log(`[ORDER] ${order.id} | ${order.location} | ${order.deliveryType} | $${order.total}`);

  res.status(201).json({ success: true, orderId: order.id, order });
});

// Update status (admin)
app.patch("/api/orders/:id/status", (req: Request, res: Response) => {
  const valid = ["pending", "preparing", "ready", "out-for-delivery", "delivered", "cancelled"];
  const { status } = req.body as { status: string };
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, order });
});

// Products catalogue
app.get("/api/products", (_req: Request, res: Response) => {
  res.json({
    products: [
      {
        id: "classic-cake",
        name: "Classic Tiramisu",
        subtitle: "Signature Cake",
        description: "Coffee-soaked savoiardi, velvety mascarpone, premium cocoa dust. Feeds 4–6.",
        price: 32,
        hasSizes: false,
        tag: "Best Seller",
      },
      {
        id: "classic-cup",
        name: "Classic Tiramisu",
        subtitle: "Individual Cup",
        description: "The original. Espresso layers, silky mascarpone, generous cocoa dusting.",
        price: { small: 9, regular: 14 },
        hasSizes: true,
        tag: "Classic",
      },
      {
        id: "lotus-cup",
        name: "Lotus Biscoff",
        subtitle: "Tiramisu Cup",
        description: "Caramelised Biscoff twist with a whole biscuit on top.",
        price: { small: 10, regular: 15 },
        hasSizes: true,
        tag: "Fan Favourite",
      },
      {
        id: "pistachio-cup",
        name: "Pistachio Tiramisu",
        subtitle: "Tiramisu Cup",
        description: "Pistachio cream drizzled over crushed nuts and mascarpone layers.",
        price: { small: 10, regular: 15 },
        hasSizes: true,
        tag: "New",
      },
    ],
  });
});

// Locations
app.get("/api/locations", (_req: Request, res: Response) => {
  res.json({
    locations: [
      {
        id: "hopes-island",
        name: "Hope Island",
        address: "Mariners Cove, Hope Island QLD 4212",
        phone: "+61 400 000 001",
        hours: "Tue–Sun: 10am–6pm",
      },
      {
        id: "emerald-lakes",
        name: "Emerald Lakes",
        address: "Emerald Lakes Dr, Carrara QLD 4211",
        phone: "+61 400 000 002",
        hours: "Tue–Sun: 10am–6pm",
      },
    ],
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🍮 Mad Over Tiramisu API → http://localhost:${PORT}`);
});
