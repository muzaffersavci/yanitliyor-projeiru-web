// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import {
  MessageSquare, BarChart2, Settings, Loader2, LogOut,
  Target, Bot, Send, AlertTriangle, RefreshCw, ArrowRight,
  Check, Lock, CreditCard, Shield, Eye, EyeOff, X, Zap, Star, ThumbsUp, ThumbsDown, FileText, ArrowLeft, UserPlus
} from 'lucide-react';
import RegisterPage from './pages/RegisterPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

// JWT Bearer token otomatik olarak her isteğe eklenir
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

if (!GOOGLE_CLIENT_ID || !API_URL) {
    console.warn("DIKKAT: VITE_GOOGLE_CLIENT_ID veya VITE_API_URL eksik!");
}

const SECTORS = ["Restoran", "Kafe", "Giyim", "Sağlık", "Spor", "Otel", "Diğer"];

const Toast = ({ msg, type, onClose }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in ${type==='error'?'bg-red-600 text-white':'bg-green-600 text-white'}`}>
            {type === 'error' ? <AlertTriangle size={20}/> : <Check size={20}/>}
            <span className="font-bold text-sm tracking-wide">{msg}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition"><X size={16}/></button>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
        <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</p>
            <h4 className="text-4xl font-black text-gray-900 mt-2">{value}</h4>
        </div>
        <div className="text-blue-600 bg-blue-50 p-4 rounded-2xl">{React.cloneElement(icon, { size: 32 })}</div>
    </div>
);

const SidebarItem = ({ icon, label, onClick, active, badge }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
        <div className="flex items-center gap-3">{React.cloneElement(icon, { size: 22 })}<span>{label}</span></div>
        {badge > 0 && <span className={`text-xs px-2.5 py-1 rounded-full font-black ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{badge}</span>}
    </button>
);

const Typewriter = ({ words }) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        let timer;
        const handleTyping = () => {
            const i = loopNum % words.length;
            const fullText = words[i];
            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
            setTypingSpeed(isDeleting ? 40 : 100);
            if (!isDeleting && text === fullText) {
                timer = setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                timer = setTimeout(() => {}, 500);
            } else {
                timer = setTimeout(handleTyping, typingSpeed);
            }
        };
        timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed, words]);

    return (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block min-w-[200px]">
            {text}<span className="text-blue-600 animate-pulse">|</span>
        </span>
    );
};

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-blue-100">
            <header className="w-full py-6 px-4 sm:px-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-blue-600 font-extrabold text-3xl tracking-tight">
                    <MessageSquare size={32} className="fill-blue-600 text-white"/> Yanıtlıyor
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/register" className="text-blue-600 font-bold hover:underline transition">
                        Kayıt Ol
                    </Link>
                    <Link to="/login" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition shadow-md">
                        Giriş Yap
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center text-center px-4 pt-20 pb-16">
                <div className="inline-block bg-blue-50 text-blue-700 px-5 py-2 rounded-full text-sm font-bold mb-8 border border-blue-100 shadow-sm">
                    ✨ Google Haritalar İçin Yapay Zeka Danışmanı
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight max-w-5xl h-36 sm:h-auto">
                    Müşteri Yorumlarını <br className="hidden md:block" />
                    <Typewriter words={["Kazanca Dönüştürün.", "Yapay Zekaya Bırakın.", "Otomatik Yönetin."]} />
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed max-w-3xl font-medium">
                    İşletmenize yapılan yorumları analiz edin, yapay zeka ile profesyonelce yanıtlayın ve rakiplerinizin zayıf yönlerini keşfedin. İtibarınızı otomatikleştirelim.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                    <Link to="/login" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
                        Ücretsiz Denemeye Başla <ArrowRight size={20}/>
                    </Link>
                </div>
            </main>

            <section className="w-full bg-gray-50 py-24 border-y border-gray-100 mt-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Nasıl Çalışır?</h2>
                        <p className="text-xl text-gray-500 font-medium">Siz işinize odaklanırken, yapay zekanız saniyeler içinde krizleri çözer.</p>
                    </div>
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex-1 w-full bg-red-50/50 p-6 rounded-2xl border border-red-100 relative">
                                <div className="absolute -top-4 -left-4 bg-red-100 text-red-600 p-3 rounded-2xl shadow-sm"><ThumbsDown size={24}/></div>
                                <div className="flex items-center gap-1 mb-4">
                                    <Star className="text-yellow-400 fill-yellow-400" size={18}/><Star className="text-gray-300 fill-gray-300" size={18}/><Star className="text-gray-300 fill-gray-300" size={18}/><Star className="text-gray-300 fill-gray-300" size={18}/><Star className="text-gray-300 fill-gray-300" size={18}/>
                                </div>
                                <p className="text-gray-800 font-medium text-lg italic">"Yemekler buz gibi geldi, garsonlar çok kaba ve ilgisizdi. Bir daha asla adım atmam!"</p>
                                <div className="mt-4 text-sm text-red-500 font-black tracking-wider uppercase">Gerçek Bir Müşteri Yorumu</div>
                            </div>
                            <ArrowRight className="hidden md:block text-gray-300" size={40}/>
                            <div className="flex-1 w-full bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-200 relative text-white">
                                <div className="absolute -top-4 -right-4 bg-white text-blue-600 p-3 rounded-2xl shadow-md"><Bot size={24}/></div>
                                <div className="flex items-center gap-2 mb-4 text-blue-200 font-bold text-sm tracking-wider uppercase"><Check size={16}/> Saniyeler İçinde Üretilen AI Yanıtı</div>
                                <p className="font-medium text-lg leading-relaxed">"Merhaba, yaşadığınız bu olumsuz deneyim için çok özür dileriz. Yemeklerimizin sıcaklığı ve servis kalitemiz konusunda standartlarımızın çok altında kalmışız. Durumu telafi etmek ve sizi tekrar ağırlamak için lütfen işletmemizle iletişime geçin."</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex-1 w-full bg-green-50/50 p-6 rounded-2xl border border-green-100 relative">
                                <div className="absolute -top-4 -left-4 bg-green-100 text-green-600 p-3 rounded-2xl shadow-sm"><ThumbsUp size={24}/></div>
                                <div className="flex items-center gap-1 mb-4">
                                    <Star className="text-yellow-400 fill-yellow-400" size={18}/><Star className="text-yellow-400 fill-yellow-400" size={18}/><Star className="text-yellow-400 fill-yellow-400" size={18}/><Star className="text-yellow-400 fill-yellow-400" size={18}/><Star className="text-yellow-400 fill-yellow-400" size={18}/>
                                </div>
                                <p className="text-gray-800 font-medium text-lg italic">"Mekanın atmosferi harika, çalışanlar çok güler yüzlü. Özellikle kahvelerine bayıldım!"</p>
                                <div className="mt-4 text-sm text-green-600 font-black tracking-wider uppercase">Gerçek Bir Müşteri Yorumu</div>
                            </div>
                            <ArrowRight className="hidden md:block text-gray-300" size={40}/>
                            <div className="flex-1 w-full bg-gray-900 p-6 rounded-2xl shadow-xl relative text-white">
                                <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-md"><Bot size={24}/></div>
                                <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold text-sm tracking-wider uppercase"><Check size={16}/> Saniyeler İçinde Üretilen AI Yanıtı</div>
                                <p className="font-medium text-lg leading-relaxed">"Harika yorumunuz için çok teşekkür ederiz! Atmosferimizi ve kahvelerimizi beğenmenize çok sevindik. Güler yüzlü ekibimizle sizi her zaman ağırlamaktan mutluluk duyarız. Tekrar bekleriz!"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full px-4 text-left">
                    <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 hover:shadow-lg transition duration-300">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600"><MessageSquare size={32}/></div>
                        <h3 className="font-extrabold text-2xl mb-4 text-gray-900">Otomatik Yanıtlar</h3>
                        <p className="text-gray-500 font-medium leading-relaxed text-lg">Yorumun duygu analizini yapar. Eleştirilere mahcup, övgülere samimi, haksız yorumlara dik duran taslaklar üretir.</p>
                    </div>
                    <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 hover:shadow-lg transition duration-300">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600"><Target size={32}/></div>
                        <h3 className="font-extrabold text-2xl mb-4 text-gray-900">Rakip Analizi</h3>
                        <p className="text-gray-500 font-medium leading-relaxed text-lg">Bölgenizdeki rakiplerin yorumlarını saniyeler içinde tarayarak onların zayıf ve güçlü yönlerini SWOT raporu olarak sunar.</p>
                    </div>
                    <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 hover:shadow-lg transition duration-300">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600"><Bot size={32}/></div>
                        <h3 className="font-extrabold text-2xl mb-4 text-gray-900">7/24 AI Danışman</h3>
                        <p className="text-gray-500 font-medium leading-relaxed text-lg">İşletmenizin verilerini bilen özel yapay zekanıza dilediğiniz zaman sorular sorun, anında stratejik tavsiyeler alın.</p>
                    </div>
                </div>
            </section>

            <footer className="w-full bg-white border-t border-gray-100 py-10 mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-6">
                    <div className="flex items-center gap-2 text-gray-900 font-extrabold text-xl">
                        <MessageSquare size={24}/> Yanıtlıyor
                    </div>
                    <p className="text-gray-400 text-sm font-medium">© 2026 Yanıtlıyor. Tüm hakları saklıdır.</p>
                    <div className="flex gap-6 text-sm font-bold text-gray-600">
                        <a href="https://yanitliyor.com.tr/gizlilik" className="hover:text-blue-600 transition underline underline-offset-4 flex items-center"><FileText size={16} className="mr-1"/> Gizlilik Politikası</a>                        
                        <a href="https://yanitliyor.com.tr/sartlar" className="hover:text-blue-600 transition underline underline-offset-4 flex items-center"><FileText size={16} className="mr-1"/> Kullanım Koşulları</a>                    
                    </div>
                </div>
            </footer>
        </div>
    );
};

