from starlette.requests import Request
from starlette.responses import JSONResponse
from fastmcp import FastMCP
import requests

mcp = FastMCP("Manual Overlord Judge")





class Judge: 
    def __init__(self):
        self.locked = False
        self.offenses = 0
    
    def status(self):
        return {"locked":self.locked,"offenses":self.offenses}
    
    def punish(self):
        self.offenses+=1
        self.locked = True
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