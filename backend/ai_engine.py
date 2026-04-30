# backend/ai_engine.py - ULTIMATE INTELLIGENCE EDITION (ENV SECURE)
import google.generativeai as genai
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

# --- API KEY KASADAN ÇEKİLİYOR ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
MODEL_VERSION = 'gemini-2.5-flash'

try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(MODEL_VERSION)
    else:
        model = None
except:
    model = None

def clean_json_response(text):
    """AI bazen markdown backtick kullanıyor, onu temizler."""
    text = text.replace("```json", "").replace("```", "").strip()
    return text

def ai_reply_gen(comment, rating, tone, bus_name, sector):
    """
    Yorumu analiz eder: Hata mı, Tercih mi, Saldırı mı?
    Ona göre 'Omurgalı' veya 'Mahcup' moduna geçer.
    """
    if not model: return "İlginiz için teşekkürler."
    
    # Gerçekçilik hissi
    time.sleep(0.5) 

    system_instruction = f"""
    Sen '{bus_name}' ({sector}) işletmesinin sahibisin.
    SEÇİLEN TON: {tone}
    
    GÖREVİN: Müşteri yorumuna cevap yazmak. Ama önce yorumu ANALİZ ETmelisin.
    
    --- ANALİZ KURALLARI (BU MANTIKLA CEVAP VER) ---
    
    SENARYO A: OPERASYONEL HATA (Yemek soğuk, servis yavaş, hijyen kötü, personel kaba)
    -> TEPKİ: Mahcubiyetini belirt, "Telafi etmek isteriz" de. Hatanı kabul et.
    
    SENARYO B: ÖZNEL TERCİH / FİYAT (Pahalı geldi, dekoru beğenmedi, müziği sevmedi)
    -> TEPKİ: ASLA özür dileme. ASLA telafi önerme. 
    -> ŞÖYLE DE: "Kalite standartlarımız gereği fiyatlarımız bu şekildedir." veya "Konseptimiz bu şekildedir, saygı duyarız." (Dik dur).
    
    SENARYO C: HAKSIZ / BOŞ SALDIRI (Sadece 1 puan verip gitmiş veya hakaret etmiş)
    -> TEPKİ: Kısa kes. "Detay belirtmemişsiniz, sorunu anlamadık." de geç. Ezilme.
    
    SENARYO D: ÖVGÜ (4-5 Yıldız)
    -> TEPKİ: Samimi ol, robotik olma. "Harikasınız, yine bekleriz!" tadında konuş. "Değerli müşterimiz" deme.
    
    --- GENEL YASAKLAR ---
    1. "Yapay zeka olduğum için..." DEME.
    2. "Geri bildiriminiz bizim için çok değerli..." gibi klişeleri KULLANMA.
    3. Uzun uzun destan yazma. Maksimum 3 cümle.
    
    MÜŞTERİ YORUMU: "{comment}"
    VERİLEN PUAN: {rating}/5
    """
    
    try:
        response = model.generate_content(system_instruction)
        return response.text.strip()
    except Exception as e:
        print(f"AI Error: {e}")
        return "Yorumunuz için teşekkür ederiz."

def generate_analysis(reviews):
    """
    Yorumları okuyup işletme sahibine JSON formatında rapor sunar.
    """
    if not model or not reviews: 
        return {"positives": ["Veri Yok"], "negatives": ["Veri Yok"], "advice": "Henüz yeterli yorum yok."}
    
    # Son 15 yorumu birleştir
    txt = "\n".join([f"- {r.comment} ({r.rating} Yıldız)" for r in reviews[:15]])
    
    prompt = f"""
    Sen usta bir işletme danışmanısın. Aşağıdaki yorumları analiz et.
    
    YORUMLAR:
    {txt}
    
    GÖREV:
    1. Müşterilerin en çok övdüğü 2 konuyu bul.
    2. Müşterilerin en çok şikayet ettiği 2 konuyu bul.
    3. İşletme sahibine tek cümlelik, can alıcı bir taktik ver.
    
    CEVABI SADECE ŞU JSON FORMATINDA VER:
    {{
        "positives": ["Övülen 1", "Övülen 2"],
        "negatives": ["Şikayet 1", "Şikayet 2"],
        "advice": "Stratejik tavsiyen buraya"
    }}
    """
    try:
        raw_text = model.generate_content(prompt).text
        return json.loads(clean_json_response(raw_text))
    except:
        return {"positives": ["Hizmet Kalitesi"], "negatives": ["Fiyatlar"], "advice": "Müşteri memnuniyetini artırmaya odaklanın."}

