// src/App.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart, Plus, Minus, X, Home, ChevronRight, Truck, MapPin,
  Loader2, Cake, Heart, Trash2, Check, Clock, Utensils, Star, Phone,
  QrCode, Copy, CreditCard, Bike, Package, User, Lock, Gift, LogOut,
  ChevronDown, AlertCircle, CheckCircle, Info, FileText
} from "lucide-react";

/* ------------- CONFIGURAÇÕES ------------- */
const COLLECTION_ORDERS = "doceeser_pedidos"; 
const AVAILABILITY_TABLE = "doceeser_availability";
const DELIVERY_FEE = 2.99;
const ETA_TEXT = "20–35 min";
const LOYALTY_GOAL = 10; 

// URL DA LOGO ATUALIZADA
const LOGO_URL = "https://i.imgur.com/4LsEEuy.jpeg";

// URL DO SEU BACKEND LOCAL
const API_URL = "http://localhost:3001/create-payment";

// Chaves do Supabase
const SUPABASE_URL = 'https://elpinlotdogazhpdwlqr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGlubG90ZG9nYXpocGR3bHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU3MjEsImV4cCI6MjA4MDkwMTcyMX0.alb18e60SkJGV1EBcjJb8CSmj7rshm76qcxRog_B2uY';

// --- DADOS AÇAÍ ---
const ACAI_TOPPINGS = [
  { name: "Banana", price: 0.01 },
  { name: "Morango", price: 2.00 },
  { name: "Leite Ninho", price: 1.00 },
  { name: "Leite Condensado", price: 0.01 },
  { name: "Creme de Ninho", price: 1.00 },
  { name: "Nutella", price: 3.00 },
  { name: "Amendoim", price: 1.00 },
];
const ACAI_ID = 18;
const ACAI_BASE_PRICE = 17.90;

// --- PRODUTOS ---
const initialProducts = [
  { id: 9, name: "Red velvet com Ninho e Morangos", price: 15.90, category: 'bolos', description: "Massa aveludada e macia, coberta com creme de leite Ninho cremoso.", imageUrl: "https://i.imgur.com/3UDWhLR.png" },
  { id: 2, name: "Bolo Cenoura com chocolate", price: 15.90, category: 'bolos', description: "Mini vulcão de cenoura com explosão de chocolate.", imageUrl: "https://i.imgur.com/aaUdL2b.png" },
  { id: 10, name: "Chocolate com Morangos", price: 15.90, category: 'bolos', description: "Bolo fofinho de chocolate com morangos.", imageUrl: "https://i.imgur.com/MMbQohl.png" },
  { id: 13, name: "Chocolatudo!!!", price: 15.90, category: 'bolos', description: "Bolo com muito chocolate.", imageUrl: "https://i.imgur.com/3Hva4Df.png" },
  { id: 16, name: "Bolo de Ferreiro com Nutella", price: 16.90, category: 'bolos', description: "Chocolate, amendoim e Nutella.", imageUrl: "https://i.imgur.com/OamNqov.png" },
  { id: 17, name: "Copo Oreo com Nutella", price: 24.90, category: 'copo_felicidade', description: "Camadas de Ninho, Oreo e Nutella.", imageUrl: "https://i.imgur.com/1EZRMVl.png" },
  { id: 24, name: "Copo Maracujá com Brownie", price: 24.90, category: 'copo_felicidade', description: "Maracujá, chocolate e brownie.", imageUrl: "https://i.imgur.com/PypEwAz.png" },
  { id: 25, name: "Copo Brownie Dois Amores", price: 22.90, category: 'copo_felicidade', description: "Dois amores + brownie.", imageUrl: "https://i.imgur.com/mMQtXDB.png" },
  { id: 26, name: "Copo Encanto de Ninho e Morangos", price: 22.90, category: 'copo_felicidade', description: "Ninho e morangos frescos.", imageUrl: "https://i.imgur.com/EgFhhwL.png" },
  { id: 27, name: "Copo de Brownie com Ferreiro e Nutella", price: 26.90, category: 'copo_felicidade', description: "Brownie, Ferrero e Nutella.", imageUrl: "https://i.imgur.com/t6xeVDf.png" },
  { id: 20, name: "Brownie De Ninho e Nutella", price: 11.90, category: 'brownie', description: "Brownie com Ninho e Nutella.", imageUrl: "https://i.imgur.com/vWdYZ8K.png" },
  { id: 21, name: "Brownie Recheado com Nutella e Morangos", price: 22.90, category: 'brownie', description: "Recheado com Ninho, Nutella e morangos.", imageUrl: "https://i.imgur.com/P1pprjF.png" },
  { id: 22, name: "Brownie Ferreiro com Nutella", price: 11.90, category: 'brownie', description: "Com Nutella e amendoim.", imageUrl: "https://i.imgur.com/rmp3LtH.png" },
  { id: 23, name: "Brownie Duo com Oreo", price: 11.90, category: 'brownie', description: "Cobertura de chocolate e Oreo.", imageUrl: "https://i.imgur.com/8IbcWWj.png" },
  { id: ACAI_ID, name: "Copo de Açaí 250ml", price: ACAI_BASE_PRICE, category: 'acai', description: "Monte do seu jeito.", imageUrl: "https://i.imgur.com/OrErP8N.png" },
  { id: 6, name: "Empada de Camarão e Requeijão", price: 12.00, category: 'salgado', description: "Camarão cremoso.", imageUrl: "https://i.imgur.com/rV18DkJ.png" }
];

