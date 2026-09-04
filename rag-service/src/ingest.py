import os
import httpx
import logging
from typing import List
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import settings

logger = logging.getLogger(__name__)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    length_function=len
)

def ingest_text_file(file_path: str) -> List[Document]:
    """Đọc file text hoặc markdown và chia nhỏ thành các đoạn document"""
    if not os.path.exists(file_path):
        logger.error(f"Không tìm thấy file: {file_path}")
        return []
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        docs = text_splitter.create_documents([content], metadatas=[{"source": file_path}])
        return docs
    except Exception as e:
        logger.error(f"Lỗi khi đọc file {file_path}: {e}")
        return []

def ingest_from_dict(data: dict) -> Document:
    """Chuyển đổi dictionary thành Document"""
    content = data.get("content", "")
    metadata = data.get("metadata", {})
    return Document(page_content=content, metadata=metadata)

async def ingest_members_from_backend(pipeline) -> int:
    """Lấy dữ liệu thành viên từ backend và thêm vào vector store"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.BACKEND_URL}/api/members", timeout=30)
            response.raise_for_status()
            members = response.json()
            
        docs = []
        for member in members:
            # Xây dựng văn bản mô tả thành viên
            full_name = member.get("full_name", "")
            birth_name = member.get("birth_name", "Không rõ")
            gen_branch = member.get("generation_in_branch", 0)
            birth_date = member.get("birth_date", "Không rõ")
            death_date = member.get("death_date")
            occupation = member.get("occupation", "Không rõ")
            
            content = f"Ông/Bà {full_name} (húy: {birth_name}), đời thứ {gen_branch} của chi (đời {gen_branch+8} của phái). "
            content += f"Sinh năm {birth_date}. "
            if death_date:
                content += f"Mất năm {death_date}. "
            content += f"Nghề nghiệp: {occupation}. "
            
            spouse = member.get("spouse")
            if spouse:
                content += f"Chồng/Vợ của: {spouse.get('full_name', '')}. "
                
            children = member.get("children", [])
            if children:
                child_names = [child.get("full_name", "") for child in children]
                content += f"Con cái: {', '.join(child_names)}."
                
            docs.append(Document(
                page_content=content,
                metadata={"type": "member", "member_id": member.get("id")}
            ))
            
        if docs:
            pipeline.add_documents(docs)
            
        return len(docs)
    except Exception as e:
        logger.error(f"Lỗi khi lấy dữ liệu từ backend: {e}")
        return 0
