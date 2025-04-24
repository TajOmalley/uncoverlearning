import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
from typing import Annotated
from dotenv import load_dotenv
import io

# Load environment variables from .env file
load_dotenv()

# Import functions from your rag_pipeline.py file
# Make sure rag_pipeline.py is in the same directory or accessible in your Python path
try:
    from rag_pipeline import (
        process_document,
        generate_gemini_embedding,
        hybrid_search,
        format_prompt_with_context,
        generate_gemini_response,
        SUPABASE_URL,
        SUPABASE_KEY,
        GCP_BUCKET,
        gemini_api_key
    )
except ImportError:
    raise ImportError("Could not import functions from rag_pipeline.py. Ensure the file exists and is in the correct path.")

# Initialize FastAPI app
app = FastAPI()

# --- CORS Configuration ---
# Define the origins that are allowed to make requests to your backend.
# IMPORTANT: Replace the URL below with the actual URL(s) of your Vercel frontend deployment(s).
# If you have a custom domain, include that as well.
# If you are testing locally, you might add "http://localhost:3000" or whatever port your local frontend runs on.
# In production, AVOID using ["*"] as it allows *any* website to access your API, which is a security risk.
origins = [
    "https://uncoverlearning-deploy.vercel.app",
    # Add other Vercel deployment URLs or custom domains here if needed
    # "https://your-custom-domain.com",
    # "http://localhost:3000", # Example for local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # List of origins that are allowed to make requests
    allow_credentials=True,     # Allow cookies to be included in requests
    allow_methods=["*"],        # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],        # Allow all headers
)

# --- Configuration (can be moved to .env or config file) ---
# Get configuration from environment variables loaded by dotenv
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "files") # Default to 'files' if not set
GCP_DESTINATION_FOLDER = os.getenv("GCP_DESTINATION_FOLDER", "uploaded_docs") # Default folder in GCP
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000)) # Default chunk size
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004") # Default embedding model
GENERATION_MODEL = os.getenv("GENERATION_MODEL", "models/gemini-1.5-pro-latest") # Default generation model

# Hybrid Search Config (can also be in .env)
MATCH_COUNT = int(os.getenv("MATCH_COUNT", 10))
FULL_TEXT_WEIGHT = float(os.getenv("FULL_TEXT_WEIGHT", 1.0))
SEMANTIC_WEIGHT = float(os.getenv("SEMANTIC_WEIGHT", 1.0))
RRF_K = int(os.getenv("RRF_K", 50))

# --- API Endpoints ---

@app.post("/upload_document/")
async def upload_document(file: Annotated[UploadFile, File(description="PDF file to process")], original_name: Annotated[str, Form(description="Name to save the document as")]):
    """
    Uploads a PDF document, processes it (extracts text, chunks, embeds),
    and stores the data in Supabase and GCP.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Read file content
    file_content = await file.read()

    # Process the document using the pipeline function
    try:
        processing_output = process_document(
            buffer=file_content,
            original_name=original_name,
            supabase_table=SUPABASE_TABLE,
            supabase_url=SUPABASE_URL,
            supabase_key=SUPABASE_KEY,
            chunk_size=CHUNK_SIZE,
            destination=GCP_DESTINATION_FOLDER,
            model=EMBEDDING_MODEL,
            gemini_api_key=gemini_api_key
        )
        return JSONResponse(content={"message": "Document processed successfully", "details": processing_output})
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {e}")

@app.post("/query_document/")
async def query_document(query: Annotated[str, Form(description="User query")], file_title: Annotated[str, Form(description="Title of the document to query")]):
    """
    Performs a hybrid search on the specified document based on the user query
    and generates an answer using the RAG pipeline.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if not file_title:
         raise HTTPException(status_code=400, detail="Document title cannot be empty.")

    try:
        # Generate embedding for the user query
        query_embedding = generate_gemini_embedding(query, gemini_api_key)

        # Perform hybrid search in Supabase
        search_results = hybrid_search(
            supabase_url=SUPABASE_URL,
            supabase_key=SUPABASE_KEY,
            query=query,
            query_embedding=query_embedding,
            match_count=MATCH_COUNT,
            full_text_weight=FULL_TEXT_WEIGHT,
            semantic_weight=SEMANTIC_WEIGHT,
            rrf_k=RRF_K,
            file_title=file_title # Pass the specific file title for filtering
        )

        if not search_results:
             return JSONResponse(content={"answer": "Could not find relevant information in the specified document.", "chunks": []})


        # Format context for the generation model
        formatted_prompt = format_prompt_with_context(search_results, query)

        # Generate answer using the RAG model
        answer = generate_gemini_response(
            user_prompt=formatted_prompt,
            system_prompt="You are a helpful assistant that answers questions based on the provided document excerpts. If the information is not in the excerpts, state that you cannot answer based on the provided context.",
            gemini_api_key=gemini_api_key
        )

        # Optionally, return the chunks used for context as well
        return JSONResponse(content={"answer": answer, "chunks": search_results})

    except Exception as e:
        # Log the error for debugging
        print(f"Error during query processing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {e}")

@app.get("/")
async def read_root():
    return {"message": "RAG Pipeline Wrapper API is running."}
