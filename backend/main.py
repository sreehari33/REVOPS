from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
import io
import xlsxwriter
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRole:
    OWNER = "owner"
    MANAGER = "manager"

class JobStatus:
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    WAITING_PARTS = "waiting_for_parts"
    COMPLETED = "completed"
    DELIVERED = "delivered"
    CREDIT_PENDING = "credit_pending"
    CLOSED = "closed"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    role: str
    invite_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class WorkshopCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: str
    gst_number: Optional[str] = None

class WorkshopUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    gst_number: Optional[str] = None
    currency: Optional[str] = None  

class JobCreate(BaseModel):
    customer_name: str
    phone: str
    car_model: str
    vehicle_number: str
    work_description: str
    estimated_amount: float
    advance_paid: float = 0.0
    planned_completion_days: int
    address: Optional[str] = None
    parts_required: Optional[str] = None
    worker_assigned: Optional[str] = None
    internal_notes: Optional[str] = None

class JobUpdate(BaseModel):
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    car_model: Optional[str] = None
    vehicle_number: Optional[str] = None
    work_description: Optional[str] = None
    estimated_amount: Optional[float] = None
    advance_paid: Optional[float] = None
    planned_completion_days: Optional[int] = None
    address: Optional[str] = None
    parts_required: Optional[str] = None
    worker_assigned: Optional[str] = None
    internal_notes: Optional[str] = None
    status: Optional[str] = None

class PaymentCreate(BaseModel):
    job_id: str
    amount: float
    payment_type: str
    notes: Optional[str] = None

class SettlementCreate(BaseModel):
    amount: float
    job_ids: List[str]
    notes: Optional[str] = None

# ============ AUTH UTILITIES ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user_data.role not in [UserRole.OWNER, UserRole.MANAGER]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user_id = str(uuid.uuid4())
    workshop_id = None
    
    # If manager, validate invite code
    if user_data.role == UserRole.MANAGER:
        if not user_data.invite_code:
            raise HTTPException(status_code=400, detail="Invite code required for managers")
        
        invite = await db.invite_codes.find_one(
            {"code": user_data.invite_code, "is_active": True, "used_by": None},
            {"_id": 0}
        )
        if not invite:
            raise HTTPException(status_code=400, detail="Invalid or expired invite code")
        
        workshop_id = invite["workshop_id"]
        
        # Mark invite code as used
        await db.invite_codes.update_one(
            {"code": user_data.invite_code},
            {"$set": {"used_by": user_id, "used_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Create manager record
        await db.managers.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "workshop_id": workshop_id,
            "joined_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "permissions": {}
        })
    
    # Create user
    user = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Create access token
    token = create_access_token({"sub": user_id, "email": user_data.email, "role": user_data.role})
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role,
            "workshop_id": workshop_id
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    workshop_id = None
    if user["role"] == UserRole.MANAGER:
        manager = await db.managers.find_one({"user_id": user["id"], "is_active": True}, {"_id": 0})
        if manager:
            workshop_id = manager["workshop_id"]
    elif user["role"] == UserRole.OWNER:
        workshop = await db.workshops.find_one({"owner_id": user["id"]}, {"_id": 0})
        if workshop:
            workshop_id = workshop["id"]
    
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "workshop_id": workshop_id
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    workshop_id = None
    if current_user["role"] == UserRole.MANAGER:
        manager = await db.managers.find_one({"user_id": current_user["id"], "is_active": True}, {"_id": 0})
        if manager:
            workshop_id = manager["workshop_id"]
    elif current_user["role"] == UserRole.OWNER:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if workshop:
            workshop_id = workshop["id"]
    
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "workshop_id": workshop_id
    }

# ============ WORKSHOP ROUTES ============

