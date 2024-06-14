from tw_utils.runtime import init_runtime
init_runtime()
from tw_utils.server import start_server
from fastapi import Request, Response, status
from tw_utils.logger import logger
from tw_utils.fastapi import get_app

# App init 
app = get_app()

# Startup for loading
@app.on_event("startup")
def load():
    global model_weights
    model_weights = "load everythings that should ve loaded before getting requests"

# Index for health check
@app.get("/", status_code=status.HTTP_200_OK)
def root(response: Response):
    logger.info("Root of service <service-id>")
    return {"INFO": "This is the health check of <service-id> service for <task>"}, 200, {'ContentType': 'text/html'}

# Post request example
@app.post("/predict")
async def predict_tcm(request: Request):
    response = {}
    request_data = await request.json()
    question = request_data["question"]
    response["predicted"] = f"{question} prediction"
    
    return response
if __name__ == "__main__":
    start_server()
