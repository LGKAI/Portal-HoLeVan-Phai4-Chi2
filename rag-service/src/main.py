import os
import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from models import ChatRequest, IngestRequest
from rag_pipeline import RAGPipeline
from langchain_core.documents import Document
import ingest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Khởi tạo toàn cục cho pipeline
pipeline = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    global pipeline
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    os.makedirs(settings.RAW_DOCS_DIR, exist_ok=True)
    
    try:
        pipeline = RAGPipeline()
        logger.info("RAG Pipeline khởi tạo thành công")
        try:
            doc_count = pipeline.vector_store._collection.count()
            if doc_count == 0:
                logger.info("Vector store đang trống. Tự động nạp tài liệu từ raw_documents...")
                ingest.ingest_all_raw_documents(pipeline)
            else:
                logger.info(f"Vector store hiện có {doc_count} tài liệu.")
        except Exception as err:
            logger.warning(f"Không thể kiểm tra hoặc tự nạp tài liệu: {err}")
    except Exception as e:
        logger.warning(f"Ollama/LLM chưa sẵn sàng hoặc có lỗi khi khởi tạo RAG Pipeline: {e}")
        # Vẫn cho phép server start, các request sẽ handle lỗi sau
    
    yield
    # Teardown
    pipeline = None

app = FastAPI(title="RAG Service Họ Lê Văn", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    status = "healthy" if pipeline else "degraded"
    return {"status": status, "service": "rag-service"}

@app.post("/chat")
async def chat(request: ChatRequest):
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline chưa sẵn sàng")
        
    async def generate():
        async for chunk in pipeline.query(request.message, request.conversation_history):
            yield f'data: {json.dumps({"chunk": chunk}, ensure_ascii=False)}\n\n'
        yield 'data: [DONE]\n\n'
        
    return StreamingResponse(generate(), media_type='text/event-stream')

@app.post("/chat/sync")
async def chat_sync(request: ChatRequest):
    """Endpoint trả về phản hồi dạng JSON đồng bộ cho Frontend / Backend"""
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline chưa sẵn sàng")
        
    chunks = []
    async for chunk in pipeline.query(request.message, request.conversation_history):
        chunks.append(chunk)
    return {"reply": "".join(chunks)}

@app.post("/ingest/raw-documents")
async def ingest_raw_documents_route():
    """Nạp thủ công toàn bộ file trong thư mục raw_documents vào vector store"""
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline chưa sẵn sàng")
        
    count = ingest.ingest_all_raw_documents(pipeline)
    return {"success": True, "count": count}


@app.post("/ingest")
async def ingest_document(request: IngestRequest):
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline chưa sẵn sàng")
        
    doc = Document(page_content=request.content, metadata=request.metadata)
    pipeline.add_documents([doc])
    return {"success": True, "message": "Đã nạp tài liệu thành công"}

@app.post("/ingest/members")
async def ingest_members_route():
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline chưa sẵn sàng")
        
    count = await ingest.ingest_members_from_backend(pipeline)
    return {"success": True, "count": count}

@app.get("/stats")
async def get_stats():
    if not pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline chưa sẵn sàng")
        
    try:
        collection = pipeline.vector_store._collection
        count = collection.count()
        return {"documents_count": count}
    except Exception as e:
        logger.error(f"Lỗi khi lấy stats: {e}")
        return {"documents_count": 0, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