@api_router.post("/workshops")
async def create_workshop(workshop_data: WorkshopCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can create workshops")
    
    # Check if owner already has a workshop
    existing = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="You already have a workshop")
    
    workshop = {
        "id": str(uuid.uuid4()),
        "owner_id": current_user["id"],
        "name": workshop_data.name,
        "address": workshop_data.address,
        "phone": workshop_data.phone,
        "gst_number": workshop_data.gst_number,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.workshops.insert_one(workshop)
    
    return {"id": workshop["id"], **workshop_data.model_dump()}

@api_router.get("/workshops/me")
async def get_my_workshop(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.OWNER:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    else:
        manager = await db.managers.find_one({"user_id": current_user["id"], "is_active": True}, {"_id": 0})
        if not manager:
            raise HTTPException(status_code=404, detail="Manager record not found")
        workshop = await db.workshops.find_one({"id": manager["workshop_id"]}, {"_id": 0})
    
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop

@api_router.put("/workshops/{workshop_id}")
async def update_workshop(workshop_id: str, workshop_data: WorkshopUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can update workshops")
    
    workshop = await db.workshops.find_one({"id": workshop_id, "owner_id": current_user["id"]}, {"_id": 0})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    update_data = {k: v for k, v in workshop_data.model_dump().items() if v is not None}
    if update_data:
        await db.workshops.update_one({"id": workshop_id}, {"$set": update_data})
    
    return {"message": "Workshop updated successfully"}

@api_router.post("/workshops/{workshop_id}/invite-codes")
async def create_invite_code(workshop_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can create invite codes")
    
    workshop = await db.workshops.find_one({"id": workshop_id, "owner_id": current_user["id"]}, {"_id": 0})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    code = str(uuid.uuid4())[:8].upper()
    invite = {
        "id": str(uuid.uuid4()),
        "code": code,
        "workshop_id": workshop_id,
        "created_by": current_user["id"],
        "is_active": True,
        "used_by": None,
        "used_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.invite_codes.insert_one(invite)
    
    return {"code": code, "created_at": invite["created_at"]}

@api_router.get("/workshops/{workshop_id}/invite-codes")
async def get_invite_codes(workshop_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can view invite codes")
    
    codes = await db.invite_codes.find({"workshop_id": workshop_id}, {"_id": 0}).to_list(1000)
    return codes

# ============ MANAGER ROUTES ============

@api_router.get("/managers")
async def get_managers(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can view managers")
    
    workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if not workshop:
        # Return empty list if no workshop yet
        return []
    
    managers = await db.managers.find({"workshop_id": workshop["id"], "is_active": True}, {"_id": 0}).to_list(1000)
    
    # Enrich with user data
    for manager in managers:
        user = await db.users.find_one({"id": manager["user_id"]}, {"_id": 0, "password_hash": 0})
        if user:
            manager["user"] = user
    
    return managers

@api_router.delete("/managers/{manager_id}")
async def remove_manager(manager_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can remove managers")
    
    workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    result = await db.managers.update_one(
        {"id": manager_id, "workshop_id": workshop["id"]},
        {"$set": {"is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    return {"message": "Manager removed successfully"}

# ============ JOB ROUTES ============

@api_router.post("/jobs")
async def create_job(job_data: JobCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can create jobs")
    
    manager = await db.managers.find_one({"user_id": current_user["id"], "is_active": True}, {"_id": 0})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager record not found")
    
    job = {
        "id": str(uuid.uuid4()),
        "workshop_id": manager["workshop_id"],
        "manager_id": current_user["id"],
        **job_data.model_dump(),
        "status": JobStatus.PENDING,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }
    await db.jobs.insert_one(job)
    
    # Create job update
    await db.job_updates.insert_one({
        "id": str(uuid.uuid4()),
        "job_id": job["id"],
        "updated_by": current_user["id"],
        "update_type": "created",
        "description": "Job created",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"id": job["id"], "message": "Job created successfully"}

@api_router.get("/jobs")
async def get_jobs(
    status: Optional[str] = None,
    manager_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if current_user["role"] == UserRole.MANAGER:
        manager = await db.managers.find_one({"user_id": current_user["id"], "is_active": True}, {"_id": 0})
        if not manager:
            raise HTTPException(status_code=404, detail="Manager record not found")
        query["workshop_id"] = manager["workshop_id"]
        query["manager_id"] = current_user["id"]
    else:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if not workshop:
            raise HTTPException(status_code=404, detail="Workshop not found")
        query["workshop_id"] = workshop["id"]
        if manager_id:
            query["manager_id"] = manager_id
    
    if status:
        query["status"] = status
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(10000)
    
    # Enrich with manager data
    for job in jobs:
        manager_user = await db.users.find_one({"id": job["manager_id"]}, {"_id": 0, "password_hash": 0})
        if manager_user:
            job["manager_name"] = manager_user["name"]
        
        # Calculate remaining amount
        payments = await db.payments.find({"job_id": job["id"]}, {"_id": 0}).to_list(1000)
        total_paid = sum(p["amount"] for p in payments)
        job["total_paid"] = total_paid
        job["remaining_amount"] = job["estimated_amount"] - total_paid
    
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check access
    if current_user["role"] == UserRole.MANAGER:
        if job["manager_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if not workshop or job["workshop_id"] != workshop["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get payments
    payments = await db.payments.find({"job_id": job_id}, {"_id": 0}).to_list(1000)
    total_paid = sum(p["amount"] for p in payments)
    
    # Get updates
    updates = await db.job_updates.find({"job_id": job_id}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    job["payments"] = payments
    job["total_paid"] = total_paid
    job["remaining_amount"] = job["estimated_amount"] - total_paid
    job["updates"] = updates
    
    return job

@api_router.put("/jobs/{job_id}")
async def update_job(job_id: str, job_data: JobUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.MANAGER:
        job = await db.jobs.find_one({"id": job_id, "manager_id": current_user["id"]}, {"_id": 0})
    else:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if not workshop:
            raise HTTPException(status_code=404, detail="Workshop not found")
        job = await db.jobs.find_one({"id": job_id, "workshop_id": workshop["id"]}, {"_id": 0})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = {k: v for k, v in job_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if job_data.status and job_data.status in [JobStatus.COMPLETED, JobStatus.DELIVERED, JobStatus.CLOSED]:
        if not job.get("completed_at"):
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    if update_data:
        await db.jobs.update_one({"id": job_id}, {"$set": update_data})
        
        # Create update record
        await db.job_updates.insert_one({
            "id": str(uuid.uuid4()),
            "job_id": job_id,
            "updated_by": current_user["id"],
            "update_type": "modified",
            "description": f"Job updated: {', '.join(update_data.keys())}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Job updated successfully"}

# ============ PAYMENT ROUTES ============

@api_router.post("/payments")
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.MANAGER:
        job = await db.jobs.find_one({"id": payment_data.job_id, "manager_id": current_user["id"]}, {"_id": 0})
    else:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if not workshop:
            raise HTTPException(status_code=404, detail="Workshop not found")
        job = await db.jobs.find_one({"id": payment_data.job_id, "workshop_id": workshop["id"]}, {"_id": 0})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    payment = {
        "id": str(uuid.uuid4()),
        "job_id": payment_data.job_id,
        "amount": payment_data.amount,
        "payment_type": payment_data.payment_type,
        "notes": payment_data.notes,
        "collected_by_manager_id": current_user["id"],
        "confirmed_by_owner": False,
        "payment_date": datetime.now(timezone.utc).isoformat(),
        "confirmation_date": None
    }
    await db.payments.insert_one(payment)
    
    # Create job update
    await db.job_updates.insert_one({
        "id": str(uuid.uuid4()),
        "job_id": payment_data.job_id,
        "updated_by": current_user["id"],
        "update_type": "payment",
        "description": f"Payment of ₹{payment_data.amount} recorded",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"id": payment["id"], "message": "Payment recorded successfully"}

@api_router.get("/payments")
async def get_payments(
    job_id: Optional[str] = None,
    confirmed: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if job_id:
        query["job_id"] = job_id
    
    if confirmed is not None:
        query["confirmed_by_owner"] = confirmed
    
    if current_user["role"] == UserRole.MANAGER:
        query["collected_by_manager_id"] = current_user["id"]
    else:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if not workshop:
            # Return empty list if no workshop yet
            return []
        
        # Get all payments for this workshop's jobs
        jobs = await db.jobs.find({"workshop_id": workshop["id"]}, {"_id": 0, "id": 1}).to_list(10000)
        job_ids = [j["id"] for j in jobs]
        query["job_id"] = {"$in": job_ids}
    
    payments = await db.payments.find(query, {"_id": 0}).sort("payment_date", -1).to_list(10000)
    
    # Enrich with job and manager data
    for payment in payments:
        job = await db.jobs.find_one({"id": payment["job_id"]}, {"_id": 0})
        if job:
            payment["job"] = {
                "customer_name": job["customer_name"],
                "vehicle_number": job["vehicle_number"]
            }
        
        manager = await db.users.find_one({"id": payment["collected_by_manager_id"]}, {"_id": 0, "password_hash": 0})
        if manager:
            payment["manager_name"] = manager["name"]
    
    return payments

@api_router.put("/payments/{payment_id}/confirm")
async def confirm_payment(payment_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can confirm payments")
    
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verify payment belongs to owner's workshop
    job = await db.jobs.find_one({"id": payment["job_id"]}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if not workshop or job["workshop_id"] != workshop["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {
            "confirmed_by_owner": True,
            "confirmation_date": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Payment confirmed successfully"}

# ============ SETTLEMENT ROUTES ============

@api_router.post("/settlements")
async def create_settlement(settlement_data: SettlementCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can submit settlements")
    
    manager = await db.managers.find_one({"user_id": current_user["id"], "is_active": True}, {"_id": 0})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager record not found")
    
    settlement = {
        "id": str(uuid.uuid4()),
        "manager_id": current_user["id"],
        "workshop_id": manager["workshop_id"],
        "amount": settlement_data.amount,
        "job_ids": settlement_data.job_ids,
        "notes": settlement_data.notes,
        "submitted_date": datetime.now(timezone.utc).isoformat(),
        "confirmed_by_owner": False,
        "confirmation_date": None
    }
    await db.settlements.insert_one(settlement)
    
    return {"id": settlement["id"], "message": "Settlement submitted successfully"}

@api_router.get("/settlements")
async def get_settlements(
    confirmed: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if confirmed is not None:
        query["confirmed_by_owner"] = confirmed
    
    if current_user["role"] == UserRole.MANAGER:
        query["manager_id"] = current_user["id"]
    else:
        workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
        if not workshop:
            # Return empty list if no workshop yet
            return []
        query["workshop_id"] = workshop["id"]
    
    settlements = await db.settlements.find(query, {"_id": 0}).sort("submitted_date", -1).to_list(10000)
    
    # Enrich with manager data
    for settlement in settlements:
        manager = await db.users.find_one({"id": settlement["manager_id"]}, {"_id": 0, "password_hash": 0})
        if manager:
            settlement["manager_name"] = manager["name"]
    
    return settlements

@api_router.put("/settlements/{settlement_id}/confirm")
async def confirm_settlement(settlement_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can confirm settlements")
    
    settlement = await db.settlements.find_one({"id": settlement_id}, {"_id": 0})
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    
    workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if not workshop or settlement["workshop_id"] != workshop["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.settlements.update_one(
        {"id": settlement_id},
        {"$set": {
            "confirmed_by_owner": True,
            "confirmation_date": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Settlement confirmed successfully"}

# ============ ANALYTICS ROUTES ============

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can view analytics")
    
    workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if not workshop:
        # Return empty analytics if no workshop yet
        return {
            "total_jobs": 0,
            "total_revenue": 0,
            "total_collected": 0,
            "total_credits": 0,
            "avg_job_value": 0,
            "status_counts": {},
            "manager_revenue": {},
            "daily_revenue": {}
        }
    
    # Get all jobs
    jobs = await db.jobs.find({"workshop_id": workshop["id"]}, {"_id": 0}).to_list(100000)
    
    # Calculate metrics
    total_jobs = len(jobs)
    total_revenue = sum(j["estimated_amount"] for j in jobs)
    
    # Get all payments
    job_ids = [j["id"] for j in jobs]
    payments = await db.payments.find({"job_id": {"$in": job_ids}}, {"_id": 0}).to_list(100000)
    total_collected = sum(p["amount"] for p in payments)
    
    # Outstanding credits
    total_credits = total_revenue - total_collected
    
    # Jobs by status
    status_counts = {}
    for job in jobs:
        status = job["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Revenue by manager
    manager_revenue = {}
    for job in jobs:
        manager_id = job["manager_id"]
        if manager_id not in manager_revenue:
            manager_revenue[manager_id] = {"total": 0, "jobs": 0}
        manager_revenue[manager_id]["total"] += job["estimated_amount"]
        manager_revenue[manager_id]["jobs"] += 1
    
    # Daily revenue (last 30 days)
    now = datetime.now(timezone.utc)
    daily_revenue = {}
    for i in range(30):
        date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_revenue[date] = 0
    
    for job in jobs:
        created = datetime.fromisoformat(job["created_at"])
        date = created.strftime("%Y-%m-%d")
        if date in daily_revenue:
            daily_revenue[date] += job["estimated_amount"]
    
    return {
        "total_jobs": total_jobs,
        "total_revenue": total_revenue,
        "total_collected": total_collected,
        "total_credits": total_credits,
        "avg_job_value": total_revenue / total_jobs if total_jobs > 0 else 0,
        "status_counts": status_counts,
        "manager_revenue": manager_revenue,
        "daily_revenue": daily_revenue
    }

@api_router.get("/analytics/export")
async def export_data(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can export data")
    
    workshop = await db.workshops.find_one({"owner_id": current_user["id"]}, {"_id": 0})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    # Get all jobs
    jobs = await db.jobs.find({"workshop_id": workshop["id"]}, {"_id": 0}).to_list(100000)
    
    # Create Excel file
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)
    worksheet = workbook.add_worksheet("Jobs")
    
    # Headers
    headers = [
        "Job ID", "Customer Name", "Phone", "Vehicle Number", "Car Model",
        "Work Description", "Estimated Amount", "Advance Paid", "Status",
        "Created At", "Completed At"
    ]
    
    for col, header in enumerate(headers):
        worksheet.write(0, col, header)
    
    # Data
    for row, job in enumerate(jobs, start=1):
        worksheet.write(row, 0, job["id"])
        worksheet.write(row, 1, job["customer_name"])
        worksheet.write(row, 2, job["phone"])
        worksheet.write(row, 3, job["vehicle_number"])
        worksheet.write(row, 4, job["car_model"])
        worksheet.write(row, 5, job["work_description"])
        worksheet.write(row, 6, job["estimated_amount"])
        worksheet.write(row, 7, job["advance_paid"])
        worksheet.write(row, 8, job["status"])
        worksheet.write(row, 9, job["created_at"])
        worksheet.write(row, 10, job.get("completed_at", ""))
    
    workbook.close()
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=jobs_export.xlsx"}
    )

# ============ DOCUMENT ROUTES ============

@api_router.get("/documents/job-card/{job_id}")
async def generate_job_card(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    workshop_data = await db.workshops.find_one({"id": job["workshop_id"]}, {"_id": 0})
    currency_symbol = workshop_data.get('currency', 'INR') if workshop_data else 'INR'
    # Create PDF
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(1*inch, height - 1*inch, "JOB CARD")
    
    # Job details
    pdf.setFont("Helvetica", 12)
    y = height - 1.5*inch
    pdf.drawString(1*inch, y, f"Job ID: {job['id'][:8]}")
    y -= 0.3*inch
    pdf.drawString(1*inch, y, f"Customer: {job['customer_name']}")
    y -= 0.3*inch
    pdf.drawString(1*inch, y, f"Phone: {job['phone']}")
    y -= 0.3*inch
    pdf.drawString(1*inch, y, f"Vehicle: {job['car_model']} - {job['vehicle_number']}")
    y -= 0.3*inch
    pdf.drawString(1*inch, y, f"Work: {job['work_description']}")
    y -= 0.3*inch
   currency_symbol = workshop_data.get('currency', 'INR') if workshop_data else 'INR'
    pdf.drawString(1*inch, y, f"Estimated Amount: {currency_symbol} {job['estimated_amount']}")
    y -= 0.3*inch
    pdf.drawString(1*inch, y, f"Advance Paid: {currency_symbol} {job['advance_paid']}")

    y -= 0.3*inch
    pdf.drawString(1*inch, y, f"Status: {job['status']}")
    
    pdf.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=job_card_{job_id[:8]}.pdf"}
    )

@api_router.get("/documents/invoice/{job_id}")
async def generate_invoice(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    workshop = await db.workshops.find_one({"id": job["workshop_id"]}, {"_id": 0})
    
    # Get payments
    payments = await db.payments.find({"job_id": job_id}, {"_id": 0}).to_list(1000)
    total_paid = sum(p["amount"] for p in payments)
    
    # Create PDF
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(1*inch, height - 1*inch, "INVOICE")
    
    # Workshop details
    pdf.setFont("Helvetica", 10)
    y = height - 1.3*inch
    pdf.drawString(1*inch, y, workshop["name"])
    y -= 0.2*inch
    if workshop.get("address"):
        pdf.drawString(1*inch, y, workshop["address"])
        y -= 0.2*inch
    if workshop.get("gst_number"):
        pdf.drawString(1*inch, y, f"GST: {workshop['gst_number']}")
        y -= 0.2*inch
    
    # Customer details
    y -= 0.3*inch
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(1*inch, y, "Bill To:")
    y -= 0.2*inch
    pdf.setFont("Helvetica", 10)
    pdf.drawString(1*inch, y, job["customer_name"])
    y -= 0.2*inch
    pdf.drawString(1*inch, y, job["phone"])
    
    # Job details
    y -= 0.5*inch
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(1*inch, y, "Service Details")
    y -= 0.3*inch
    pdf.setFont("Helvetica", 10)
    pdf.drawString(1*inch, y, f"Vehicle: {job['car_model']} - {job['vehicle_number']}")
    y -= 0.2*inch
    pdf.drawString(1*inch, y, f"Work: {job['work_description']}")
    
    # Amount details
    y -= 0.5*inch
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(1*inch, y, "Amount Details")
    y -= 0.3*inch
    pdf.setFont("Helvetica", 10)
    inv_currency = workshop.get('currency', 'INR') if workshop else 'INR'
    pdf.drawString(1*inch, y, f"Total Amount: {inv_currency} {job['estimated_amount']}")
    y -= 0.2*inch
    pdf.drawString(1*inch, y, f"Paid: {inv_currency} {total_paid}")
    y -= 0.2*inch
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(1*inch, y, f"Balance: {inv_currency} {job['estimated_amount'] - total_paid}")
    
    pdf.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{job_id[:8]}.pdf"}
    )

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
