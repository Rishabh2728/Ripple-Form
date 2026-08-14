import logging
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException, RequestValidationError
from sqlalchemy import select
from app.core.config import settings
from app.db.session import engine, Base, AsyncSessionLocal
from app.models.models import User
from app.api import (
    auth_router, form_router, question_router,
    public_router, response_router, template_router, ai_router
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ripple")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables exist on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Automatically seed demo user & demo forms if demo@ripple.com doesn't exist
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(User).where(User.email == "demo@ripple.com")
            res = await db.execute(stmt)
            if not res.scalar_one_or_none():
                logger.info("Demo user demo@ripple.com missing. Executing auto-seeder...")
                from seed import seed_database
                await seed_database()
    except Exception as e:
        logger.error(f"Error checking/seeding demo database: {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Ripple API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_observability_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"

    logger.info(f"[{request.method}] {request.url.path} -> {response.status_code} ({process_time * 1000:.2f}ms)")
    return response

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        content = exc.detail
    elif isinstance(exc.detail, dict):
        content = {"error": exc.detail}
    elif isinstance(exc.detail, str):
        content = {"error": {"code": "HTTP_ERROR", "message": exc.detail}}
    else:
        content = {"error": {"code": "HTTP_ERROR", "message": str(exc.detail)}}
    return JSONResponse(status_code=exc.status_code, content=content)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    issues = [f"{err['loc'][-1]}: {err['msg']}" for err in exc.errors()]
    msg = issues[0] if issues else "Invalid request payload."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": "VALIDATION_ERROR", "message": msg, "issues": issues}}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An internal server error occurred."}}
    )

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Ripple API Service. Interactive docs available at /docs"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "Ripple Backend", "version": "1.0.0"}

app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(form_router.router, prefix=settings.API_V1_STR)
app.include_router(question_router.router, prefix=settings.API_V1_STR)
app.include_router(public_router.router, prefix=settings.API_V1_STR)
app.include_router(response_router.router, prefix=settings.API_V1_STR)
app.include_router(template_router.router, prefix=settings.API_V1_STR)
app.include_router(ai_router.router, prefix=settings.API_V1_STR)