const PrivacyPolicy = () => (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-10 transition">
                <ArrowLeft size={20}/> Ana Sayfaya Dön
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Gizlilik Politikası</h1>
            <p className="text-gray-500 font-bold mb-10 pb-6 border-b border-gray-100">Son Güncelleme Tarihi: 25 Şubat 2026</p>
            <div className="prose max-w-none text-gray-600 space-y-8 leading-relaxed font-medium text-lg">
                <p><strong>Yanıtlıyor</strong> ("Biz", "Platform" veya "Hizmet"), kullanıcılarının gizliliğine en yüksek seviyede önem verir.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Hangi Verileri Topluyoruz?</h3>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Kimlik ve İletişim Verileri:</strong> Google hesabınızla ilişkili adınız, soyadınız ve e-posta adresiniz.</li>
                    <li><strong>Google My Business Verileri:</strong> Onayınız dahilinde, yönetici olduğunuz işletmelerin adları ve konum kimlikleri.</li>
                    <li><strong>Müşteri Yorumları:</strong> İşletmenize Google Haritalar üzerinden yapılan herkese açık yorumlar.</li>
                </ul>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Verileri Hangi Amaçla Kullanıyoruz?</h3>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Müşteri yorumlarınızı tek bir panelde toplayarak size sunmak.</li>
                    <li>Yapay zeka motorumuzu kullanarak taslak yanıtlar oluşturmak.</li>
                    <li>Abonelik ve müşteri destek hizmetlerini yürütebilmek.</li>
                </ul>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Veri Paylaşımı</h3>
                <p>Kişisel verileriniz üçüncü taraf veri tüccarlarına veya reklam ağlarına <strong>kesinlikle satılmaz.</strong></p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Veri Güvenliği</h3>
                <p>Sistemlerimiz SSL/TLS şifreleme yöntemleriyle korunmaktadır. Hesabınızı silmeniz durumunda tüm verileriniz <strong>en geç 30 gün içerisinde</strong> kalıcı olarak silinir.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Kullanıcı Hakları</h3>
                <p>Google erişim izninizi <a href="https://myaccount.google.com/permissions" className="text-blue-600 underline" target="_blank" rel="noreferrer">Google Güvenlik Ayarları</a> sayfasından iptal edebilirsiniz.</p>
            </div>
        </div>
    </div>
);

const TermsOfService = () => (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-10 transition">
                <ArrowLeft size={20}/> Ana Sayfaya Dön
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Kullanım Koşulları</h1>
            <p className="text-gray-500 font-bold mb-10 pb-6 border-b border-gray-100">Son Güncelleme Tarihi: 25 Şubat 2026</p>
            <div className="prose max-w-none text-gray-600 space-y-8 leading-relaxed font-medium text-lg">
                <p>Lütfen <strong>Yanıtlıyor</strong> platformunu kullanmadan önce aşağıdaki kullanım koşullarını dikkatlice okuyunuz.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Hizmetin Tanımı</h3>
                <p>Yanıtlıyor, Google Haritalar üzerindeki müşteri yorumlarını yönetmek için yapay zeka destekli bir SaaS platformudur. Google LLC'nin resmi bir iştiraki değildir.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Hesap Güvenliği</h3>
                <p>Hesabınızın güvenliğinden tamamen siz sorumlusunuz.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. AI Yanıtları Sorumluluk Reddi</h3>
                <p>Yapay zeka tarafından üretilen metinler <strong>birer taslaktır</strong>. Yayınlamadan önce kontrol etmek kullanıcının sorumluluğundadır.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Abonelik ve Ödemeler</h3>
                <p>Kullanılmayan kotalar bir sonraki aya devretmez. Mevcut dönem için ücret iadesi yapılmamaktadır.</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Fesih</h3>
                <p>Koşulların ihlali durumunda Yanıtlıyor hesabı askıya alma veya silme hakkını saklı tutar.</p>
            </div>
        </div>
    </div>
);

// Demo modu için sahte veri
const DEMO_DATA = {
  business: { name: "Demo İşletme 🎯", tier: "Demo Modu", email: "demo@yanitliyor.com", auto_password: "demo", days_left: 0, quota_used: 0, quota_limit: 0 },
  stats: {
    total: 4, pending: 2,
    analysis: { advice: "Bu bir demo modudur. Gerçek verilerinizi görmek için işletmenizi bağlayın." }
  },
  reviews: [
    { id: 1, customer_name: "Ahmet Y.", customer_avatar: "", rating: 5, comment: "Harika bir hizmet, kesinlikle tavsiye ederim. Personel çok ilgiliydi.", date: "1 hafta önce", status: "pending", ai_reply: "Ahmet Bey, güzel yorumunuz için çok teşekkür ederiz! Sizi tekrar ağırlamaktan mutluluk duyarız.", is_historical: true },
    { id: 2, customer_name: "Zeynep K.", customer_avatar: "", rating: 2, comment: "Bekleme süresi çok uzundu ve personel ilgisizdi. Hayal kırıklığı yaşadım.", date: "3 gün önce", status: "pending", ai_reply: "Zeynep Hanım, yaşadığınız olumsuz deneyim için özür dileriz. Bekleme sürelerimizi kısaltmak için çalışmalar yapıyoruz.", is_historical: true },
    { id: 3, customer_name: "Mehmet A.", customer_avatar: "", rating: 4, comment: "Genel olarak memnun kaldım, fiyatlar biraz yüksek ama kalite iyi.", date: "1 ay önce", status: "approved", ai_reply: "Mehmet Bey, değerli yorumunuz için teşekkürler!", is_historical: true },
    { id: 4, customer_name: "Fatma S.", customer_avatar: "", rating: 1, comment: "Berbat bir deneyimdi. Bir daha gelmem.", date: "2 ay önce", status: "pending", ai_reply: "Fatma Hanım, yaşadığınız sorun için üzgünüz. Detayları öğrenmek ve sorunu çözmek için bizimle iletişime geçmenizi rica ederiz.", is_historical: true },
  ]
};

