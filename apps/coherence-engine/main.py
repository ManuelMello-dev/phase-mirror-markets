from fastapi import FastAPI, Query
from coherence_engine import analyze_fractal_coherence
from typing import List

app = FastAPI(
    title="Fractal Coherence Engine API",
    description="Analyzes market data across multiple scales using a Market EEG paradigm."
)

@app.get("/")
def read_root():
    return {"message": "Fractal Coherence Engine is running."}

@app.get("/coherence/report")
def get_coherence_report():
    """
    Generates the multi-scale fractal coherence report (Macro/Meso/Micro).
    """
    return analyze_fractal_coherence()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
