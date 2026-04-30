# backend/main.py - SECURE PRODUCTION READY
from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
import datetime
import uuid
import random
import requests
import json
import string
import os
from dotenv import load_dotenv

# AI Motorunu dahil et
from ai_engine import generate_analysis, analyze_competitor_deep, consult_business_ai, ai_reply_gen

# --- ENV YÜKLEME VE KASADAN ŞİFRE ÇEKME ---
load_dotenv()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Local ve Canlı Vercel Adreslerini Güvenli CORS İçin Listeliyoruz
FRONTEND_URLS = [
    "http://localhost:5173",
    "https://yanitliyor.com.tr",
    "https://www.yanitliyor.com.tr",
    "https://yanitliyor-projesi.vercel.app",
]

# --- DB AYARLARI ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./yanitliyor.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELLER ---
class AuthReq(BaseModel): email: str; password: str
class GoogleAuthReq(BaseModel): access_token: str
class SetupReq(BaseModel): token: str; business_name: str; place_id: str; location_id: str; sector: str; kvkk_accepted: bool; has_gmb: bool = False
class PaymentReq(BaseModel): card_number: str; duration_months: int; package_type: int
class SearchReq(BaseModel): query: str
class AnalyzeReq(BaseModel): place_id: str; name: str; force_update: bool = False
class ChatReq(BaseModel): message: str
class SetUpd(BaseModel): name: str; sector: str; tone: str

# --- TABLOLAR ---
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    token = Column(String, unique=True)
    google_id = Column(String, nullable=True)
    google_access_token = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_setup_complete = Column(Boolean, default=False)
    kvkk_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    businesses = relationship("BusinessDB", back_populates="owner")
    analysis_logs = relationship("AnalysisLogDB", back_populates="user")

class BusinessDB(Base):
    __tablename__ = "businesses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    sector = Column(String, default="Genel")
    google_place_id = Column(String)
    google_location_id = Column(String, nullable=True)
    active_tone = Column(String, default="Empatik ve Profesyonel")
    membership_tier = Column(Integer, default=0)
    package_name = Column(String, default="Deneme Sürümü")
    membership_start = Column(DateTime, default=datetime.datetime.utcnow)
    membership_end = Column(DateTime, nullable=True)
    monthly_quota = Column(Integer, default=5)
    current_usage = Column(Integer, default=0)
    has_gmb = Column(Boolean, default=False)  # Google Business hesabı var mı
    competitor_used_today = Column(Integer, default=0)  # Bugün kaç rakip analizi yapıldı
    competitor_last_used_date = Column(String, nullable=True)  # Son kullanım tarihi
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("UserDB", back_populates="businesses")
    reviews = relationship("ReviewDB", back_populates="business")
    competitors = relationship("CompetitorDB", back_populates="business")

class ReviewDB(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    customer_name = Column(String)
    customer_avatar = Column(String)
    review_image = Column(String, nullable=True)
    rating = Column(Integer)
    comment = Column(String)
    date = Column(String)
    status = Column(String, default="pending")
    ai_reply = Column(String, nullable=True)
    is_historical = Column(Boolean, default=False)
    google_review_id = Column(String, nullable=True)
    business = relationship("BusinessDB", back_populates="reviews")

class CompetitorDB(Base):
    __tablename__ = "competitors"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    name = Column(String)
    avg_rating = Column(Float)
    strength = Column(String)
    weakness = Column(String)
    business = relationship("BusinessDB", back_populates="competitors")

class AnalysisLogDB(Base):
    __tablename__ = "analysis_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    competitor_name = Column(String)
    place_id = Column(String)
    analysis_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("UserDB", back_populates="analysis_logs")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_from_token(x_token: str = Header(None), db: Session = Depends(get_db)):
    if not x_token:
        raise HTTPException(status_code=401, detail="Token bulunamadı.")
    u = db.query(UserDB).filter(UserDB.token == x_token).first()
    if not u:
        raise HTTPException(status_code=401, detail="Geçersiz token.")
    if not u.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız engellenmiştir.")
    return u

def generate_auto_password():
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for i in range(10))