// --- ANA UYGULAMA MANTIĞI ---
const MainApp = () => {
  const [user, setUser] = useState(null);
  const [locked, setLocked] = useState(false);
  const [setup, setSetup] = useState(false);
  const [demo, setDemo] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) checkUser(t);
    else setLoading(false);
  }, []);

  const checkUser = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/dashboard`);
      // Dashboard başarıyla geldi - normal kullanıcı veya admin
      setUser({ token: t, is_admin: localStorage.getItem('is_admin') === 'true' });
    } catch (e) {
      if (e.response?.status === 402) {
        setUser({ token: t });
        setLocked(true);
      } else if (e.response?.status === 401 && e.response?.data?.detail === "İşletmeniz bulunamadı.") {
        setUser({ token: t });
        setDemo(true);
      } else if (e.response?.status === 403) {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        // 401 diğer - token geçersiz
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDemo(false);
    setSetup(false);
    window.location.href = '/';
  };

  const handleLogin = (d) => {
    if (d.access_token) setGoogleAccessToken(d.access_token);
    if (d.status === 'setup_needed') {
      localStorage.setItem('token', d.token);
      // Direkt demo moda sok, setup sonra yapılabilir
      setUser({ token: d.token });
      setDemo(true);
      return;
    }
    if (d.status === 'payment_required') {
      localStorage.setItem('token', d.token);
      setUser(d);
      setLocked(true);
      return;
    }
    localStorage.setItem('token', d.token);
    localStorage.setItem('is_admin', d.is_admin ? 'true' : 'false');
    setUser({ token: d.token, is_admin: d.is_admin });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={48}/>
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!user
        ? <AuthFlow onLogin={handleLogin} />
        : demo
        ? <Dashboard user={user} onLogout={logout} demoMode={true} demoData={DEMO_DATA} onSetup={() => { setDemo(false); setSetup(true); }} googleToken={googleAccessToken} />
        : setup
        ? <SetupWizard token={localStorage.getItem('token')} googleToken={googleAccessToken} onComplete={() => { setSetup(false); window.location.reload(); }} />
        : locked
        ? <PaymentLock token={user.token} onUnlock={() => { setLocked(false); window.location.reload(); }} />
        : <Dashboard user={user} onLogout={logout} demoMode={false} />
      }
    </GoogleOAuthProvider>
  );
};

// 1. GİRİŞ EKRANI
const AuthFlow = ({ onLogin }) => {
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (res) => {
      setError(null);
      setIsLoggingIn(true);
      try {
        const r = await axios.post(`${API_URL}/auth/google-login`, { access_token: res.access_token });
        setIsLoggingIn(false); // ← ÖNCE FALSE YAP
        onLogin(r.data);       // ← SONRA onLogin ÇAĞıR
      } catch (e) {
        setError(e.response?.data?.detail || "Giriş başarısız.");
        setIsLoggingIn(false);
      }
    },
    onError: () => {
      setError("Google bağlantısı kurulamadı.");
      setIsLoggingIn(false);
    },
    scope: "https://www.googleapis.com/auth/business.manage",
    ux_mode: "popup",
  });

  const manualLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      const r = await axios.post(`${API_URL}/auth/login`, { email, password: pass });
      setIsLoggingIn(false);
      onLogin(r.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Hatalı giriş.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold">
          <ArrowLeft size={20}/> Geri
        </Link>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <MessageSquare size={40} className="text-white"/>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Giriş Yap</h1>
          <p className="text-gray-500 mt-3 text-lg font-medium">İşletmenizi yönetmeye başlayın.</p>
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold mb-6">{error}</div>}
          <button onClick={() => login()} disabled={isLoggingIn} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3.5 rounded-2xl hover:bg-gray-50 transition shadow-sm font-bold text-gray-700 text-lg">
            {isLoggingIn
              ? <Loader2 className="animate-spin text-blue-600" size={24}/>
              : <><img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="google"/> Google ile Devam Et</>
            }
          </button>
          <div className="relative flex py-8 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-bold">veya e-posta ile</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div className="space-y-4">
            <input className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium" placeholder="E-posta adresi (örn: admin)" value={email} onChange={e => setEmail(e.target.value)}/>
            <input className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium" type="password" placeholder="Şifre" value={pass} onChange={e => setPass(e.target.value)}/>
            <button onClick={manualLogin} disabled={isLoggingIn} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition shadow-lg flex items-center justify-center">
              {isLoggingIn ? <Loader2 className="animate-spin text-white" size={24}/> : "Panele Gir"}
            </button>
          </div>
          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm font-medium">Hesabınız yok mu? </span>
            <Link to="/register" className="text-blue-600 font-bold text-sm hover:underline">
              Ücretsiz kayıt olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. SETUP WIZARD
const SetupWizard = ({ token, googleToken, onComplete }) => {
    const [locations, setLocations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [sector, setSector] = useState("Restoran");
    const [kvkk, setKvkk] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState("loading");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasGmb, setHasGmb] = useState(false);

    useEffect(() => {
        const fetchLocs = async () => {
            if (!googleToken) { setMode("maps"); return; }
            setLoading(true);
            try {
                const res = await axios.post(`${API_URL}/auth/fetch-my-businesses`, { access_token: googleToken });
                if (res.data.locations && res.data.locations.length > 0) {
                    setLocations(res.data.locations);
                    setHasGmb(true);
                    setMode("gmb");
                } else {
                    setMode("maps");
                }
            } catch { setMode("maps"); }
            setLoading(false);
        };
        fetchLocs();
    }, [googleToken]);

    const searchOnMaps = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/competitor-analysis/search`, { query: searchQuery });
            setSearchResults(res.data.results || []);
            if (res.data.results.length === 0) setError("Sonuç bulunamadı, farklı bir arama deneyin.");
        } catch { setError("Arama sırasında hata oluştu."); }
        setSearching(false);
    };

    const selectFromMaps = (place) => {
        setSelected({ name: place.name, place_id: place.place_id, location_id: null, address: place.address });
        setMode("confirm");
    };

    const submit = async () => {
        if (!selected || !kvkk) { setError("İşletme seçimi ve onay zorunludur."); return; }
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_URL}/auth/setup`, {
                token, business_name: selected.name, place_id: selected.place_id,
                location_id: selected.location_id || "", sector, kvkk_accepted: kvkk,
                has_gmb: hasGmb,
            });
            onComplete();
        } catch (e) {
            setError(e.response?.data?.detail || "Kurulum sırasında hata oluştu.");
            setLoading(false);
        }
    };

    if (mode === "loading") return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48}/>
                <p className="text-gray-500 font-bold">Google hesabınız kontrol ediliyor...</p>
            </div>
        </div>
    );

    if (mode === "gmb") return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><Check size={22}/></div>
                    <h2 className="text-3xl font-black text-gray-900">İşletmeni Bağla</h2>
                </div>
                <p className="text-gray-500 mb-8 font-medium">Google Benim İşletmem hesabınız bulundu.</p>
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm mb-6 font-bold">{error}</div>}
                <div className="space-y-6">
                    <div className="max-h-60 overflow-y-auto border-2 border-gray-100 rounded-2xl divide-y">
                        {locations.map(loc => (
                            <div key={loc.place_id} onClick={() => setSelected(loc)}
                                className={`p-4 cursor-pointer flex justify-between items-center transition ${selected?.place_id === loc.place_id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}>
                                <div>
                                    <div className="font-bold text-gray-900">{loc.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">{loc.address}</div>
                                </div>
                                {selected?.place_id === loc.place_id && <Check className="text-blue-600" size={24}/>}
                            </div>
                        ))}
                    </div>
                    <select className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50 font-bold outline-none focus:border-blue-500" value={sector} onChange={e => setSector(e.target.value)}>
                        {SECTORS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-600" checked={kvkk} onChange={e => setKvkk(e.target.checked)}/>
                        <span className="text-sm text-gray-600 font-medium">
                            <a href="/gizlilik" target="_blank" className="text-blue-600 underline">Gizlilik Politikası</a> ve <a href="/sartlar" target="_blank" className="text-blue-600 underline">Kullanım Koşulları</a>'nı onaylıyorum.
                        </span>
                    </label>
                    <button onClick={submit} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={24}/> : <><Check size={20}/> Panelimi Kur</>}
                    </button>
                </div>
                <button onClick={() => setMode("maps")} className="mt-4 w-full text-gray-400 font-bold text-sm hover:text-gray-600 transition">
                    İşletmemi listede göremiyorum, ara →
                </button>
            </div>
        </div>
    );

    if (mode === "maps") return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full">
                <h2 className="text-3xl font-black text-gray-900 mb-2">İşletmeni Bul</h2>
                <p className="text-gray-500 mb-8 font-medium">
                    Google Haritalar'da işletme adını ve şehrini yazın.
                    <br/><span className="text-blue-600 font-bold">Örn: "Café Bleu Kadıköy İstanbul"</span>
                </p>
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm mb-6 font-bold">{error}</div>}
                <div className="flex gap-3 mb-6">
                    <input className="flex-1 p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition font-medium"
                        placeholder="İşletme adı ve şehir..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && searchOnMaps()}
                    />
                    <button onClick={searchOnMaps} disabled={searching} className="bg-gray-900 text-white px-6 rounded-2xl font-bold hover:bg-black transition flex items-center gap-2">
                        {searching ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <div className="max-h-72 overflow-y-auto border-2 border-gray-100 rounded-2xl divide-y">
                        {searchResults.map(r => (
                            <div key={r.place_id} onClick={() => selectFromMaps(r)}
                                className="p-4 cursor-pointer hover:bg-blue-50 transition flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-900">{r.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">{r.address}</div>
                                    {r.rating > 0 && <div className="flex items-center gap-1 mt-1 text-yellow-500 text-xs font-bold"><Star size={12} fill="currentColor"/> {r.rating}</div>}
                                </div>
                                <ArrowRight className="text-blue-400 shrink-0" size={20}/>
                            </div>
                        ))}
                    </div>
                )}
                {searchResults.length === 0 && !searching && !error && (
                    <div className="text-center py-6 text-gray-400">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="font-medium text-sm">İşletme adını yazıp aratın</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (mode === "confirm") return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Doğrula ve Kur</h2>
                <p className="text-gray-500 mb-8 font-medium">Seçtiğiniz işletmeyi onaylayın.</p>
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm mb-6 font-bold">{error}</div>}
                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-black text-xl text-gray-900">{selected?.name}</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium">{selected?.address}</div>
                        </div>
                        <button onClick={() => { setMode("maps"); setSearchResults([]); }} className="text-gray-400 hover:text-red-500 transition ml-4">
                            <X size={20}/>
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-black text-gray-500 tracking-wider mb-2 block">SEKTÖR</label>
                        <select className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50 font-bold outline-none focus:border-blue-500" value={sector} onChange={e => setSector(e.target.value)}>
                            {SECTORS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-600" checked={kvkk} onChange={e => setKvkk(e.target.checked)}/>
                        <span className="text-sm text-gray-600 font-medium">
                            <a href="/gizlilik" target="_blank" className="text-blue-600 underline">Gizlilik Politikası</a> ve <a href="/sartlar" target="_blank" className="text-blue-600 underline">Kullanım Koşulları</a>'nı onaylıyorum.
                        </span>
                    </label>
                    <button onClick={submit} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={24}/> : <><Zap size={20}/> Panelimi Kur!</>}
                    </button>
                </div>
            </div>
        </div>
    );

    return null;
};

