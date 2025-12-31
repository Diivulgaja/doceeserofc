// src/Admin.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trash2, Clock, Check, Loader2, LayoutDashboard, 
  ShoppingBag, LogOut, Bell, BellOff, MessageCircle, 
  MapPin, Phone, User, DollarSign, TrendingUp, Calendar, 
  Menu, X, Search, ChevronRight, Zap, Printer, ChefHat, Bike, Cake
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';

// Chaves do Supabase (Mantidas)
const supabaseUrl = 'https://elpinlotdogazhpdwlqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGlubG90ZG9nYXpocGR3bHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU3MjEsImV4cCI6MjA4MDkwMTcyMX0.alb18e60SkJGV1EBcjJb8CSmj7rshm76qcxRog_B2uY';

/* --- CONFIGURAÇÕES --- */
const ADMIN_PASSWORD = '071224';
const TABLE = 'doceeser_pedidos';
const MOTOBOY_NUMBER = '5548991692018'; 

/* --- UTILITÁRIOS --- */
const formatCurrency = (val) => `R$ ${Number(val || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Calcula tempo decorrido desde o pedido
const getElapsedTime = (dateStr) => {
  if (!dateStr) return '0min';
  const diff = new Date() - new Date(dateStr);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
};

export default function Admin() {
  const [supabase, setSupabase] = useState(null);
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('doceeser_admin'));
  const [passwordInput, setPasswordInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [view, setView] = useState('kanban'); // 'kanban' | 'dashboard'
  const [autoSendWhatsapp, setAutoSendWhatsapp] = useState(false);
  const [stats, setStats] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // Atualiza timers a cada minuto
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 1. CARREGAR SUPABASE VIA SCRIPT TAG
  useEffect(() => {
    if (window.supabase && window.supabase.createClient) {
      setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        if (window.supabase) {
          setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // Tocar som
  const playSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) { console.warn('Erro audio', e); }
  };

  // WhatsApp
  const formatWhatsappMessage = (order) => {
    const customer = order.customer || {};
    const fullAddress = `${customer.rua || ''}, ${customer.numero || ''} - ${customer.bairro || ''}`.trim();
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    
    const itemsList = Array.isArray(order.items)
      ? order.items.map(it => `• ${it.quantity || 1}x ${it.name}${it.toppings?.length ? ` (+${it.toppings.join(', ')})` : ''}`).join('\n')
      : '';

    return `*NOVO PEDIDO #${order.id.slice(0, 6).toUpperCase()}*\n\n` +
           `👤 *${customer.nome || 'Cliente'}*\n` +
           `📍 ${fullAddress}\n` +
           `🗺 Link: ${mapsLink}\n\n` +
           `📝 *Itens:*\n${itemsList}\n\n` +
           `💰 *Total: ${formatCurrency(order.total)}*`;
  };

  const sendWhatsapp = (order) => {
    const text = formatWhatsappMessage(order);
    window.open(`https://wa.me/${MOTOBOY_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Fetch e Realtime
  const fetchOrders = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .neq('status', 'user_account') 
      .order('createdAt', { ascending: false });
      
    if (!error) {
      setOrders(data || []);
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = data.filter(o => o.createdAt && o.createdAt.startsWith(today));
      setStats({
        count: todayOrders.length,
        total: todayOrders.reduce((acc, curr) => acc + (curr.total || 0), 0)
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuth || !supabase) return;
    fetchOrders();

    const channel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, payload => {
        const newOrder = payload.new;
        if (newOrder && newOrder.status !== 'user_account') {
          if (soundEnabled) playSound();
          if (autoSendWhatsapp) sendWhatsapp(newOrder);
          fetchOrders();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, () => fetchOrders())
      .subscribe();

    return () => { try { supabase.removeChannel(channel); } catch(e) {} };
  }, [isAuth, soundEnabled, autoSendWhatsapp, supabase]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem('doceeser_admin', '1');
      setIsAuth(true);
    } else alert('Senha incorreta');
  };

  const updateStatus = async (id, status) => {
    if (!supabase) return;
    await supabase.from(TABLE).update({ status }).eq('id', id);
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
  };

  // Separação por colunas (Kanban)
  const columns = useMemo(() => {
    return {
      novos: orders.filter(o => o.status === 'novo'),
      preparando: orders.filter(o => o.status === 'preparando'),
      prontos: orders.filter(o => o.status === 'pronto'),
      em_rota: orders.filter(o => o.status === 'em_rota'),
      entregues: orders.filter(o => o.status === 'entregue'),
    };
  }, [orders]);

  // --- TELA DE LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-amber-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Cake className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Doce É Ser</h1>
            <p className="text-gray-500 text-sm">Gestão de Pedidos</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" autoFocus
              className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none transition"
              placeholder="Senha de acesso"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
            />
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-amber-600/20">
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LAYOUT PRINCIPAL ---
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 z-20 shadow-sm">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 font-bold text-xl mb-4 shadow-sm">
          <Cake className="w-6 h-6" />
        </div>
        
        <SidebarIcon icon={LayoutDashboard} active={view === 'kanban'} onClick={() => setView('kanban')} tooltip="Pedidos" />
        <SidebarIcon icon={TrendingUp} active={view === 'dashboard'} onClick={() => setView('dashboard')} tooltip="Desempenho" />
        
        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`p-3 rounded-xl transition ${soundEnabled ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-gray-600'}`}
            title="Som"
          >
            {soundEnabled ? <Bell className="w-6 h-6"/> : <BellOff className="w-6 h-6"/>}
          </button>
          <button 
            onClick={() => { localStorage.removeItem('doceeser_admin'); setIsAuth(false); }} 
            className="p-3 text-gray-400 hover:text-red-500 transition"
            title="Sair"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Gestor de Pedidos</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vendas Hoje</p>
                <p className="text-base font-black text-gray-800">{formatCurrency(stats.total)}</p>
             </div>
             <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
             <button 
               onClick={() => setAutoSendWhatsapp(!autoSendWhatsapp)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition border ${autoSendWhatsapp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
             >
               <MessageCircle className="w-3 h-3" /> Auto Zap: {autoSendWhatsapp ? 'ON' : 'OFF'}
             </button>
          </div>
        </header>

        {/* ÁREA DE VISUALIZAÇÃO */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          
          {view === 'kanban' && (
            <div className="h-full flex gap-4 min-w-[1200px]">
              {/* PENDENTE */}
              <KanbanColumn 
                title="Pendente" 
                count={columns.novos.length} 
                color="border-t-4 border-t-amber-500"
              >
                {columns.novos.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="novo" 
                    onAction={(id) => updateStatus(id, 'preparando')}
                    onZap={sendWhatsapp}
                  />
                ))}
              </KanbanColumn>

              {/* EM PREPARO */}
              <KanbanColumn 
                title="Em Preparo" 
                count={columns.preparando.length} 
                color="border-t-4 border-t-blue-500"
              >
                {columns.preparando.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="preparando" 
                    onAction={(id) => updateStatus(id, 'pronto')}
                    onZap={sendWhatsapp}
                  />
                ))}
              </KanbanColumn>

              {/* PRONTO */}
              <KanbanColumn 
                title="Pronto" 
                count={columns.prontos.length} 
                color="border-t-4 border-t-green-500"
              >
                {columns.prontos.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="pronto" 
                    onAction={(id) => updateStatus(id, 'em_rota')}
                    onZap={sendWhatsapp}
                  />
                ))}
              </KanbanColumn>

              {/* EM ROTA */}
              <KanbanColumn 
                title="Em Rota" 
                count={columns.em_rota.length} 
                color="border-t-4 border-t-purple-500"
              >
                {columns.em_rota.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="em_rota" 
                    onAction={(id) => updateStatus(id, 'entregue')}
                    onZap={sendWhatsapp}
                  />
                ))}
              </KanbanColumn>

              {/* ENTREGUE */}
              <KanbanColumn 
                title="Entregue" 
                count={columns.entregues.length} 
                color="border-t-4 border-t-gray-400"
              >
                {columns.entregues.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    type="entregue" 
                    onAction={() => {}} 
                    onZap={sendWhatsapp}
                    isFinished={true}
                  />
                ))}
              </KanbanColumn>
            </div>
          )}

          {view === 'dashboard' && (
             <div className="h-full overflow-y-auto">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                   <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard em Breve</h2>
                   <p className="text-gray-500">Estamos preparando gráficos incríveis para você.</p>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* --- COMPONENTES VISUAIS --- */

const SidebarIcon = ({ icon: Icon, active, onClick, tooltip }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all duration-300 group relative ${
      active 
      ? 'bg-amber-100 text-amber-600 shadow-sm' 
      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
    }`}
  >
    <Icon className="w-6 h-6" />
    <span className="absolute left-16 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-medium shadow-xl">
      {tooltip}
    </span>
  </button>
);

const KanbanColumn = ({ title, count, children, color }) => (
  <div className={`flex-1 flex flex-col bg-gray-50 rounded-xl h-full overflow-hidden border border-gray-200 shadow-sm min-w-[260px] ${color}`}>
    <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center">
      <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{title}</h3>
      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold border border-gray-200">{count}</span>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-100 custom-scrollbar">
      {children}
    </div>
  </div>
);

const OrderCard = ({ order, type, onAction, onZap, isFinished }) => {
  const isNew = type === 'novo';
  
  const getActionLabel = () => {
    switch(type) {
        case 'novo': return 'ACEITAR';
        case 'preparando': return 'PRONTO';
        case 'pronto': return 'SAIU';
        case 'em_rota': return 'ENTREGUE';
        default: return '';
    }
  };

  const getActionColor = () => {
    switch(type) {
        case 'novo': return 'bg-amber-600 hover:bg-amber-700';
        case 'preparando': return 'bg-blue-600 hover:bg-blue-700';
        case 'pronto': return 'bg-green-600 hover:bg-green-700';
        case 'em_rota': return 'bg-purple-600 hover:bg-purple-700';
        default: return 'bg-gray-400';
    }
  };
  
  return (
    <div className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col group ${isNew ? 'ring-2 ring-amber-400' : ''}`}>
      
      {/* Header Compacto */}
      <div className="flex justify-between items-start mb-2 pb-2 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
             <span className="font-bold text-base text-gray-800">#{order.id.slice(0, 4).toUpperCase()}</span>
             {isNew && <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NOVO</span>}
          </div>
          <div className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[120px]">
             {order.customer?.nome?.split(' ')[0] || 'Cliente'}
          </div>
        </div>
        <div className="text-right">
           <span className={`text-[10px] font-bold flex items-center justify-end gap-1 ${isNew ? 'text-amber-600' : 'text-gray-400'}`}>
             <Clock className="w-3 h-3" /> {getElapsedTime(order.createdAt)}
           </span>
        </div>
      </div>

      {/* Corpo Compacto */}
      <div className="flex-1 mb-2">
         <ul className="space-y-1">
            {Array.isArray(order.items) ? order.items.map((it, i) => (
              <li key={i} className="text-xs text-gray-700 leading-tight">
                 <span className="font-bold mr-1">{it.quantity}x</span>
                 {it.name}
                 {it.toppings && it.toppings.length > 0 && (
                   <span className="text-[10px] text-gray-400 block pl-4">+ {it.toppings[0]}...</span>
                 )}
              </li>
            )) : <li className="text-gray-400 italic text-[10px]">Sem itens</li>}
         </ul>
      </div>

      <div className="flex justify-between items-center text-xs font-bold text-gray-800 border-t border-gray-50 pt-2 mb-2">
        <span>Total:</span>
        <span>{formatCurrency(order.total)}</span>
      </div>

      {/* Botões Compactos */}
      {!isFinished && (
        <div className="flex gap-2">
           <button 
             onClick={() => onAction(order.id)}
             className={`flex-1 py-1.5 rounded text-[10px] font-bold text-white transition active:scale-[0.98] ${getActionColor()}`}
           >
             {getActionLabel()}
           </button>

           <button 
             onClick={() => onZap(order)}
             className="px-2 rounded border border-gray-200 bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600 transition"
             title="WhatsApp"
           >
             <MessageCircle className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};
