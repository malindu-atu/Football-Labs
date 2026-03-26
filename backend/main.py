from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import coaches, sessions, kids, attendance, notifications, analytics, auth

app = FastAPI(title="Soccer Academy Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(coaches.router, prefix="/api/coaches", tags=["Coaches"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(kids.router, prefix="/api/kids", tags=["Kids"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Soccer Academy API is running"}