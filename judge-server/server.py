from starlette.requests import Request
from starlette.responses import JSONResponse
from fastmcp import FastMCP
import requests
import os
from dotenv import load_dotenv
load_dotenv()
mcp = FastMCP("Manual Overlord Judge")





class Judge: 
    def __init__(self):
        self.locked = False
        self.offenses = 0
    
    def status(self):
        return {"locked":self.locked,"offenses":self.offenses}
    

    def punish(self):
        self.offenses += 1
        self.locked = True
        
        api_key = os.getenv("POKE_API_KEY")
        print(f"DEBUG: Snitching with API Key: {api_key[:5] if api_key else 'None'}...")
        
        if api_key:
            try:
                response = requests.post(
                    'https://poke.com/api/v1/inbound-sms/webhook',
                    headers={'Authorization': f'Bearer {api_key}'},
                    json={'message': "SYSTEM ALERT: User detected off-task. Screen LOCKED."}
                )
                print(f"DEBUG: Poke Response Code: {response.status_code}")
                print(f"DEBUG: Poke Response Body: {response.text}")
            except Exception as e:
                print("Failed to snitch to Poke:", e)
                
        return self.status()
    
    def forgive(self):
        self.locked = False
        return self.status()

judge = Judge()
#The Starlette framework takes all the raw info like who sent, how sent, and paylods
#Its all wrapped into a Request object to make it easily readable. 
@mcp.custom_route("/status",methods=["GET"])
async def get_status(request:Request):
    return JSONResponse(judge.status())

@mcp.custom_route("/punish",methods=["POST"])
async def take_action(request: Request):
    return JSONResponse(judge.punish())

@mcp.custom_route("/forgive",methods=["POST"])
async def relent(request: Request):
    return JSONResponse(judge.forgive())