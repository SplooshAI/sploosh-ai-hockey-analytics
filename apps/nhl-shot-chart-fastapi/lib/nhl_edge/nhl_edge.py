# lib/nhl_edge.py

from fastapi.responses import HTMLResponse

def generate_html_response():
    html_content = "<html><body><h1>COMING SOON: Shot chart powered by the NHL Edge API</h1></body></html>"
    return HTMLResponse(content=html_content)
