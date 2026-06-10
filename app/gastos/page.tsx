"use client";
import { useState } from "react";
import { Plus, Search, Trash2, Pencil, X, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: "gym", name: "Gym", icon: "💪", color: "#f97316" },
  { id: "comida", name: "Comida", icon: "🍔", color: "#ef4444" },
  { id: "nafta", name: "Nafta", icon: "⛽", color: "#f59e0b" },
  { id: "seguro", name: "Seguro", icon: "🛡️", color: "#6366f1" },
  { id: "servicios", name: "Servicios", icon: "💡", color: "#0ea5e9" },
  { id: "salud", name: "Salud", icon: "❤️", color: "#ec4899" },
  { id: "transporte", name: "Transporte", icon: "🚗", color: "#8b5cf6" },
  { id: "entretenimiento", name: "Entretenimiento", icon: "🎬", color: "#10b981" },
  { id: "impuestos", name: "Impuestos", icon: "📋", color: "#6b7280" },
  { id: "compras", name: "Compras", icon: "🛒", color: "#14b8a6" },
  { id: "hogar", name: "Hogar", icon: "🏠", color: "#84cc16" },
  { id: "educacion", name: "Educacion", icon: "📚", color: "#a855f7" },
  { id: "otros", name: "Otros", icon: "📦", color: "#9ca3af" },
];

function getCat(id: string) {
  return CATEGORIES.find(c => c.id === id) || { id, name: id, icon: "📦", color: "#9ca3af" };
}

function fmt(n: number) {
  return "$" + n.toLocaleString("es-AR");
}

function getKey(uid: string) {
  return "ff_exp_" + uid;
}