def check_access(user, db):
    if user.is_admin: return "active"
    bus = db.query(BusinessDB).filter(BusinessDB.owner_id == user.id).first()
    if not bus: return "no_business"
    # Deneme modunda her zaman erişim var
    if bus.membership_tier == 0: return "trial"
    if not bus.membership_end: return "active"
    now = datetime.datetime.utcnow()
    if now > bus.membership_end:
        grace_period_end = bus.membership_end + datetime.timedelta(days=1)
        if now > grace_period_end: return "expired"
        return "grace_period"
    return "active"

def check_competitor_limit(bus):
    """Rakip analizi limiti kontrolü. True = kullanabilir."""
    if bus.membership_tier == 0: return False, "Deneme modunda rakip analizi kullanılamaz."
    if bus.membership_tier >= 2: return True, "ok"  # Usta - sınırsız
    # Esnaf - günde 1
    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    if bus.competitor_last_used_date == today and bus.competitor_used_today >= 1:
        return False, "Esnaf paketinde rakip analizi günde 1 kez kullanılabilir."
    return True, "ok"

def use_competitor_quota(bus, db):
    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    if bus.competitor_last_used_date != today:
        bus.competitor_used_today = 0
        bus.competitor_last_used_date = today
    bus.competitor_used_today += 1
    db.commit()

def _review_to_dict(r):
    return {"id": r.id, "customer_name": r.customer_name, "customer_avatar": r.customer_avatar, "rating": r.rating, "comment": r.comment, "date": r.date, "status": r.status, "ai_reply": r.ai_reply, "is_historical": r.is_historical}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Otomatik migration - eksik kolonları ekle
    import sqlite3
    try:
        conn = sqlite3.connect('yanitliyor.db')
        migrations = [
            'ALTER TABLE businesses ADD COLUMN has_gmb BOOLEAN DEFAULT 0',
            'ALTER TABLE businesses ADD COLUMN competitor_used_today INTEGER DEFAULT 0',
            'ALTER TABLE businesses ADD COLUMN competitor_last_used_date TEXT',
            'ALTER TABLE users ADD COLUMN google_access_token TEXT',
            'ALTER TABLE reviews ADD COLUMN google_review_id TEXT',
        ]
        for sql in migrations:
            try: conn.execute(sql)
            except: pass
        conn.commit()
        conn.close()
    except: pass

    db = SessionLocal()
    try:
        admin_user = db.query(UserDB).filter(UserDB.email=="admin").first()
        if not admin_user:
            admin_password = os.getenv("ADMIN_PASSWORD", generate_auto_password())
            admin_token = os.getenv("ADMIN_TOKEN", str(uuid.uuid4()))
            u = UserDB(email="admin", password=admin_password, full_name="Sistem Yöneticisi", token=admin_token, is_admin=True, is_setup_complete=True, is_active=True)
            db.add(u); db.commit()
            b = BusinessDB(name="Yanıtlıyor Yönetim", sector="Teknoloji", google_place_id="ADMIN", owner_id=u.id, membership_tier=1, monthly_quota=9999, package_name="Sınırsız Admin")
            db.add(b); db.commit()
    finally: db.close()
    yield

app = FastAPI(lifespan=lifespan)

# CORS ayarı
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Google OAuth popup sorunu için COOP header'ı kaldır
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class COOPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cross-Origin-Opener-Policy"] = "unsafe-none"
        response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
        return response

app.add_middleware(COOPMiddleware)

# --- ENDPOINTS ---

@app.post("/api/auth/google-login")
def google_auth(d: GoogleAuthReq, db: Session = Depends(get_db)):
    try:
        user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json"
        headers = {"Authorization": f"Bearer {d.access_token}"}
        user_res = requests.get(user_info_url, headers=headers)
        if user_res.status_code != 200: raise HTTPException(status_code=401, detail="Google Token Geçersiz")

        user_data = user_res.json()
        email = user_data.get('email'); google_id = user_data.get('id'); full_name = user_data.get('name')

        u = db.query(UserDB).filter(UserDB.google_id == google_id).first()
        if not u:
            token = str(uuid.uuid4())
            u = UserDB(email=email, full_name=full_name, google_id=google_id, password=generate_auto_password(), token=token, is_setup_complete=False, google_access_token=d.access_token)
            db.add(u); db.commit()
            return {"status": "setup_needed", "token": token, "access_token": d.access_token}

        if not u.is_active: raise HTTPException(status_code=403, detail="Hesabınız engellenmiştir.")
        # Her girişte token'ı güncelle
        u.google_access_token = d.access_token
        db.commit()
        if not u.is_setup_complete: return {"status": "setup_needed", "token": u.token, "access_token": d.access_token}

        access_status = check_access(u, db)
        if access_status == "expired": return {"status": "payment_required", "token": u.token}
        return {"status": "success", "token": u.token, "name": u.full_name, "is_admin": u.is_admin}
    except HTTPException as he: raise he
    except Exception as e: raise HTTPException(status_code=401, detail="Sunucu ile bağlantı kurulamadı.")