// 3. ÖDEME PLANLARI
const MembershipPlans = ({ token, onPaid, onError }) => {
    const [loading, setLoading] = useState(false);
    const pay = async (type) => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/payment/subscribe`, { card_number: "123", duration_months: 1, package_type: type });
            onPaid();
        } catch(e) { onError("Ödeme başarısız."); setLoading(false); }
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 p-8 rounded-3xl bg-white flex flex-col justify-between hover:border-gray-300 transition">
                <div>
                    <div className="font-black text-2xl text-gray-800 mb-1">ESNAF</div>
                    <div className="text-4xl font-black text-blue-600 my-4">400 ₺<span className="text-base text-gray-400 font-bold">/ay</span></div>
                    <ul className="space-y-2 mb-6 text-sm font-medium text-gray-600">
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500 shrink-0"/> 50 yorum yanıtlama hakkı</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500 shrink-0"/> Tüm yorumları görüntüle</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500 shrink-0"/> Günde 1 rakip analizi</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500 shrink-0"/> AI danışman</li>
                    </ul>
                </div>
                <button onClick={() => pay(1)} disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-700 transition">Seç</button>
            </div>
            <div className="border-2 border-blue-600 p-8 rounded-3xl bg-blue-50 relative flex flex-col justify-between shadow-xl shadow-blue-100">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-5 py-2 rounded-bl-2xl rounded-tr-2xl font-black tracking-wider">EN POPÜLER</div>
                <div>
                    <div className="font-black text-2xl text-blue-900 mb-1">USTA</div>
                    <div className="text-4xl font-black text-blue-600 my-4">1.000 ₺<span className="text-base text-blue-400 font-bold">/ay</span></div>
                    <ul className="space-y-2 mb-6 text-sm font-medium text-blue-800">
                        <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> 500 yorum yanıtlama hakkı</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> Tüm yorumları görüntüle</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> Sınırsız rakip analizi</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> AI danışman</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> Öncelikli destek</li>
                    </ul>
                </div>
                <button onClick={() => pay(2)} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Seç</button>
            </div>
        </div>
    );
};

const PaymentLock = ({ token, onUnlock }) => {
    const [toast, setToast] = useState(null);
    return (
        <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
            <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)}/>
            <div className="bg-white p-12 rounded-[2rem] w-full max-w-5xl flex flex-col md:flex-row gap-12 shadow-2xl">
                <div className="w-full md:w-1/3 flex flex-col justify-center">
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8"><Lock size={48}/></div>
                    <h1 className="text-5xl font-black mb-4 text-gray-900 leading-tight">Süreniz Doldu</h1>
                    <p className="text-gray-500 text-lg font-medium">Sistemi kullanmaya devam etmek için paketinizi yenileyin.</p>
                </div>
                <div className="w-full md:w-2/3 md:border-l border-gray-100 md:pl-12">
                    <MembershipPlans token={token} onPaid={() => onUnlock()} onError={(msg) => setToast({msg, type: 'error'})}/>
                </div>
            </div>
        </div>
    );
};

// 4. DASHBOARD
function Dashboard({ user, onLogout, demoMode = false, demoData = null, onSetup }) {
  const [data, setData] = useState(demoMode ? demoData : null);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(!demoMode);
  const [toast, setToast] = useState(null);

  const refresh = async (showLoader = true) => {
    if (demoMode) return;
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/dashboard`);
      setData(res.data);
    } catch(e) { console.error('Dashboard refresh error:', e); setLoading(false); }
    finally { if (showLoader) setLoading(false); }
  };

  const fetchReal = async () => {
    if (demoMode) { setToast({msg: '🔒 Demo moddasınız. İşletmenizi bağlayın!', type: 'error'}); return; }
    try {
      const res = await axios.post(`${API_URL}/business/fetch-reviews`, {});
      setToast({msg: res.data.msg, type: 'success'});
      refresh(false);
    } catch(e) { setToast({msg: e.response?.data?.detail || "Hata", type: 'error'}); }
  };

  useEffect(() => { if (!demoMode) refresh(); }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={64}/></div>;
  if (!data) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans selection:bg-blue-100">
      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)}/>

      {/* DEMO MODU: işletme henüz seçilmemiş */}
      {demoMode && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 flex items-center justify-between shadow-lg shrink-0 z-50">
          <div className="flex items-center gap-3">
            <Zap size={18} className="shrink-0"/>
            <span className="font-bold text-sm">Demo Moddasınız — Gerçek verilerinizi görmek için işletmenizi bağlayın.</span>
          </div>
          <button onClick={onSetup} className="bg-white text-orange-600 px-5 py-1.5 rounded-xl font-black text-sm hover:bg-orange-50 transition shrink-0 ml-4">
            İşletmemi Bağla →
          </button>
        </div>
      )}
      {/* DENEME MODU: işletme bağlı ama paket yok */}
      {!demoMode && data?.business?.membership_tier === 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 flex items-center justify-between shadow-lg shrink-0 z-50">
          <div className="flex items-center gap-2">
            <Star size={16} fill="white" className="shrink-0"/>
            <span className="font-bold text-sm">
              Ücretsiz Deneme Modundasınız — Yalnızca {data.business.has_gmb ? "6" : "5"} yorum görüntüleyebilir ve kısıtlı işlem yapabilirsiniz.
              {" "}Paket alarak tüm yorumlarınıza erişin, rakip istihbaratı kullanın!
            </span>
          </div>
          <button onClick={() => setView('settings')} className="bg-white text-blue-600 px-5 py-1.5 rounded-xl font-black text-sm hover:bg-blue-50 transition shrink-0 ml-4 whitespace-nowrap">
            Paket Al →
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-gray-100 py-8 flex flex-col justify-between px-6 z-10 shadow-sm">
          <div>
            <div className="mb-10 flex items-center gap-3 text-blue-600">
              <MessageSquare size={28} className="fill-blue-600 text-white"/>
              <span className="text-3xl font-black tracking-tight text-gray-900">Yanıtlıyor</span>
            </div>
            <div className="mb-8 bg-gray-50 p-5 rounded-3xl border border-gray-100">
              <div className="font-black text-gray-900 text-lg">{data.business.name}</div>
              <div className="text-sm font-bold text-blue-600 mt-1">{data.business.tier}</div>
            </div>
            <nav className="space-y-2">
              <SidebarItem icon={<BarChart2/>} label="Genel Bakış" active={view==="dashboard"} onClick={() => setView("dashboard")}/>
              <SidebarItem icon={<MessageSquare/>} label="Yorumlar" active={view==="reviews"} onClick={() => setView("reviews")} badge={data.stats.pending}/>
              <SidebarItem icon={<Target/>} label="Rakip İstihbaratı" active={view==="competitors"} onClick={() => setView("competitors")}/>
              <SidebarItem icon={<Bot/>} label="AI Danışman" active={view==="consultant"} onClick={() => setView("consultant")}/>
              {!demoMode && <SidebarItem icon={<Settings/>} label="Ayarlar" active={view==="settings"} onClick={() => setView("settings")}/>}
              {user.is_admin && <SidebarItem icon={<Shield/>} label="Yönetici Paneli" active={view==="admin"} onClick={() => setView("admin")}/>}
            </nav>
          </div>
          <button onClick={onLogout} className="flex justify-center items-center gap-2 py-4 text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-2xl transition">
            <LogOut size={20}/> Çıkış Yap
          </button>
        </aside>
        <main className="flex-1 overflow-y-auto p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <h1 className="text-5xl font-black text-gray-900">Panel</h1>
              {view === 'dashboard' && (
                <button onClick={fetchReal} className="flex items-center gap-2 text-sm bg-white border-2 border-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm">
                  <RefreshCw size={18} className="text-blue-600"/> Canlı Veri Çek
                </button>
              )}
            </div>
            {view === 'dashboard' && <DashboardView stats={data.stats} reviews={data.reviews}/>}
            {view === 'reviews' && <ReviewsView reviews={data.reviews} token={user.token} onUpdate={() => refresh(false)} onToast={setToast} demoMode={demoMode} membershipTier={data?.business?.membership_tier ?? 0}/>}
            {view === 'competitors' && <CompetitorAnalysisView token={user.token} onToast={setToast} demoMode={demoMode}/>}
            {view === 'consultant' && <ConsultantView token={user.token} businessName={data.business.name} onToast={setToast} demoMode={demoMode} membershipTier={data?.business?.membership_tier ?? 0}/>}
            {view === 'settings' && <SettingsView business={data.business} token={user.token} onUpdate={() => refresh(false)} onToast={setToast} demoMode={demoMode} onUpgraded={() => { setDemo(false); window.location.reload(); }}/>}
            {view === 'admin' && <AdminPanelView token={user.token}/>}
          </div>
        </main>
      </div>
    </div>
  );
}

