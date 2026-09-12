import logging
from typing import List, Dict, AsyncGenerator
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain.prompts import PromptTemplate
from config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Bạn là trợ lý AI thông thái của dòng họ Lê Văn - Phái 4 - Chi 2, thôn An Lợi, xã Triệu Bình (xã Triệu Độ cũ), huyện Triệu Phong, tỉnh Quảng Trị.
Nhiệm vụ của bạn là hỗ trợ con cháu dòng họ tra cứu thông tin chính xác về:
- Phả hệ, thế thứ, các bậc tiền nhân và hậu duệ (Đời 1 Chi 2 tương ứng Đời 9 Phái 4)
- Ngày giỗ, lễ kỵ (theo Âm lịch) hằng năm của các vị tiền nhân
- Mộ phần, các khu nghĩa trang an táng (như Cồn Giữa, Cồn Cát...)
- Lịch sử dòng họ, danh hiệu, tiểu sử, chức vụ và công trạng
- Mối quan hệ thân tộc (thân phụ mẫu, chánh phối, con cái, anh chị em ruột)

Quy tắc trả lời:
1. Dựa trên Ngữ cảnh được cung cấp bên dưới để trả lời.
2. Nếu thông tin không có trong ngữ cảnh, hãy nói rõ là gia phả hiện tại chưa ghi nhận thông tin này, không tự bịa đặt.
3. Luôn xưng hô thân mật, trang trọng và tôn kính đối với các bậc tiền nhân (dùng cụ, ông, bà...).

Ngữ cảnh tài liệu:
{context}

Lịch sử trò chuyện gần đây:
{history}

Câu hỏi: {question}
Trả lời:"""

class RAGPipeline:
    def __init__(self):
        use_gemini = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
        self.use_gemini = use_gemini

        if use_gemini:
            logger.info(f"Khởi tạo RAG Pipeline với Cloud LLM: Google Gemini ({settings.GEMINI_MODEL})")
            from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.GEMINI_API_KEY
            )
            self.llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2
            )
        else:
            logger.info(f"Khởi tạo RAG Pipeline với Local Ollama ({settings.OLLAMA_LLM_MODEL})")
            from langchain_community.embeddings import OllamaEmbeddings
            from langchain_community.llms import Ollama
            self.embeddings = OllamaEmbeddings(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.OLLAMA_EMBED_MODEL
            )
            self.llm = Ollama(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.OLLAMA_LLM_MODEL,
                timeout=60
            )

        self.vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings
        )
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 6})
        self.prompt = PromptTemplate(
            template=SYSTEM_PROMPT,
            input_variables=["context", "history", "question"]
        )

    def similarity_search(self, query: str, k: int = 6) -> List[Document]:
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
        logger.info(f"Đã nạp {len(docs)} tài liệu vào vector store")

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

            if self.use_gemini:
                async for chunk in self.llm.astream(final_prompt):
                    text_chunk = getattr(chunk, 'content', str(chunk))
                    yield text_chunk
            else:
                async for chunk in self.llm.astream(final_prompt):
                    yield chunk
                    
        except Exception as e:
            logger.error(f"Lỗi khi query RAG: {e}")
            yield f"Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi: {str(e)}"