@app.post("/api/auth/fetch-my-businesses")
def fetch_my_businesses(d: GoogleAuthReq):
    try:
        headers = {"Authorization": f"Bearer {d.access_token}"}
        accounts_url = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
        acc_res = requests.get(accounts_url, headers=headers)
        if acc_res.status_code != 200: return {"locations": []}

        accounts = acc_res.json().get('accounts', [])
        if not accounts: return {"locations": []}

        account_name = accounts[0]['name']
        locations_url = f"https://mybusinessbusinessinformation.googleapis.com/v1/{account_name}/locations?readMask=name,title,storeCode,metadata"
        loc_res = requests.get(locations_url, headers=headers)
        if loc_res.status_code != 200: return {"locations": []}

        locations = loc_res.json().get('locations', [])
        result = []
        for loc in locations:
            place_id = loc.get('metadata', {}).get('placeId', '')
            if place_id: result.append({"name": loc.get('title'), "place_id": place_id, "location_id": loc.get('name'), "address": "Google Hesabınızdaki İşletme"})
        return {"locations": result}
    except: return {"locations": []}

@app.post("/api/auth/setup")
def setup(d: SetupReq, db: Session = Depends(get_db)):
    try:
        u = db.query(UserDB).filter(UserDB.token == d.token).first()
        if not u: raise HTTPException(status_code=401, detail="Yetkisiz işlem.")
        if not d.kvkk_accepted: raise HTTPException(status_code=400, detail="Hizmet şartlarını onaylamalısınız.")
        if not d.place_id: raise HTTPException(status_code=400, detail="Lütfen işletme seçin.")

        u.full_name = d.business_name; u.kvkk_accepted = True; u.is_setup_complete = True
        trial_quota = 6 if d.has_gmb else 5  # GMB varsa 6, yoksa 5 yorum
        b = BusinessDB(name=d.business_name, sector=d.sector, google_place_id=d.place_id, google_location_id=d.location_id, owner_id=u.id, membership_tier=0, package_name="Deneme Sürümü", monthly_quota=trial_quota, has_gmb=d.has_gmb)
        db.add(b); db.commit()

        if GOOGLE_MAPS_API_KEY:
            url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={d.place_id}&fields=reviews,rating&key={GOOGLE_MAPS_API_KEY}&language=tr"
            res = requests.get(url).json()
            if res.get("status") == "OK":
                reviews = res.get("result", {}).get("reviews", [])
                for r in reviews:
                    c_text = r.get('text', '')
                    c_rating = r.get('rating', 5)
                    ai_draft = ai_reply_gen(c_text, c_rating, b.active_tone, b.name, b.sector) if c_text else ""
                    db.add(ReviewDB(business_id=b.id, customer_name=r.get('author_name', 'Müşteri'), customer_avatar=r.get('profile_photo_url', ''), rating=c_rating, comment=c_text, date=r.get('relative_time_description', ''), status="pending", ai_reply=ai_draft, is_historical=True, google_review_id=r.get('review_id', None)))
                db.commit()
        return {"status": "success"}
    except HTTPException as he: raise he
    except Exception as e: raise HTTPException(status_code=500, detail="Kurulum sırasında hata oluştu.")

@app.post("/api/auth/login")
def manual_login(d: AuthReq, db: Session = Depends(get_db)):
    u = db.query(UserDB).filter(UserDB.email == d.email).first()
    if u and u.password == d.password:
        if not u.is_active: raise HTTPException(status_code=403, detail="Hesabınız engellenmiştir.")
        if check_access(u, db) == "expired": return {"status": "payment_required", "token": u.token}
        return {"status": "success", "token": u.token, "name": u.full_name, "is_admin": u.is_admin}
    raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")

