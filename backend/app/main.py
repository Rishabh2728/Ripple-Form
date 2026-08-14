import logging
import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import (
    auth_router, form_router, question_router,
    public_router, response_router, template_router, ai_router
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ripple")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Ripple API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An internal server error occurred."}}
    )

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