const DashboardView = ({ stats, reviews = [] }) => {
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.status === 'approved').length;
  const replyRate = totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0;
  const positive = reviews.filter(r => r.rating >= 4).length;
  const neutral = reviews.filter(r => r.rating === 3).length;
  const negative = reviews.filter(r => r.rating <= 2).length;
  const criticalReviews = reviews.filter(r => r.rating <= 2 && r.status === 'pending');
  const bestReview = [...reviews].filter(r => r.rating === 5 && r.comment).sort(() => 0.5 - Math.random())[0];

  // Kelime bulutu
  const stopWords = new Set(['bir','ve','bu','da','de','ile','için','çok','daha','ama','ben','biz','siz','olan','oldu','var','yok','ki','ya','ne','en','her','hiç','kadar','hem','ise','bile','olarak','veya','çünkü','fakat','the','a','an','bu','şu','o','bu','bunu','beni','bize','bana','çok','bile','sadece','gibi','kadar','diye','olan','oldu','olarak','olup','olsa','olur','oluyor','olmuş','ettim','etti','etmek','etmiş','etmedi']);
  const allText = reviews.map(r => r.comment || '').join(' ').toLowerCase().replace(/[^a-züşçğıöa-z\s]/gi, '');
  const words = allText.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const wordFreq = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 14);

  const pct = (n) => totalReviews > 0 ? Math.round((n / totalReviews) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* 🚨 KRİTİK ALARM */}
      {criticalReviews.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 p-5 rounded-3xl flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={22}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-red-700 text-lg">🚨 {criticalReviews.length} Kritik Yorum Yanıt Bekliyor!</div>
            <p className="text-red-600 text-sm font-medium mt-1">Düşük puanlı yorumlar yanıtsız kaldıkça itibarınız zarar görüyor.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {criticalReviews.slice(0, 3).map((r, i) => (
                <span key={i} className="bg-white border border-red-200 px-3 py-1 rounded-xl text-sm font-bold text-red-700">
                  {'★'.repeat(r.rating)} {r.customer_name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAT KARTLARI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard title="Toplam Yorum" value={totalReviews} icon={<MessageSquare/>}/>
        <StatCard title="Bekleyen" value={stats?.pending || 0} icon={<AlertTriangle/>}/>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Yanıt Oranı</p>
          <h4 className="text-4xl font-black text-gray-900 mt-2">%{replyRate}</h4>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full ${replyRate >= 70 ? 'bg-green-500' : replyRate >= 40 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{width: `${replyRate}%`}}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mutlu Müşteri</p>
          <h4 className="text-4xl font-black text-gray-900 mt-2">%{pct(positive)}</h4>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-yellow-400" style={{width: `${pct(positive)}%`}}></div>
          </div>
        </div>
      </div>

      {/* DUYGU ANALİZİ + KELİME BULUTU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Duygu Analizi */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-5 flex items-center gap-2">😊 Müşteri Duygu Analizi</h3>
          <div className="space-y-4">
            {[
              { label: '😄 Mutlu', count: positive, color: 'bg-green-500', textColor: 'text-green-700' },
              { label: '😐 Nötr', count: neutral, color: 'bg-yellow-400', textColor: 'text-yellow-700' },
              { label: '😠 Olumsuz', count: negative, color: 'bg-red-500', textColor: 'text-red-700' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className={`font-bold text-sm ${textColor}`}>{label} ({count})</span>
                  <span className={`font-black ${textColor}`}>%{pct(count)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`${color} h-3 rounded-full transition-all duration-700`} style={{width: `${pct(count)}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex justify-between mb-1.5">
              <span className="font-bold text-sm text-blue-700">⚡ Yanıt Oranınız</span>
              <span className="font-black text-blue-700">%{replyRate}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className={`h-3 rounded-full ${replyRate >= 70 ? 'bg-blue-500' : replyRate >= 40 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{width: `${replyRate}%`}}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {replyRate >= 70 ? '🏆 Harika yanıt oranı!' : replyRate >= 40 ? '⚠️ Yanıt oranını artır.' : '🚨 Yorumlar yanıtsız kalıyor!'}
            </p>
          </div>
        </div>

        {/* Kelime Bulutu */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-5 flex items-center gap-2">💬 Müşteriler Ne Diyor?</h3>
          {topWords.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              {topWords.map(([word, count], i) => {
                const sz = ['text-3xl','text-2xl','text-xl','text-xl','text-lg','text-lg','text-base','text-base','text-sm','text-sm','text-xs','text-xs','text-xs','text-xs'][i] || 'text-xs';
                const cls = [
                  'text-blue-600 bg-blue-50','text-purple-600 bg-purple-50','text-green-600 bg-green-50',
                  'text-orange-600 bg-orange-50','text-pink-600 bg-pink-50','text-indigo-600 bg-indigo-50',
                  'text-teal-600 bg-teal-50','text-red-500 bg-red-50'
                ][i % 8];
                return <span key={word} className={`${sz} ${cls} font-black px-3 py-1 rounded-xl`}>{word}</span>;
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 font-medium">Yorum verisi bekleniyor...</div>
          )}
        </div>
      </div>

      {/* ÖVÜLEN & ŞİKAYET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-5 flex items-center gap-2">
            <ThumbsUp className="text-green-500" size={20}/> En Çok Övülen
          </h3>
          {stats?.analysis?.positives?.filter(p => p !== 'Veri Bekleniyor').length > 0 ? (
            <ul className="space-y-3">
              {stats.analysis.positives.map((p, i) => (
                <li key={i} className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">{i+1}</div>
                  <span className="font-bold text-gray-800 text-sm">{p}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-400 font-medium text-sm">Analiz için canlı veri çekin</p>}
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-5 flex items-center gap-2">
            <ThumbsDown className="text-red-500" size={20}/> En Çok Şikayet Edilen
          </h3>
          {stats?.analysis?.negatives?.length > 0 ? (
            <ul className="space-y-3">
              {stats.analysis.negatives.map((n, i) => (
                <li key={i} className="flex items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">{i+1}</div>
                  <span className="font-bold text-gray-800 text-sm">{n}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-400 font-medium text-sm">Analiz için canlı veri çekin</p>}
        </div>
      </div>

      {/* AI TAVSİYE + EN İYİ YORUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Bot size={20}/></div>
            <span className="font-black text-xs tracking-widest text-blue-300 uppercase">Yapay Zeka Tavsiyesi</span>
          </div>
          <p className="text-xl font-medium leading-relaxed">"{stats?.analysis?.advice || 'Canlı veri çekin, AI analiz üretsin.'}"</p>
          <div className="mt-5 flex items-center gap-2 text-blue-300 text-xs font-bold">
            <Zap size={12}/> Yorumlarınız analiz edilerek üretildi
          </div>
        </div>

        {bestReview ? (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl text-white shadow-xl shadow-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🥇</div>
              <span className="font-black text-xs tracking-widest text-yellow-100 uppercase">Öne Çıkan Yorum</span>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="white" className="text-white"/>)}
            </div>
            <p className="text-lg font-medium leading-relaxed mb-4">"{bestReview.comment.length > 110 ? bestReview.comment.substring(0,110)+'...' : bestReview.comment}"</p>
            <div className="font-black text-yellow-100 text-sm">— {bestReview.customer_name}</div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 p-8 rounded-3xl flex items-center justify-center text-center bg-gray-50">
            <div>
              <div className="text-4xl mb-3">🥇</div>
              <p className="font-bold text-gray-400 text-sm">5 yıldızlı yorum gelince burada parlar</p>
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ POLİTİKA İHLALİ TARAYICISI */}
      {negative > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20}/> Google Politika İhlali Tarayıcısı
          </h3>
          <p className="text-gray-500 text-sm font-medium mb-5">Olumsuz yorumlar kurallara aykırı içerik barındırıyor olabilir. Analiz ettirin, itiraz edin.</p>
          <div className="space-y-3">
            {reviews.filter(r => r.rating <= 2).slice(0, 4).map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-100 p-4 rounded-2xl gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex gap-0.5 shrink-0">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} size={13} fill={si < r.rating ? '#f97316' : 'none'} className={si < r.rating ? 'text-orange-500' : 'text-gray-300'}/>
                    ))}
                  </div>
                  <span className="font-bold text-gray-800 text-sm shrink-0">{r.customer_name}</span>
                  <span className="text-gray-500 text-xs font-medium truncate hidden md:block">"{r.comment?.substring(0, 55)}..."</span>
                </div>
                <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer hover:bg-orange-200 transition">
                  Analiz Et →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
const ReviewsView = ({ reviews, token, onUpdate, onToast, demoMode = false, membershipTier = 1 }) => {
    const [editId, setEditId] = useState(null);
    const [txt, setTxt] = useState("");
    const isTrial = membershipTier === 0;

    const action = async (id, type) => {
        if (demoMode) { onToast({msg: '🔒 Demo modunda işlem yapılamaz.', type: 'error'}); return; }
        try {
            await axios.post(`${API_URL}/reviews/${id}/action?action=${type}&reply=${encodeURIComponent(txt)}`, {});
            setEditId(null); onUpdate(); onToast({msg: 'İşlem başarılı', type: 'success'});
        } catch(e) { onToast({msg: e.response?.data?.detail || "Hata", type: 'error'}); }
    };

    return (
        <div className="space-y-6">
            {/* Deneme modu uyarısı */}
            {isTrial && !demoMode && (
                <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl flex items-center gap-4">
                    <Lock className="text-blue-500 shrink-0" size={24}/>
                    <div>
                        <div className="font-black text-blue-800">Deneme Modunda Yorum Yönetimi</div>
                        <p className="text-blue-600 text-sm font-medium mt-0.5">Yorumları görüntüleyebilirsiniz ancak onaylama ve yayınlama için paket almanız gerekiyor.</p>
                    </div>
                </div>
            )}

            {reviews.map(r => (
                <div key={r.id} className={`bg-white p-8 rounded-3xl border shadow-sm ${isTrial && !demoMode ? 'border-gray-100' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-black text-xl text-gray-900">{r.customer_name}</h3>
                            <span className="text-sm text-gray-400 font-medium">{r.date}</span>
                        </div>
                        <div className="flex text-yellow-400 bg-yellow-50 px-3 py-1.5 rounded-xl">
                            {[...Array(5)].map((_, i) => (<Star key={i} size={20} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-yellow-200"}/>))}
                        </div>
                    </div>
                    <p className="text-gray-700 mb-8 text-lg font-medium leading-relaxed">"{r.comment}"</p>
                    {r.status === 'pending' ? (
                        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                            {editId === r.id ? (
                                <div>
                                    <textarea className="w-full border-2 border-blue-200 p-4 rounded-xl font-medium outline-none focus:border-blue-500" rows={4} value={txt} onChange={e => setTxt(e.target.value)}/>
                                    <div className="flex gap-3 mt-4">
                                        <button onClick={() => setEditId(null)} className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">İptal</button>
                                        {isTrial || demoMode ? (
                                            <button disabled className="bg-gray-200 text-gray-400 px-8 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center gap-2">
                                                <Lock size={16}/> Paket Gerekli
                                            </button>
                                        ) : (
                                            <button onClick={() => action(r.id, 'approve')} className="bg-green-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-green-600 transition">Yayınla</button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 text-blue-600 font-bold mb-3"><Bot size={18}/> AI Taslak Yanıtı:</div>
                                    <p className="text-gray-800 mb-6 font-medium text-lg leading-relaxed bg-white p-4 rounded-xl border border-blue-50">"{r.ai_reply}"</p>
                                    <div className="flex gap-3 flex-wrap">
                                        {isTrial || demoMode ? (
                                            <div className="flex items-center gap-3">
                                                <button disabled className="bg-gray-100 text-gray-400 px-8 py-3 rounded-xl font-bold cursor-not-allowed flex items-center gap-2 border-2 border-gray-200">
                                                    <Lock size={16}/> Onayla — Paket Gerekli
                                                </button>
                                                <span className="text-xs text-gray-400 font-medium">Paket alarak yanıtları yayınlayın</span>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => action(r.id, 'approve')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition">Hemen Onayla</button>
                                                <button onClick={() => { setEditId(r.id); setTxt(r.ai_reply); }} className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition">Düzenle</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-green-700 bg-green-50 px-5 py-2.5 rounded-xl inline-flex font-bold items-center gap-2"><Check size={18}/> Onaylandı</div>
                    )}
                </div>
            ))}
        </div>
    );
};

const SettingsView = ({ business, token, onUpdate, onToast }) => {
    const [showPass, setShowPass] = useState(false);
    return (
        <div className="space-y-10">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-black mb-8 text-gray-900">Abonelik Durumu</h2>
                <div className="flex justify-between bg-gray-50 border border-gray-100 p-8 rounded-3xl mb-10">
                    <div><div className="text-sm font-bold text-gray-400 tracking-wider mb-1">MEVCUT PAKET</div><div className="text-3xl font-black text-blue-600">{business.tier}</div></div>
                    <div><div className="text-sm font-bold text-gray-400 tracking-wider mb-1">KALAN SÜRE</div><div className="text-3xl font-black text-gray-900">{business.days_left} Gün</div></div>
                </div>
                <MembershipPlans token={token} onPaid={() => { onToast({msg: 'Abonelik yenilendi', type: 'success'}); onUpdate(); }} onError={(m) => onToast({msg: m, type: 'error'})}/>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-black mb-8 text-gray-900">Güvenlik Ayarları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-sm font-black text-gray-400 tracking-wider">KAYITLI E-POSTA</label>
                        <input disabled value={business.email} className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 mt-3 font-medium text-gray-600"/>
                    </div>
                    <div>
                        <label className="text-sm font-black text-gray-400 tracking-wider">OTOMATİK ŞİFRE</label>
                        <div className="relative mt-3">
                            <input type={showPass ? "text" : "password"} readOnly value={business.auto_password} className="w-full p-4 border-2 border-gray-200 rounded-2xl font-mono text-lg bg-white"/>
                            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700">{showPass ? <EyeOff/> : <Eye/>}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CompetitorAnalysisView = ({ token, onToast }) => {
    const [step, setStep] = useState(1);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const search = async () => {
        try {
            const res = await axios.post(`${API_URL}/competitor-analysis/search`, { query });
            setResults(res.data.results);
        } catch { onToast({msg: 'Arama hatası', type: 'error'}); }
    };
    const analyze = async (place) => {
        setStep(2);
        try {
            const res = await axios.post(`${API_URL}/competitor-analysis/analyze`, { place_id: place.place_id, name: place.name });
            setAnalysis(res.data); setStep(3);
        } catch { onToast({msg: 'Analiz hatası', type: 'error'}); setStep(1); }
    };
    if (step === 1) return (
        <div className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Target size={40}/></div>
            <h2 className="text-4xl font-black mb-4 text-gray-900">Rakibini Bul</h2>
            <p className="text-gray-500 font-medium mb-10 text-lg">Hangi işletmenin röntgenini çekmek istiyorsun?</p>
            <div className="flex gap-4">
                <input className="flex-1 p-5 border-2 border-gray-200 rounded-2xl text-lg font-medium outline-none focus:border-blue-500 transition" placeholder="Örn: X Burger Kadıköy" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}/>
                <button onClick={search} className="bg-gray-900 text-white px-10 rounded-2xl font-bold text-lg hover:bg-black transition shadow-lg">Ara</button>
            </div>
            <div className="mt-10 space-y-3">
                {results.map(r => (
                    <div key={r.place_id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center hover:border-gray-300 transition">
                        <span className="font-bold text-gray-800 text-lg">{r.name}</span>
                        <button onClick={() => analyze(r)} className="bg-blue-100 text-blue-700 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition">İstihbarat Topla</button>
                    </div>
                ))}
            </div>
        </div>
    );
    if (step === 2) return <div className="text-center py-32"><Loader2 className="animate-spin mx-auto text-blue-600 mb-6" size={64}/><h3 className="text-2xl font-bold text-gray-600">Rakip Verileri Analiz Ediliyor...</h3></div>;
    return (
        <div className="bg-white p-12 border border-gray-100 rounded-[2rem] shadow-sm">
            <button onClick={() => setStep(1)} className="mb-8 font-bold text-gray-400 hover:text-gray-900 flex items-center gap-2 transition"><ArrowLeft size={20}/> Yeni Arama</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><ThumbsUp size={24}/></div><h3 className="text-2xl font-black text-gray-900">Güçlü Yönler</h3></div>
                    <ul className="space-y-4">{analysis.strengths.map((s, i) => <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100"><Check className="text-green-500 mt-1 shrink-0"/><span className="font-medium text-gray-700">{s}</span></li>)}</ul>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><ThumbsDown size={24}/></div><h3 className="text-2xl font-black text-gray-900">Zayıf Yönler</h3></div>
                    <ul className="space-y-4">{analysis.weaknesses.map((s, i) => <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100"><AlertTriangle className="text-red-500 mt-1 shrink-0"/><span className="font-medium text-gray-700">{s}</span></li>)}</ul>
                </div>
            </div>
            <div className="mt-12 bg-gradient-to-br from-gray-900 to-black text-white p-10 rounded-3xl shadow-2xl">
                <span className="text-blue-400 font-black tracking-widest text-sm uppercase mb-4 block">Saldırı Stratejisi</span>
                <p className="text-2xl font-medium leading-relaxed">"{analysis.strategy_advice}"</p>
            </div>
        </div>
    );
};

const ConsultantView = ({ token, businessName, onToast, demoMode = false, membershipTier = 1 }) => {
    const [msgs, setMsgs] = useState([{s: 'ai', t: `Merhaba ${businessName} sahibi. İşletmenle ilgili yorumları okudum ve aklımda tutuyorum. Bugün sana nasıl yardımcı olabilirim?`}]);
    const [input, setInput] = useState("");
    const endRef = useRef(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
    const send = async () => {
        if (!input) return;
        if (demoMode) { onToast({msg: '🔒 AI Danışman demo modda kullanılamaz. Paket alın!', type: 'error'}); return; }
        const m = input; setMsgs(p => [...p, {s: 'user', t: m}]); setInput("");
        try {
            const res = await axios.post(`${API_URL}/consultant/chat`, { message: m });
            setMsgs(p => [...p, {s: 'ai', t: res.data.reply}]);
        } catch(e) { onToast({msg: e.response?.data?.detail || (demoMode ? '🔒 AI Danışman demo modda kullanılamaz. Paket alın!' : 'Bağlantı koptu'), type: 'error'}); }
    };
    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] h-[700px] flex flex-col shadow-sm">
            <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-gray-50/50 rounded-t-[2rem]">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.s === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-5 rounded-3xl max-w-[75%] font-medium text-lg leading-relaxed shadow-sm ${m.s === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>{m.t}</div>
                    </div>
                ))}
                <div ref={endRef}/>
            </div>
            <div className="p-6 bg-white border-t border-gray-100 rounded-b-[2rem] flex gap-4">
                <input className="flex-1 border-2 border-gray-200 p-5 rounded-2xl text-lg outline-none focus:border-blue-500 transition font-medium" placeholder="Danışmanınıza sorunuzu yazın..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}/>
                <button onClick={send} className="bg-gray-900 text-white px-10 rounded-2xl font-bold hover:bg-black transition shadow-lg"><Send size={24}/></button>
            </div>
        </div>
    );
};

const AdminPanelView = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [tab, setTab] = useState('users');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/users`);
            setUsers(res.data);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggle = async (id) => {
        await axios.post(`${API_URL}/admin/toggle-user/${id}`, {});
        fetchUsers();
    };

    const totalUsers = users.filter(u => !u.is_admin).length;
    const activeUsers = users.filter(u => u.is_active && !u.is_admin).length;
    const paidUsers = users.filter(u => u.membership_tier > 0).length;
    const trialUsers = users.filter(u => u.membership_tier === 0 && !u.is_admin).length;

    const tierBadge = (tier, pkg) => {
        if (tier === 2) return <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700">⭐ {pkg || 'Usta'}</span>;
        if (tier === 1) return <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700">✓ {pkg || 'Esnaf'}</span>;
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-500">Deneme</span>;
    };

    return (
        <div className="space-y-6">
            {/* Özet Kartlar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Kullanıcı', val: totalUsers, color: 'text-blue-600 bg-blue-50', icon: '👥' },
                    { label: 'Aktif Hesap', val: activeUsers, color: 'text-green-600 bg-green-50', icon: '✅' },
                    { label: 'Ücretli Üye', val: paidUsers, color: 'text-purple-600 bg-purple-50', icon: '💳' },
                    { label: 'Deneme Modu', val: trialUsers, color: 'text-orange-600 bg-orange-50', icon: '🔓' },
                ].map(({ label, val, color, icon }) => (
                    <div key={label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className={`text-3xl font-black ${color.split(' ')[0]}`}>{val}</div>
                        <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">{label}</div>
                    </div>
                ))}
            </div>

            {/* Kullanıcı Tablosu */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-black text-xl text-gray-900">Kullanıcı Yönetimi</h2>
                    <button onClick={fetchUsers} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition">
                        <RefreshCw size={16}/> Yenile
                    </button>
                </div>
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-wider">Kullanıcı</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-wider">Paket</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-wider">İşletme</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-wider">Yorum Kullanımı</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-wider">Durum</th>
                                    <th className="px-6 py-4 font-black text-gray-400 text-xs uppercase tracking-wider">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelected(selected?.id === u.id ? null : u)}>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900">{u.name || '—'}</div>
                                            <div className="text-gray-400 text-xs font-medium mt-0.5">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">{u.is_admin ? <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700">👑 Admin</span> : tierBadge(u.membership_tier, u.package_name)}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-700 text-sm">{u.business_name || <span className="text-gray-300">Yok</span>}</div>
                                            {u.has_gmb && <span className="text-xs text-green-600 font-bold">GMB ✓</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {!u.is_admin && u.business_name ? (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
                                                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${u.quota_limit > 0 ? Math.min((u.quota_used/u.quota_limit)*100, 100) : 0}%`}}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-500">{u.quota_used}/{u.quota_limit}</span>
                                                    </div>
                                                </div>
                                            ) : <span className="text-gray-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {u.is_active ? 'Aktif' : 'Yasaklı'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            {!u.is_admin && (
                                                <button onClick={() => toggle(u.id)} className={`text-xs font-black px-3 py-1.5 rounded-xl transition ${u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                                    {u.is_active ? 'Kapat' : 'Aç'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Seçili kullanıcı detayı */}
            {selected && (
                <div className="bg-white rounded-3xl border-2 border-blue-200 p-8 shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-black text-xl text-gray-900">📋 {selected.name} — Detay</h3>
                        <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {[
                            { label: 'E-posta', val: selected.email },
                            { label: 'Paket', val: selected.package_name || 'Deneme' },
                            { label: 'İşletme', val: selected.business_name || 'Bağlanmamış' },
                            { label: 'GMB Bağlı', val: selected.has_gmb ? 'Evet ✓' : 'Hayır' },
                            { label: 'Kota Kullanımı', val: `${selected.quota_used || 0} / ${selected.quota_limit || 0}` },
                            { label: 'Paket Bitiş', val: selected.days_left > 0 ? `${selected.days_left} gün kaldı` : 'Süresiz/Deneme' },
                            { label: 'Hesap Durumu', val: selected.is_active ? 'Aktif ✅' : 'Kapalı ❌' },
                            { label: 'Kayıt ID', val: `#${selected.id}` },
                        ].map(({ label, val }) => (
                            <div key={label} className="bg-gray-50 p-4 rounded-2xl">
                                <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">{label}</div>
                                <div className="font-bold text-gray-800">{val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<MainApp/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/dashboard" element={<MainApp/>}/>
        <Route path="/gizlilik" element={<PrivacyPolicy/>}/>
        <Route path="/sartlar" element={<TermsOfService/>}/>
      </Routes>
    </Router>
  );
}