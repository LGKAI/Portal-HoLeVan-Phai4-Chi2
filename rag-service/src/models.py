from pydantic import BaseModel
from typing import Optional, List, Dict

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    conversation_history: Optional[List[Dict]] = []

class IngestRequest(BaseModel):
    content: str
    metadata: Dict = {}
    doc_id: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
