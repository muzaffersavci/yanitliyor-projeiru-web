import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2, ArrowLeft, Check, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SECTORS = ['Restoran', 'Kafe', 'Giyim', 'Sağlık', 'Spor', 'Otel', 'Diğer', 'Genel'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    businessName: '',
    sector: 'Restoran',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Ad Soyad zorunludur.';
    if (!form.email.trim()) return 'E-posta zorunludur.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Geçerli bir e-posta girin.';
    if (!form.password) return 'Şifre zorunludur.';
    if (form.password.length < 6) return 'Şifre en az 6 karakter olmalıdır.';
    if (form.password !== form.passwordConfirm) return 'Şifreler eşleşmiyor.';
    if (!form.businessName.trim()) return 'İşletme adı zorunludur.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        businessName: form.businessName,
        sector: form.sector,
      });

      localStorage.setItem('token', res.data.token);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition">
          <ArrowLeft size={20} /> Geri
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-200">
            <MessageSquare size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hesap Oluştur</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Ücretsiz başlayın, hemen kullanın.</p>
        </div>

        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Kayıt Başarılı!</h3>
              <p className="text-gray-500 font-medium">Panele yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Ad Soyad
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ahmet Yılmaz"
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  E-posta
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ahmet@isletme.com"
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Şifre
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="En az 6 karakter"
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Şifre Tekrar
                </label>
                <input
                  name="passwordConfirm"
                  type="password"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  İşletme Adı
                </label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Kafe Deniz, Ahmet Usta Restoranı..."
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Sektör
                </label>
                <select
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50 font-bold outline-none focus:border-blue-500 transition"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><Check size={20} /> Hesabımı Oluştur</>}
              </button>

              <div className="text-center mt-4">
                <span className="text-gray-400 text-sm font-medium">Zaten hesabınız var mı? </span>
                <Link to="/login" className="text-blue-600 font-bold text-sm hover:underline">
                  Giriş yapın
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