const categories = {
  all: 'Todos',
  bolos: 'Bolos',
  copo_felicidade: 'Copos',
  brownie: 'Brownies',
  acai: 'Açaí',
  salgado: 'Salgados',
};

const STATUS_UI = {
  novo: { label: "Recebido", message: "Aguardando o restaurante confirmar.", icon: Check, color: "text-blue-600", bg: "bg-blue-100", bar: "w-[10%]" },
  preparando: { label: "Em Preparo", message: "A cozinha já está preparando suas delícias!", icon: Utensils, color: "text-amber-600", bg: "bg-amber-100", bar: "w-[50%]" },
  pronto: { label: "Saiu para Entrega", message: "Seu pedido está a caminho da sua casa.", icon: Bike, color: "text-indigo-600", bg: "bg-indigo-100", bar: "w-[80%]" },
  entregue: { label: "Entregue", message: "Pedido entregue. Bom apetite!", icon: Star, color: "text-green-600", bg: "bg-green-100", bar: "w-full" }
};

const formatBR = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;

// --- COMPONENTES AUXILIARES ---

// Componente de Notificação (Toast)
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-slideIn
            ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800' : 
              toast.type === 'error' ? 'bg-white border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-800'}
          `}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
};

// Modal de Termos
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-slideUp max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-600"/> Termos de Uso</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <div className="overflow-y-auto pr-2 text-sm text-gray-600 space-y-4 custom-scrollbar">
          <p>Bem-vindo ao Doce É Ser! Ao utilizar nosso serviço, você concorda com os seguintes termos:</p>
          <div>
            <strong className="text-gray-800">1. Pedidos e Entrega</strong>
            <p>Os pedidos estão sujeitos à disponibilidade. O tempo de entrega é uma estimativa e pode variar conforme a demanda e condições climáticas.</p>
          </div>
          <div>
            <strong className="text-gray-800">2. Pagamentos</strong>
            <p>Aceitamos pagamentos via Pix. Em caso de falha no pagamento, o pedido não será processado.</p>
          </div>
          <div>
            <strong className="text-gray-800">3. Cadastro</strong>
            <p>Você é responsável por manter seus dados atualizados. O CPF é necessário para emissão de nota fiscal e segurança.</p>
          </div>
          <div>
            <strong className="text-gray-800">4. Privacidade</strong>
            <p>Seus dados são utilizados apenas para processamento de pedidos e melhoria do serviço, conforme a LGPD.</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition">
          Entendi
        </button>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onAuth, onOpenTerms }) => {
  if (!isOpen) return null;
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', confirmPassword: '', cpf: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      if (!acceptedTerms) return onAuth('error', "Você precisa aceitar os termos de uso para criar a conta.");
      if (formData.password !== formData.confirmPassword) return onAuth('error', "Senhas não conferem.");
      if (formData.password.length < 4) return onAuth('error', "Senha muito curta.");
      onAuth('register', formData);
    } else {
      onAuth('login', formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        <div className="text-center mb-6">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
            {isRegister ? <User className="w-8 h-8"/> : <Lock className="w-8 h-8"/>}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{isRegister ? 'Criar Conta' : 'Bem-vindo de volta!'}</h2>
          <p className="text-sm text-gray-500">{isRegister ? 'Ganhe brindes exclusivos.' : 'Acesse seus pedidos e fidelidade.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
              <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-amber-500 outline-none" placeholder="Seu nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Telefone (Celular)</label>
            <input required type="tel" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-amber-500 outline-none" placeholder="11999999999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">CPF (Apenas números)</label>
              <input required type="tel" maxLength="14" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-amber-500 outline-none" placeholder="12345678900" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Senha</label>
            <input required type="password" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-amber-500 outline-none" placeholder="******" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Confirmar Senha</label>
                <input required type="password" className="w-full p-3 bg-gray-50 rounded-xl border focus:border-amber-500 outline-none" placeholder="******" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={acceptedTerms} 
                  onChange={(e) => setAcceptedTerms(e.target.checked)} 
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 select-none cursor-pointer">
                  Aceito os <span className="text-amber-600 font-bold hover:underline" onClick={(e) => { e.preventDefault(); onOpenTerms(); }}>Termos de Uso</span> e Privacidade
                </label>
              </div>
            </>
          )}
          <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20">
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-amber-700 font-semibold hover:underline">
            {isRegister ? 'Já tenho conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, data, onConfirm }) => {
  if (!isOpen || !data) return null;

  const copyToClipboard = () => {
    if (data.pix && data.pix.copypaste) {
      navigator.clipboard.writeText(data.pix.copypaste);
      alert("Código Pix copiado!"); // Mantido alert aqui pois é um feedback nativo rápido, mas poderia ser toast
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-slideUp">
        <div className="bg-green-600 p-6 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-90" />
           <h3 className="text-2xl font-bold">Pagamento via Pix</h3>
           <p className="text-green-100 text-sm">Escaneie ou copie o código abaixo</p>
        </div>
        <div className="p-8 flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300 overflow-hidden relative group">
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white opacity-0 group-hover:opacity-10 text-xs font-bold text-gray-500">QR Code</div>
             <div className="z-10 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center w-full h-full">
                <QrCode className="w-32 h-32 text-gray-800" />
             </div>
          </div>
          <p className="text-2xl font-black text-gray-800 mb-6 text-center mt-4">
             Valor: {formatBR(data.amount ? data.amount / 100 : 0)}
          </p>
          <div className="w-full space-y-3">
            <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition border border-gray-200">
              <Copy className="w-4 h-4" /> Copiar Código Pix
            </button>
            <button onClick={onConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-600/20 transition transform active:scale-[0.98]">
              Já fiz o pagamento!
            </button>
          </div>
          <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const AcaiModal = ({ product, onClose, onAdd }) => {
  if (!product) return null;
  const [selected, setSelected] = useState([]);
  const toggle = (name) => setSelected(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
  const extraPrice = selected.reduce((acc, name) => acc + (ACAI_TOPPINGS.find(t => t.name === name)?.price || 0), 0);
  const finalPrice = product.price + extraPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-slideUp">
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-purple-700 to-purple-900 text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg"><Star className="w-4 h-4 text-yellow-300 fill-current" /></div>
            <h3 className="font-bold text-lg">Montar Açaí</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
             <p className="text-sm font-medium text-gray-600">Escolha seus adicionais:</p>
             <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{selected.length} selecionados</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {ACAI_TOPPINGS.map(t => {
              const isSelected = selected.includes(t.name);
              return (
                <div key={t.name} onClick={() => toggle(t.name)} className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-purple-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>{t.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">+{formatBR(t.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Valor Final</p>
              <p className="text-2xl font-black text-purple-900">{formatBR(finalPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Base: {formatBR(ACAI_BASE_PRICE)}</p>
              <p className="text-xs text-gray-400">Adicionais: {formatBR(extraPrice)}</p>
            </div>
          </div>
          <button onClick={() => { onAdd({ ...product, price: finalPrice, isCustom: true, uniqueId: Math.random().toString(36) }, 1, selected); onClose(); }} className="w-full bg-purple-700 text-white py-3.5 rounded-xl font-bold hover:bg-purple-800 transition shadow-lg shadow-purple-700/20 active:scale-[0.98]">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAdd, onOpenAcai }) => (
  <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
    <div className="h-48 overflow-hidden relative bg-gray-100">
      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-3 left-3">
        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-extrabold text-amber-800 shadow-sm uppercase tracking-wider border border-white/50">
          {categories[product.category]}
        </span>
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2 group-hover:text-amber-700 transition-colors">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">A partir de</span>
          <span className="font-extrabold text-amber-600 text-xl">{formatBR(product.price)}</span>
        </div>
        <button onClick={() => product.id === ACAI_ID ? onOpenAcai(product) : onAdd(product)} className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20 hover:bg-amber-700 hover:scale-105 hover:shadow-amber-600/40 active:scale-95 transition-all duration-300">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const LoyaltyCard = ({ progress }) => {
  const giftsEarned = Math.floor(progress / LOYALTY_GOAL);
  const percentage = ((progress % LOYALTY_GOAL) / LOYALTY_GOAL) * 100;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10"><Gift className="w-48 h-48 -mr-10 -mt-10" /></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-yellow-300 fill-current"/> Clube Doce Fidelidade</h3>
            <p className="text-indigo-100 text-sm">Peça {LOYALTY_GOAL} vezes e ganhe um brinde!</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">{progress} Pedidos Totais</div>
        </div>
        <div className="bg-black/20 rounded-full h-4 w-full mb-2 overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-yellow-300 to-amber-500 h-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-indigo-100 mb-4">
          <span>0</span><span>{LOYALTY_GOAL} Pedidos</span>
        </div>
        {giftsEarned > 0 && (
          <div className="bg-white text-indigo-900 p-3 rounded-xl flex items-center gap-3 shadow-lg animate-pulse">
            <Gift className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-bold leading-tight">Você tem {giftsEarned} brinde(s) disponível(is)!</p>
              <p className="text-xs text-indigo-700">Solicite na observação do próximo pedido.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TrackingPage = ({ supabase, lastOrderId, orderStatus, setOrderStatus, onReset }) => {
  useEffect(() => {
    if (!supabase || !lastOrderId) return;
    const channel = supabase.channel('tracking-order')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: COLLECTION_ORDERS, filter: `id=eq.${lastOrderId}` }, (payload) => {
          if (payload.new && payload.new.status) setOrderStatus(payload.new.status);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, lastOrderId]);

  const ui = STATUS_UI[orderStatus] || STATUS_UI.novo;
  const StatusIcon = ui.icon;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className={`w-28 h-28 ${ui.bg} rounded-full flex items-center justify-center mb-6 shadow-xl transition-all duration-500 animate-bounce-slow`}>
        <StatusIcon className={`w-14 h-14 ${ui.color}`} />
      </div>
      <h2 className={`text-3xl font-black text-gray-800 mb-2 transition-all`}>{ui.label}</h2>
      <p className="text-gray-500 mb-8 max-w-sm text-lg leading-relaxed">{ui.message}</p>
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
          <div className={`h-full ${ui.color.replace('text-', 'bg-')} transition-all duration-1000 ${ui.bar}`}></div>
        </div>
        <div className="flex justify-between items-center mb-6 mt-2">
           <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Status do Pedido</p>
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ui.bg} ${ui.color}`}>{orderStatus}</span>
        </div>
        <div className="flex items-center justify-center gap-3 bg-gray-50 py-4 px-4 rounded-2xl border border-gray-100 mb-6">
          <Clock className="w-5 h-5 text-gray-400" /> 
          <span className="text-gray-600 font-medium">Previsão: <strong className="text-gray-800">{ETA_TEXT}</strong></span>
        </div>
        <div className="pt-6 border-t border-dashed border-gray-200 text-left">
           <div className="flex justify-between items-center">
             <div>
               <p className="text-xs text-gray-400 mb-1 font-bold uppercase">Nº do Pedido</p>
               <p className="font-mono text-sm font-bold text-gray-600">{lastOrderId ? lastOrderId.slice(-6).toUpperCase() : '---'}</p>
             </div>
             <Package className="w-8 h-8 text-gray-200" />
           </div>
        </div>
      </div>
      <button onClick={onReset} className="mt-10 text-amber-700 font-bold hover:bg-amber-50 px-8 py-3 rounded-full transition border border-transparent hover:border-amber-100">
        Fazer outro pedido
      </button>
    </div>
  );
};

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [page, setPage] = useState('menu');
  const [cart, setCart] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [acaiModalProduct, setAcaiModalProduct] = useState(null);
  const [user, setUser] = useState(null); 
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false); // NOVO
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [loyaltyProgress, setLoyaltyProgress] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [customer, setCustomer] = useState({ nome: '', email: '', telefone: '', rua: '', numero: '', bairro: '', cpf: '' });
  const [lastOrderId, setLastOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('novo');
  // Estado para produtos disponíveis
  const [availableProducts, setAvailableProducts] = useState({});
  // Estado para toasts
  const [toasts, setToasts] = useState([]);

  // Função para adicionar toast
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (window.supabase && window.supabase.createClient) {
      setSupabase(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        setSupabase(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
      }
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    // Carregar usuário
    const storedUser = localStorage.getItem('doceeser_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setCustomer({
        nome: parsedUser.name,
        email: parsedUser.email || '', 
        telefone: parsedUser.phone,
        cpf: parsedUser.cpf || '', 
        rua: parsedUser.address?.rua || '',
        numero: parsedUser.address?.numero || '',
        bairro: parsedUser.address?.bairro || ''
      });
      fetchLoyalty(parsedUser.phone);
    }
    
    // Carregar Disponibilidade de Produtos
    fetchProductAvailability();
  }, [supabase]);

  const fetchProductAvailability = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from(AVAILABILITY_TABLE).select('*');
      if (!error && data) {
        const map = {};
        data.forEach(item => { map[item.id] = item.is_active; });
        setAvailableProducts(map);
      }
    } catch (e) {
       console.log("Erro ao buscar disponibilidade (pode ser normal se a tabela não existir ainda):", e);
    }
  };

  const fetchLoyalty = async (phone) => {
    if (!supabase || !phone) return;
    try {
      const { count, error } = await supabase
        .from(COLLECTION_ORDERS)
        .select('*', { count: 'exact', head: true })
        .eq('customer->>telefone', phone)
        .eq('status', 'entregue');
      if (!error) setLoyaltyProgress(count || 0);
    } catch (e) { console.warn("Erro conexão fidelidade", e); }
  };

  const addToCart = (product, quantity = 1, toppings = []) => {
    const uniqueId = product.isCustom ? product.uniqueId : product.id;
    setCart(prev => {
      const existing = prev.find(item => (item.isCustom ? item.uniqueId === uniqueId : item.id === product.id));
      if (existing) {
        showToast(`Quantidade de ${product.name} atualizada!`, 'success');
        return prev.map(item => (item === existing ? { ...item, quantity: item.quantity + quantity } : item));
      }
      showToast(`${product.name} adicionado ao carrinho!`, 'success');
      return [...prev, { ...product, quantity, toppings, uniqueId }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => (item.uniqueId || item.id) !== itemId));
    showToast("Item removido do carrinho.", 'info');
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = cartTotal + DELIVERY_FEE;

  const handleAuth = async (type, data) => {
    if (type === 'error') {
      showToast(data, 'error'); // Se for mensagem de erro vinda do modal
      return;
    }

    if (!supabase) return showToast("Conectando ao servidor... tente novamente.", 'error');
    const userId = `user_${data.phone.replace(/\D/g, '')}`; 
    try {
      if (type === 'login') {
        const { data: userData } = await supabase.from(COLLECTION_ORDERS).select('customer').eq('id', userId).maybeSingle();
        if (userData && userData.customer && userData.customer.password === data.password) {
           loginUser(userData.customer);
           showToast(`Bem-vindo de volta, ${userData.customer.name}!`, 'success');
        }
        else showToast("Telefone não encontrado ou senha incorreta.", 'error');
      } else if (type === 'register') {
        const { data: existing } = await supabase.from(COLLECTION_ORDERS).select('id').eq('id', userId).maybeSingle();
        if (existing) return showToast("Este telefone já possui cadastro.", 'error');
        const newUserProfile = { 
            name: data.name, 
            phone: data.phone, 
            password: data.password, 
            cpf: data.cpf, 
            address: {}, 
            createdAt: new Date().toISOString() 
        };
        const { error } = await supabase.from(COLLECTION_ORDERS).insert({ id: userId, status: 'user_account', total: 0, customer: newUserProfile, items: [] });
        if (error) showToast("Erro ao criar conta. Tente novamente.", 'error');
        else { 
          loginUser(newUserProfile); 
          showToast("Conta criada com sucesso!", 'success'); 
        }
      }
    } catch (e) { 
      console.error("Auth error:", e); 
      showToast("Erro de conexão.", 'error'); 
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('doceeser_user', JSON.stringify(userData));
    setCustomer(prev => ({ 
        ...prev, 
        nome: userData.name, 
        telefone: userData.phone,
        email: userData.email || '', 
        cpf: userData.cpf || '',
        rua: userData.address?.rua || '', 
        numero: userData.address?.numero || '', 
        bairro: userData.address?.bairro || '' 
    }));
    fetchLoyalty(userData.phone);
    setAuthModalOpen(false);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('doceeser_user');
    setLoyaltyProgress(0);
    setCustomer({ nome: '', email: '', telefone: '', rua: '', numero: '', bairro: '', cpf: '' });
    setIsUserMenuOpen(false);
    showToast("Você saiu da conta.", 'info');
  };

  const handleInitiatePayment = async () => {
    if (!customer.nome || !customer.email || !customer.telefone || !customer.rua || !customer.cpf) return showToast("Por favor, preencha todos os dados, incluindo CPF e email.", 'error');
    
    if (user && supabase) {
      const newAddress = { rua: customer.rua, numero: customer.numero, bairro: customer.bairro };
      const userId = `user_${user.phone.replace(/\D/g, '')}`;
      const updatedCustomer = { ...user, email: customer.email, cpf: customer.cpf, address: newAddress };
      await supabase.from(COLLECTION_ORDERS).update({ customer: updatedCustomer }).eq('id', userId);
      setUser(updatedCustomer);
      localStorage.setItem('doceeser_user', JSON.stringify(updatedCustomer));
    }
    setIsProcessingPayment(true);
    
    const cleanPhone = customer.telefone.replace(/\D/g, '');
    const cleanCpf = customer.cpf.replace(/\D/g, '');

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: cart.map(item => ({ 
              externalId: String(item.id), 
              name: item.name, 
              quantity: item.quantity, 
              price: Math.round(item.price * 100) 
          })), 
          returnUrl: window.location.href, 
          completionUrl: window.location.href, 
          customer: { 
              name: customer.nome, 
              cellphone: cleanPhone, 
              email: customer.email,
              taxId: cleanCpf 
          } 
        })
      });
      
      const data = await response.json();
      
      const billing = data.data?.billing || data.billing || (data.pix ? data : null);

      if (billing && billing.pix) {
        setPaymentData(billing);
        setPaymentModalOpen(true);
      } else { 
        console.error("API Response Error:", data);
        const errorMsg = data.error || (data.data?.error) || "Erro desconhecido na API";
        throw new Error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg); 
      }

    } catch (error) {
      console.error("Erro Pagamento:", error);
      showToast(`Erro no pagamento: ${error.message}`, 'error');
    }
    
    setIsProcessingPayment(false);
  };

  const handleConfirmOrder = async () => {
    if (!supabase) return;
    const orderId = `ord_${Date.now()}`;
    const payload = { id: orderId, status: 'novo', createdAt: new Date().toISOString(), total: finalTotal, items: cart, customer: customer };
    const { error } = await supabase.from(COLLECTION_ORDERS).insert(payload);
    if (error) {
       console.error(error);
       if (error.code === 'PGRST204') showToast("Erro de compatibilidade. Tente novamente mais tarde.", 'error');
       else showToast("Erro ao enviar pedido.", 'error');
    } else {
      setLastOrderId(orderId);
      setOrderStatus('novo');
      setCart([]);
      setPaymentModalOpen(false);
      setPaymentData(null);
      setPage('tracking');
      showToast("Pedido enviado com sucesso!", 'success');
    }
  };

  // Filtragem de produtos com base na disponibilidade
  const visibleProducts = useMemo(() => {
    return initialProducts.filter(p => {
       // Se não tiver registro, assume true (visível)
       return availableProducts[p.id] !== false;
    });
  }, [availableProducts]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      <header className="sticky top-0 bg-white/90 backdrop-blur-lg shadow-sm z-40 px-4 py-3 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPage('menu')}>
            <img src={LOGO_URL} alt="Doce É Ser" className="h-10 w-auto object-contain rounded-lg transition-transform group-hover:scale-105" />
            <div><h1 className="font-bold text-lg text-gray-800 leading-tight">Doce É Ser</h1></div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl transition">
                  <div className="bg-amber-100 p-1 rounded-full"><User className="w-4 h-4 text-amber-700"/></div>
                  <span className="text-sm font-bold hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Logado como</p>
                      <p className="font-bold text-gray-800 truncate text-sm">{user.name}</p>
                    </div>
                    <button onClick={logoutUser} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-bold flex items-center gap-2 transition rounded-xl">
                      <LogOut className="w-4 h-4" /> Sair da conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition">
                <User className="w-4 h-4" /> Entrar
              </button>
            )}
            <button onClick={() => setPage('cart')} className={`relative p-3 rounded-xl transition-all duration-300 ${cart.length > 0 ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white transform scale-100 animate-bounce">
                  {cart.reduce((a,b)=>a+b.quantity,0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto min-h-[80vh] animate-fadeIn">
        {page === 'menu' && (
          <div className="pb-32">
            {user ? (
              <div className="px-4 mt-6"><LoyaltyCard progress={loyaltyProgress} /></div>
            ) : (
              <div className="relative mx-4 mt-6 mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/10 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-8">
                <div className="relative z-10 max-w-lg">
                  <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/20">Doce É Ser</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">O doce equilíbrio <br/>que o seu dia precisa. 🍰</h2>
                  <p className="text-amber-100 mb-6 text-sm md:text-base opacity-90 leading-relaxed">Crie sua conta para ganhar brindes exclusivos!</p>
                  <div className="flex gap-3">
                    <button onClick={() => setAuthModalOpen(true)} className="bg-white text-amber-800 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-gray-50 transition active:scale-95">Criar Conta / Entrar</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute right-[-20px] bottom-[-40px] opacity-20 rotate-12"><Cake className="w-64 h-64 text-white" /></div>
              </div>
            )}
            <div className="sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-md py-4 border-b border-gray-200/50 mb-6">
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar items-center">
                  {Object.entries(categories).map(([key, label]) => (
                    <button key={key} onClick={() => setCategoryFilter(key)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${categoryFilter === key ? 'bg-amber-700 text-white shadow-md shadow-amber-700/20 border-amber-700 transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-700'}`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Utensils className="w-5 h-5 text-amber-600"/> {categories[categoryFilter]}</h3>
                 <span className="text-xs font-medium text-gray-400">{visibleProducts.filter(p => categoryFilter === 'all' || p.category === categoryFilter).length} itens</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProducts.filter(p => categoryFilter === 'all' || p.category === categoryFilter).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onOpenAcai={setAcaiModalProduct} />)}
              </div>
            </div>
          </div>
        )}

        {page === 'cart' && (
          <div className="p-4 pb-32 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><ShoppingCart className="w-5 h-5" /></div>
              <h2 className="text-2xl font-bold text-gray-800">Seu Carrinho</h2>
            </div>
            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><Cake className="w-10 h-10" /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Sua sacola está vazia</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Que tal adicionar alguns doces para deixar seu dia mais feliz?</p>
                <button onClick={() => setPage('menu')} className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition">Ver Cardápio</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden"><img src={item.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start"><h4 className="font-bold text-gray-800 leading-tight pr-4">{item.name}</h4><button onClick={() => removeFromCart(item.uniqueId || item.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button></div>
                          {item.toppings && item.toppings.length > 0 && <p className="text-xs text-gray-500 mt-1 line-clamp-1">+ {item.toppings.join(', ')}</p>}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-amber-700 font-extrabold">{formatBR(item.price * item.quantity)}</p>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button onClick={() => item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item.uniqueId || item.id)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-700 hover:bg-white rounded transition"><Minus className="w-3 h-3"/></button>
                            <span className="text-sm font-bold w-4 text-center text-gray-700">{item.quantity}</span>
                            <button onClick={() => addToCart(item, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-700 hover:bg-white rounded transition"><Plus className="w-3 h-3"/></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                  {!user && <div onClick={() => setAuthModalOpen(true)} className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition"><User className="text-blue-600 w-5 h-5" /><p className="text-sm text-blue-800 font-medium">Faça login para salvar seus dados e ganhar pontos!</p></div>}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-amber-600"/> Entrega</h3>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Seu Nome</label><input placeholder="Ex: João Silva" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.nome} onChange={e => setCustomer({...customer, nome: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><input placeholder="(99) 99999-9999" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.telefone} onChange={e => setCustomer({...customer, telefone: e.target.value})} /></div>
                      </div>
                      <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Email (Obrigatório)</label><input placeholder="seu@email.com" type="email" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} /></div>
                      <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">CPF (Obrigatório)</label><input placeholder="Apenas números" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.cpf} onChange={e => setCustomer({...customer, cpf: e.target.value})} /></div>
                      <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Rua</label><input placeholder="Endereço de entrega" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.rua} onChange={e => setCustomer({...customer, rua: e.target.value})} /></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Número</label><input placeholder="123" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.numero} onChange={e => setCustomer({...customer, numero: e.target.value})} /></div>
                        <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Bairro</label><input placeholder="Bairro" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-amber-500 focus:outline-none transition" value={customer.bairro} onChange={e => setCustomer({...customer, bairro: e.target.value})} /></div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-dashed border-gray-200">
                    <div className="flex justify-between text-gray-500 mb-2 text-sm"><span>Subtotal</span><span>{formatBR(cartTotal)}</span></div>
                    <div className="flex justify-between text-gray-500 mb-4 text-sm"><span>Taxa de Entrega</span><span>{formatBR(DELIVERY_FEE)}</span></div>
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"><span className="font-bold text-gray-700">Total a pagar</span><span className="text-2xl font-black text-amber-700">{formatBR(finalTotal)}</span></div>
                  </div>
                  <button onClick={handleInitiatePayment} disabled={isProcessingPayment} className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 transition ${isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'}`}>{isProcessingPayment ? <Loader2 className="w-6 h-6 animate-spin"/> : <><Truck className="w-6 h-6" /> Confirmar e Pagar</>}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'tracking' && (
          <TrackingPage 
            supabase={supabase} 
            lastOrderId={lastOrderId} 
            orderStatus={orderStatus} 
            setOrderStatus={setOrderStatus} 
            onReset={() => { setPage('menu'); setCart([]); }} 
          />
        )}
      </main>

      <AcaiModal product={acaiModalProduct} onClose={() => setAcaiModalProduct(null)} onAdd={addToCart} />
      <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} data={paymentData} onConfirm={handleConfirmOrder} />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuth={handleAuth} 
        onOpenTerms={() => setTermsModalOpen(true)}
      />
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />

      <footer className="bg-white border-t border-gray-100 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-50"><Cake className="w-5 h-5"/><span className="font-bold">Doce É Ser</span></div>
        <p className="flex items-center justify-center gap-1 text-gray-400 text-sm">Feito por <a href="https://instagram.com/diivulgaja" target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-700 hover:text-amber-900 transition-colors">Divulga Já</a></p>
      </footer>
    </div>
  );
}