@app.get("/api/dashboard")
def dashboard(u: UserDB = Depends(get_user_from_token), db: Session = Depends(get_db)):
    access = check_access(u, db)
    if access == "no_business": raise HTTPException(status_code=401, detail="İşletmeniz bulunamadı.")
    if access == "expired": raise HTTPException(status_code=402, detail="Ödeme Gerekli")

    b = db.query(BusinessDB).filter(BusinessDB.owner_id==u.id).first()
    if not b: raise HTTPException(status_code=401, detail="İşletmeniz bulunamadı.")

    # Admin veya ücretli paket → tüm yorumlar, deneme → kısıtlı
    if u.is_admin or b.membership_tier > 0:
        revs = db.query(ReviewDB).filter(ReviewDB.business_id==b.id).order_by(ReviewDB.id.desc()).all()
    else:
        trial_limit = 6 if b.has_gmb else 5
        revs = db.query(ReviewDB).filter(ReviewDB.business_id==b.id).order_by(ReviewDB.id.desc()).limit(trial_limit).all()

    serialized_reviews = [_review_to_dict(r) for r in revs]
    pending_count = sum(1 for r in revs if r.status=="pending")
    analysis_data = generate_analysis(revs) if len(revs) > 0 else {"positives":["Veri Bekleniyor"],"negatives":[],"advice":"Paneldeki 'Canlı Veri Çek' butonunu kullanın."}

    competitor_ok = True if (u.is_admin or b.membership_tier >= 2) else (check_competitor_limit(b)[0] if b.membership_tier == 1 else False)
    return {
        "business": {
            "name": b.name, "tier": b.package_name,
            "membership_tier": b.membership_tier,
            "has_gmb": b.has_gmb,
            "email": u.email, "auto_password": u.password,
            "days_left": (b.membership_end - datetime.datetime.utcnow()).days if b.membership_end else 0,
            "quota_used": b.current_usage, "quota_limit": b.monthly_quota,
            "can_competitor": competitor_ok,
            "is_admin": u.is_admin
        },
        "stats": {"total": len(revs), "pending": pending_count, "analysis": analysis_data},
        "reviews": serialized_reviews
    }

@app.post("/api/business/fetch-reviews")
def fetch_reviews(u: UserDB = Depends(get_user_from_token), db: Session = Depends(get_db)):
    try:
        b = db.query(BusinessDB).filter(BusinessDB.owner_id==u.id).first()
        if not b.google_place_id or b.google_place_id == "DEV_MODE" or b.google_place_id == "ADMIN": return {"status": "success", "msg": "Geliştirici modunda yeni veri çekilmez."}
        if not GOOGLE_MAPS_API_KEY: raise HTTPException(status_code=500, detail="Sistemde Google Maps Anahtarı tanımlı değil.")

        url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={b.google_place_id}&fields=reviews,rating&key={GOOGLE_MAPS_API_KEY}&language=tr"
        res = requests.get(url).json()

        if res.get("status") == "OK":
            reviews = res.get("result", {}).get("reviews", [])
            count = 0
            for r in reviews:
                c_text = r.get('text', '')
                c_rating = r.get('rating', 5)
                exists = db.query(ReviewDB).filter(ReviewDB.business_id==b.id, ReviewDB.customer_name==r.get('author_name', ''), ReviewDB.comment==c_text).first()
                if not exists:
                    ai_draft = ai_reply_gen(c_text, c_rating, b.active_tone, b.name, b.sector) if c_text else ""
                    db.add(ReviewDB(business_id=b.id, customer_name=r.get('author_name', 'Müşteri'), customer_avatar=r.get('profile_photo_url', ''), rating=c_rating, comment=c_text, date=r.get('relative_time_description', ''), status="pending", ai_reply=ai_draft, is_historical=False, google_review_id=r.get('review_id', None)))
                    count += 1
            db.commit()
            return {"status": "success", "msg": f"{count} yeni yorum çekildi." if count > 0 else "Tüm yorumlar güncel."}
        else: raise HTTPException(status_code=500, detail="Google API yanıt vermedi.")
    except Exception as e: raise HTTPException(status_code=500, detail="Google sunucularına bağlanırken hata oluştu.")