def analyze_removal_potential(comment):
    if not model: return {"category": "Hata", "score": 0, "report_text": "Bağlantı yok", "advice": "-"}
    prompt = f"""
    Sen Google Haritalar Politikaları Uzmanısın.
    Aşağıdaki yorumu 'Spam, Hakaret, Çıkar Çatışması, Alakasız İçerik' açısından incele.
    
    YORUM: "{comment}"
    
    Eğer yorumda küfür, hakaret, reklam veya spam varsa silinme ihtimali yüksektir.
    Eğer sadece "Yemek kötüydü" diyorsa silinmez (İfade özgürlüğü).
    
    CEVABI SADECE JSON FORMATINDA VER:
    {{
        "category": "İhlal Türü (Yoksa 'Temiz' yaz)",
        "score": 0-100 arası silinme şansı (Sayı),
        "report_text": "Google'a şikayet ederken kullanılacak resmi ve hukuksal bir itiraz metni yaz.",
        "advice": "İşletme sahibine ne yapması gerektiğini söyle."
    }}
    """
    try:
        raw_text = model.generate_content(prompt).text
        return json.loads(clean_json_response(raw_text))
    except:
        return {"category": "Genel", "score": 10, "report_text": "-", "advice": "Yorum politikara uygun görünüyor."}

def consult_business_ai(question, reviews, competitors, sector):
    """
    İşletme sahibinin sorduğu sorulara (Danışman Modu) cevap verir.
    """
    if not model: return "Bağlantı hatası oluştu."
    
    rev_sum = "\n".join([f"- {r.comment}" for r in reviews[:15]])
    
    prompt = f"""
    Sen {sector} sektöründe uzmanlaşmış, kurt bir işletme danışmanısın.
    Kullanıcının işletmesine ait son yorumlar aşağıda. Bu verileri kullanarak cevap ver.
    
    İŞLETME YORUMLARI:
    {rev_sum}
    
    SORU: "{question}"
    
    CEVAP TARZI:
    - Kısa, net ve stratejik konuş.
    - Yuvarlak laflar etme, nokta atışı tavsiye ver.
    - Yorumlardan örnek vererek konuş ("Müşterileriniz servisten şikayetçi, bu yüzden..." gibi).
    """
    try:
        return model.generate_content(prompt).text.strip()
    except: return "Şu an bu soruya cevap veremiyorum."

def analyze_competitor_deep(comp_name, rating, total_reviews, reviews_text, sector):
    """
    Rakip analizi (SWOT) - Detaylı versiyon
    """
    if not model: return {"summary": {"happiness_score":0}, "strengths":[], "weaknesses":[], "strategy_advice":"Veri yok"}
    
    prompt = f"""
    Sen Üst Düzey Stratejist ve Piyasa Analistisin.
    
    HEDEF RAKİP: {comp_name}
    SEKTÖR: {sector}
    PUAN: {rating} ({total_reviews} Yorum)
    
    RAKİBİN MÜŞTERİ YORUMLARI:
    {reviews_text}
    
    GÖREV:
    Bu verileri analiz et ve JSON formatında detaylı bir SWOT raporu çıkar.
    
    JSON FORMATI:
    {{
        "summary": {{
            "happiness_score": 0-100 (Yorumların duygu analizi sonucu puan),
            "customer_loyalty": "Düşük/Orta/Yüksek",
            "price_perception": "Ucuz/Pahalı/Fiyat-Performans"
        }},
        "strengths": ["Rakibin en iyi yaptığı 3 şey (Kısa madde)"],
        "weaknesses": ["Rakibin çuvalladığı 3 şey (Kısa madde)"],
        "strategy_advice": "Bu rakibi ezip geçmek için bana (işletme sahibine) 2 cümlelik kurnazca bir tavsiye ver."
    }}
    """
    try:
        raw_text = model.generate_content(prompt).text
        return json.loads(clean_json_response(raw_text))
    except:
        return {
            "summary": {"happiness_score": 50, "customer_loyalty": "Bilinmiyor", "price_perception": "Bilinmiyor"},
            "strengths": ["Veri Yetersiz"],
            "weaknesses": ["Veri Yetersiz"],
            "strategy_advice": "Analiz sırasında bir hata oluştu."
        }