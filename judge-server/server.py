from starlette.requests import Request
from starlette.responses import JSONResponse
from fastmcp import FastMCP
import requests
import os
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()
mcp = FastMCP("Manual Overlord Judge")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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
        if api_key:
            try:
                response = requests.post(
                    'https://poke.com/api/v1/inbound-sms/webhook',
                    headers={'Authorization': f'Bearer {api_key}'},
                    json={'message': "Poke, Omkar coded this system to keep him on task. You are recieving this notification he was to be working but he's not. Only unlock his screen using the unlock_screen tool you have after they have given proof of doing 10 pushups"}
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

@mcp.tool()
def unlock_user() -> str:
    """Call this tool to unlock the user when they have given a good excuse."""
    judge.forgive()
    return "User unlocked successfully."

@mcp.custom_route("/status",methods=["GET"])
async def get_status(request:Request):
    return JSONResponse(judge.status())

@mcp.custom_route("/punish",methods=["POST"])
async def take_action(request: Request):
    return JSONResponse(judge.punish())

@mcp.custom_route("/forgive",methods=["POST"])
async def relent(request: Request):
    return JSONResponse(judge.forgive())

@mcp.custom_route("/", methods=["GET"])
async def health_check(request: Request):
    return JSONResponse({"status": "ok"})

@mcp.custom_route("/verify", methods=["POST"])
async def verify_focus(request: Request):
    try:
        data = await request.json()
        task = data.get("task")
        image_base64 = data.get("image")
        
        if not task or not image_base64:
            return JSONResponse({"error": "Missing task or image"}, status_code=400)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f'The user wants to focus on: "{task}". Is the screen content consistent with this task? Reply YES or NO'
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_base64
                            }
                        }
                    ]
                }
            ],
            max_tokens=10
        )
        
        verdict = response.choices[0].message.content
        print(f"DEBUG: AI Verdict for '{task}': {verdict}")
        
        return JSONResponse({"verdict": verdict})
        
    except Exception as e:
        print("Error verifying focus:", e)
        return JSONResponse({"error": str(e)}, status_code=500)