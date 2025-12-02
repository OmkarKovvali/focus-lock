from fastmcp import FastMCP
import requests

mcp = FastMCP("Manual Overlord Judge")


class Judge: 
    def __init__(self):
        self.locked = False;
        self.offenses = 0;
    
    def status(self):
        return {"locked:":self.locked,"offenses:":self.offenses}
    
    def punish(self):
        self.offenses+=1
        self.locked = True
        return self.status()
    
    def forgive(self):
        self.locked = False
        return self.status()
