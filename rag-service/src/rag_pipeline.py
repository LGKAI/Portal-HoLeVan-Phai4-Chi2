import logging
from typing import List, Dict, AsyncGenerator
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain.prompts import PromptTemplate
from config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Bạn là trợ lý AI của dòng họ Lê Văn - Phái 4 - Chi 2, thôn An Lợi, xã Triệu Bình, tỉnh Quảng Trị.
Nhiệm vụ của bạn là giúp con cháu dòng họ tra cứu thông tin về:
- Phả hệ, thế thứ, các thành viên trong dòng họ
- Ngày giỗ, lễ kỵ của các bậc tiền nhân
- Lịch sử, nguồn gốc dòng họ và làng An Lợi
- Các quy ước, phong tục tập quán của dòng họ

Hãy trả lời dựa trên ngữ cảnh được cung cấp. Nếu không tìm thấy thông tin trong ngữ cảnh, hãy nói rõ là bạn không có thông tin về vấn đề đó.
Luôn trả lời bằng tiếng Việt, thân mật và tôn trọng.

Ngữ cảnh:
{context}

Lịch sử hội thoại:
{history}

Câu hỏi: {question}
Trả lời:"""

class RAGPipeline:
    def __init__(self):
        logger.info(f"Khởi tạo RAG Pipeline với model {settings.OLLAMA_LLM_MODEL}")
        self.embeddings = OllamaEmbeddings(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_EMBED_MODEL
        )
        self.vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings
        )
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})
        self.llm = Ollama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_LLM_MODEL,
            timeout=60
        )
        self.prompt = PromptTemplate(
            template=SYSTEM_PROMPT,
            input_variables=["context", "history", "question"]
        )

    def similarity_search(self, query: str, k: int = 5) -> List[Document]:
        """Tìm kiếm tài liệu liên quan trong vector store"""
        try:
            return self.vector_store.similarity_search(query, k=k)
        except Exception as e:
            logger.error(f"Lỗi khi tìm kiếm similarity: {e}")
            return []

    def add_documents(self, docs: List[Document]):
        """Thêm tài liệu vào vector store"""
        if not docs:
            return
        self.vector_store.add_documents(docs)
        logger.info(f"Đã thêm {len(docs)} tài liệu vào vector store")

    async def query(self, message: str, history: List[Dict] = None) -> AsyncGenerator[str, None]:
        """Truy vấn RAG Pipeline và trả về kết quả dưới dạng stream"""
        try:
            docs = self.similarity_search(message)
            context = "\n\n".join([doc.page_content for doc in docs]) if docs else ""
            
            history_str = ""
            if history:
                history_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in history[-5:]])

            final_prompt = self.prompt.format(
                context=context,
                history=history_str,
                question=message
            )

            async for chunk in self.llm.astream(final_prompt):
                yield chunk
                
        except Exception as e:
            logger.error(f"Lỗi khi query: {e}")
            yield f"Xin lỗi, đã có lỗi xảy ra: {str(e)}"