@app.post("/api/payment/subscribe")
def subscribe(d: PaymentReq, u: UserDB = Depends(get_user_from_token), db: Session = Depends(get_db)):
    try:
        b = db.query(BusinessDB).filter(BusinessDB.owner_id==u.id).first()
        if d.package_type == 1:   # Esnaf 400tl
            b.package_name = "Esnaf Paketi"; b.monthly_quota = 50; b.membership_tier = 1
        elif d.package_type == 2:  # Usta 1000tl
            b.package_name = "Usta Paketi"; b.monthly_quota = 500; b.membership_tier = 2
        b.current_usage = 0
        now = datetime.datetime.utcnow()
        b.membership_end = (b.membership_end + datetime.timedelta(days=d.duration_months*30)) if b.membership_end and b.membership_end > now else (now + datetime.timedelta(days=d.duration_months*30))
        db.commit()
        return {"status": "success"}
    except: raise HTTPException(status_code=500, detail="Ödeme kaydedilemedi.")

@app.post("/api/competitor-analysis/search")
def search_places(req: SearchReq, u: UserDB = Depends(get_user_from_token)):
    try:
        if not GOOGLE_MAPS_API_KEY: raise HTTPException(status_code=500, detail="Sistemde Google Maps Anahtarı tanımlı değil.")
        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={req.query}&key={GOOGLE_MAPS_API_KEY}&language=tr"
        res = requests.get(url).json()
        return {"results": [{"place_id": r["place_id"], "name": r["name"], "rating": r.get("rating", 0), "address": r.get("formatted_address")} for r in res.get("results", [])]}
    except Exception as e: raise HTTPException(status_code=500, detail="Arama hatası")

@app.post("/api/competitor-analysis/analyze")
def analyze_competitor(req: AnalyzeReq, u: UserDB = Depends(get_user_from_token), db: Session = Depends(get_db)):
    try:
        access = check_access(u, db)
        if access == "expired": raise HTTPException(status_code=402, detail="Ödeme Gerekli")
        b = db.query(BusinessDB).filter(BusinessDB.owner_id==u.id).first()
        can_use, reason = check_competitor_limit(b)
        if not can_use: raise HTTPException(status_code=403, detail=reason)
        if not req.force_update:
            cached = db.query(AnalysisLogDB).filter(AnalysisLogDB.place_id==req.place_id).first()
            if cached: return json.loads(cached.analysis_json)

        reviews_text = ""
        url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={req.place_id}&fields=name,rating,reviews,user_ratings_total&key={GOOGLE_MAPS_API_KEY}&language=tr"
        res = requests.get(url).json()
        if res.get("status") == "OK": reviews_text = "\n".join([f"- {r.get('text', '')}" for r in res.get("result", {}).get("reviews", [])])

        use_competitor_quota(b, db)
        result = analyze_competitor_deep(req.name, 0, 0, reviews_text, b.sector if b else "Genel")

        db.add(AnalysisLogDB(user_id=u.id, competitor_name=req.name, place_id=req.place_id, analysis_json=json.dumps(result)))
        db.commit()
        return result
    except HTTPException as he: raise he
    except: raise HTTPException(status_code=500, detail="Analiz sırasında hata oluştu.")