function loadData(uid: string): any[] {
  try {
    const raw = localStorage.getItem(getKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(uid: string, data: any[]) {
  localStorage.setItem(getKey(uid), JSON.stringify(data));
}

export default function GastosPage() {
  const userId = "demo";
  const [expenses, setExpenses] = useState<any[]>(() => loadData(userId));
  const [tab, setTab] = useState("Resumen");
  const [period, setPeriod] = useState("Mes");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().split("T")[0];
  })();
  const monthStart = today.slice(0, 7) + "-01";
  const yearStart = today.slice(0, 4) + "-01-01";

  function sum(list: any[]) {
    return list.reduce((s: number, e: any) => s + e.amount, 0);
  }

  const totals: any = {
    Hoy: sum(expenses.filter((e: any) => e.date === today)),
    Semana: sum(expenses.filter((e: any) => e.date >= weekStart)),
    Mes: sum(expenses.filter((e: any) => e.date >= monthStart)),
    Año: sum(expenses.filter((e: any) => e.date >= yearStart)),
  };

  const monthExpenses = expenses.filter((e: any) => e.date >= monthStart);
  const monthTotal = totals.Mes;
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyAvg = dayOfMonth > 0 ? monthTotal / dayOfMonth : 0;
  const projection = dailyAvg * daysInMonth;

  const byCat = CATEGORIES.map(c => ({
    ...c,
    total: sum(monthExpenses.filter((e: any) => e.categoryId === c.id)),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ms = d.toISOString().slice(0, 7) + "-01";
    const me = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    return {
      label: d.toLocaleDateString("es", { month: "short" }),
      total: sum(expenses.filter((e: any) => e.date >= ms && e.date <= me)),
    };
  });
  const maxMonth = Math.max(...months.map(m => m.total), 1);

  const filtered = expenses.filter((e: any) => {
    if (filterCat && e.categoryId !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      const c = getCat(e.categoryId);
      return (e.description || "").toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    }
    return true;
  });

  function addExpense(data: any) {
    const updated = [{ id: Date.now().toString(), userId, ...data }, ...expenses];
    setExpenses(updated);
    saveData(userId, updated);
  }

  function updateExpense(id: string, data: any) {
    const updated = expenses.map((e: any) => e.id === id ? { ...e, ...data } : e);
    setExpenses(updated);
    saveData(userId, updated);
  }

  function deleteExpense(id: string) {
    const updated = expenses.filter((e: any) => e.id !== id);
    setExpenses(updated);
    saveData(userId, updated);
  }

  const s = { background: "var(--bg-app)" } as any;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg-app)" }}>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Gastos</h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Control financiero</p>
          </div>
          <button onClick={() => { setEditing(null); setFormOpen(true); }}
            style={{ background: "#6057f1", width: 40, height: 40, borderRadius: 14, border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["Hoy", "Semana", "Mes", "Año"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ flex: 1, padding: "7px 0", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", border: period === p ? "1px solid #6057f1" : "1px solid var(--border)", background: period === p ? "#6057f1" : "var(--bg-card-2)", color: period === p ? "white" : "var(--text-secondary)" }}>
              {p}
            </button>
          ))}
        </div>

        <div style={{ background: "linear-gradient(135deg,#6057f1,#4329ca)", borderRadius: 20, padding: 16, marginBottom: 12 }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 4px" }}>
            {period === "Hoy" ? "Hoy" : period === "Semana" ? "Esta semana" : period === "Mes" ? "Este mes" : "Este año"}
          </p>
          <p style={{ color: "white", fontSize: 30, fontWeight: 700, margin: 0 }}>{fmt(totals[period])}</p>
          {period === "Mes" && (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "6px 0 0" }}>
              Prom. dia: {fmt(Math.round(dailyAvg))} · Proyeccion: {fmt(Math.round(projection))}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {["Resumen", "Movimientos", "Graficos"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", border: tab === t ? "1px solid #6057f1" : "1px solid var(--border)", background: tab === t ? "var(--bg-card)" : "var(--bg-card-2)", color: tab === t ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 96px" }}>
        {tab === "Resumen" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["Hoy","Semana","Mes","Año"] as const).map((p, i) => (
                <div key={p} style={{ background: "var(--bg-card)", borderRadius: 16, padding: 14, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 4px" }}>{p}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: ["#6057f1","#0ea5e9","#f59e0b","#10b981"][i] }}>{fmt(totals[p])}</p>
                </div>
              ))}
            </div>
            {byCat[0] && (
              <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 14, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: byCat[0].color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{byCat[0].icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Mayor gasto este mes</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{byCat[0].name}</p>
                </div>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{fmt(byCat[0].total)}</p>
              </div>
            )}
            {expenses.length === 0 ? (
              <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 40, textAlign: "center", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 36, margin: "0 0 8px" }}>💸</p>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Sin gastos</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>Registra tu primer gasto</p>
                <button onClick={() => setFormOpen(true)} style={{ background: "#6057f1", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>Registrar gasto</button>
              </div>
            ) : expenses.slice(0, 6).map((e: any) => (
              <ExpenseRow key={e.id} expense={e} onEdit={() => { setEditing(e); setFormOpen(true); }} onDelete={() => deleteExpense(e.id)} />
            ))}
          </div>
        )}

        {tab === "Movimientos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                style={{ width: "100%", background: "var(--bg-card-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px 10px 34px", fontSize: 14, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              <button onClick={() => setFilterCat("")}
                style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: !filterCat ? "1px solid #6057f1" : "1px solid var(--border)", background: !filterCat ? "#6057f1" : "var(--bg-card-2)", color: !filterCat ? "white" : "var(--text-secondary)", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 }}>
                Todas
              </button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? "" : c.id)}
                  style={{ padding: "6px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid var(--border)", background: filterCat === c.id ? c.color : "var(--bg-card-2)", color: filterCat === c.id ? "white" : "var(--text-secondary)", whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            {filtered.map((e: any) => (
              <ExpenseRow key={e.id} expense={e} onEdit={() => { setEditing(e); setFormOpen(true); }} onDelete={() => deleteExpense(e.id)} />
            ))}
          </div>
        )}

        {tab === "Graficos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>Ultimos 6 meses</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {months.map((m, i) => (
                  <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: i === 5 ? "#6057f1" : "#6057f120", height: Math.max(4, (m.total / maxMonth) * 64) }} />
                    <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>Por categoria este mes</p>
              {byCat.length === 0 ? <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center" }}>Sin datos</p> :
                byCat.map(c => (
                  <div key={c.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{c.icon} {c.name}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{monthTotal > 0 ? Math.round(c.total / monthTotal * 100) : 0}%</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(c.total)}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "var(--bg-card-2)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: c.color, width: (monthTotal > 0 ? (c.total / monthTotal * 100) : 0) + "%", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px" }}>Proyeccion del mes</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div><p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Hasta hoy</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{fmt(monthTotal)}</p></div>
                <ArrowRight size={18} color="var(--text-tertiary)" />
                <div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>Fin de mes</p><p style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", margin: 0 }}>{fmt(Math.round(projection))}</p></div>
              </div>
              <div style={{ height: 8, background: "var(--bg-card-2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#6057f1", width: Math.min(100, projection > 0 ? (monthTotal / projection * 100) : 0) + "%", borderRadius: 99 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <ExpenseForm initial={editing} onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={data => { editing ? updateExpense(editing.id, data) : addExpense(data); setFormOpen(false); setEditing(null); }} />
      )}
    </div>
  );
}

function ExpenseRow({ expense, onEdit, onDelete }: any) {
  const cat = getCat(expense.categoryId);
  const [show, setShow] = useState(false);
  return (
    <div onClick={() => setShow(v => !v)} style={{ background: "var(--bg-card)", borderRadius: 16, padding: 14, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expense.description || cat.name}</p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{cat.name} · {expense.date}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{fmt(expense.amount)}</p>
        {show && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
            <button onClick={e => { e.stopPropagation(); onEdit(); }} style={{ padding: 6, borderRadius: 8, background: "var(--bg-card-2)", border: "none", cursor: "pointer" }}><Pencil size={12} /></button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ padding: 6, borderRadius: 8, background: "#fee2e2", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseForm({ initial, onClose, onSave }: any) {
  const [amount, setAmount] = useState(initial ? initial.amount.toString() : "");
  const [catId, setCatId] = useState(initial ? initial.categoryId : CATEGORIES[0].id);
  const [desc, setDesc] = useState(initial ? (initial.description || "") : "");
  const [date, setDate] = useState(initial ? initial.date : new Date().toISOString().split("T")[0]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--bg-card)", borderRadius: "24px 24px 0 0", padding: "0 20px", paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{initial ? "Editar gasto" : "Nuevo gasto"}</h2>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 99, background: "var(--bg-card-2)", border: "none", cursor: "pointer" }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>Monto</p>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus inputMode="decimal"
          style={{ width: "100%", background: "var(--bg-card-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px" }}>Categoria</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 16 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCatId(c.id)}
              style={{ padding: "8px 4px", borderRadius: 12, border: "1px solid var(--border)", background: catId === c.id ? c.color : "var(--bg-card-2)", color: catId === c.id ? "white" : "var(--text-secondary)", fontSize: 11, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", textAlign: "center" }}>{c.name}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>Fecha</p>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: "100%", background: "var(--bg-card-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>Descripcion (opcional)</p>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Almuerzo con cliente"
          style={{ width: "100%", background: "var(--bg-card-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", marginBottom: 20 }} />
        <button
          onClick={() => { const n = parseFloat(amount.replace(",",".")); if (!n || n <= 0) return; onSave({ amount: n, categoryId: catId, description: desc || undefined, date }); }}
          disabled={!amount}
          style={{ width: "100%", background: "#6057f1", color: "white", border: "none", borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: amount ? 1 : 0.4 }}>
          {initial ? "Guardar cambios" : "Registrar gasto"}
        </button>
      </div>
    </div>
  );
}