@app.post("/api/reviews/{id}/action")
def action(id: int, action: str = Query(...), reply: str = Query(None), u: UserDB = Depends(get_user_from_token), db: Session = Depends(get_db)):
    try:
        r = db.query(ReviewDB).filter(ReviewDB.id == id).first()
        b = r.business
        if action == "approve":
            if b.membership_tier == 0 and not b.has_gmb:
                raise HTTPException(status_code=403, detail="Deneme modunda yorum onaylama yapılamaz. Paket alın.")
            if b.membership_tier == 0 and b.has_gmb:
                raise HTTPException(status_code=403, detail="Deneme modunda yorumları onaylayamazsınız. Paket alarak tüm özelliklere erişin.")
            if not r.is_historical:
                if b.current_usage >= b.monthly_quota: raise HTTPException(status_code=402, detail="Aylık yanıt kotanız dolmuştur.")
                b.current_usage += 1
            r.status = "approved"

            # Google Maps'e yanıt gönder
            gmb_result = "gmb_skipped"
            if b.has_gmb and b.google_location_id and r.google_review_id and u.google_access_token:
                try:
                    reply_text = reply if reply else r.ai_reply
                    gmb_url = f"https://mybusiness.googleapis.com/v4/{b.google_location_id}/reviews/{r.google_review_id}/reply"
                    gmb_res = requests.put(
                        gmb_url,
                        headers={"Authorization": f"Bearer {u.google_access_token}", "Content-Type": "application/json"},
                        json={"comment": reply_text}
                    )
                    gmb_result = "gmb_ok" if gmb_res.status_code == 200 else f"gmb_error_{gmb_res.status_code}"
                except Exception as e:
                    gmb_result = f"gmb_exception"

            db.commit()
            return {"ok": True, "gmb": gmb_result}

        elif action == "save_draft":
            r.status = "pending"; r.ai_reply = reply
        db.commit(); return {"ok": True}
    except HTTPException as he: raise he
    except: raise HTTPException(status_code=500, detail="İşlem başarısız.")

@app.post("/api/consultant/chat")
def chat(req: ChatReq, u: UserDB = Depends(get_user_from_token), db: Session = Depends(get_db)):
    try:
        b = db.query(BusinessDB).filter(BusinessDB.owner_id==u.id).first()
        revs = db.query(ReviewDB).filter(ReviewDB.business_id==b.id).limit(10).all()
        return {"reply": consult_business_ai(req.message, revs, [], b.sector)}
    except: raise HTTPException(status_code=500, detail="Sohbet hatası.")

@app.get("/api/admin/users")
def get_users(x_token: str = Header(None), db: Session = Depends(get_db)):
    u = db.query(UserDB).filter(UserDB.token==x_token).first()
    if not u or not u.is_admin: raise HTTPException(status_code=403, detail="Yetkisiz erişim.")
    result = []
    for us in db.query(UserDB).all():
        b = db.query(BusinessDB).filter(BusinessDB.owner_id==us.id).first()
        days_left = 0
        if b and b.membership_end:
            days_left = max(0, (b.membership_end - datetime.datetime.utcnow()).days)
        result.append({
            "id": us.id,
            "name": us.full_name,
            "email": us.email,
            "is_active": us.is_active,
            "is_admin": us.is_admin,
            "business_name": b.name if b else None,
            "has_gmb": b.has_gmb if b else False,
            "membership_tier": b.membership_tier if b else 0,
            "package_name": b.package_name if b else "Deneme",
            "quota_used": b.current_usage if b else 0,
            "quota_limit": b.monthly_quota if b else 0,
            "days_left": days_left,
        })
    return result

@app.post("/api/admin/toggle-user/{uid}")
def toggle(uid: int, x_token: str = Header(None), db: Session = Depends(get_db)):
    u = db.query(UserDB).filter(UserDB.token==x_token).first()
    if not u or not u.is_admin: raise HTTPException(status_code=403, detail="Yetkisiz erişim.")
    t = db.query(UserDB).filter(UserDB.id==uid).first()
    if t and t.id != u.id: t.is_active = not t.is_active; db.commit()
    return {"ok": True}

@app.get("/api/admin/migrate-db")
def migrate_db():
    """Geçici: DB kolonlarını güncelle"""
    import sqlite3
    conn = sqlite3.connect('yanitliyor.db')
    results = []
    migrations = [
        ('ALTER TABLE businesses ADD COLUMN has_gmb BOOLEAN DEFAULT 0', 'has_gmb'),
        ('ALTER TABLE businesses ADD COLUMN competitor_used_today INTEGER DEFAULT 0', 'competitor_used_today'),
        ('ALTER TABLE businesses ADD COLUMN competitor_last_used_date TEXT', 'competitor_last_used_date'),
        ('ALTER TABLE users ADD COLUMN google_access_token TEXT', 'google_access_token'),
        ('ALTER TABLE reviews ADD COLUMN google_review_id TEXT', 'google_review_id'),
    ]
    for sql, name in migrations:
        try:
            conn.execute(sql)
            results.append(f"{name}: eklendi")
        except:
            results.append(f"{name}: zaten var")
    conn.commit()
    conn.close()
    return {"results": results, "status": "tamam"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)