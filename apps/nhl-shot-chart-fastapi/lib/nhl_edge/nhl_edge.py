# lib/nhl_edge/nhl_edge.py

from fastapi.responses import HTMLResponse

def generate_html_response(gameId: str, timezone: str = "UTC"):
    # Multi-line HTML content with tabs before and after the arrow
    html_content = f"""
    <html>
        <body>
            <h1>Shot chart powered by NHL Edge</h1>
            <p>gameId &rarr; <strong>{gameId}</strong><br/>
            timezone &rarr; <strong>{timezone}</strong></p>
        </body>
    </html>
    """
    # Use the .replace() method to add tabs where necessary
    html_content = html_content.replace("&rarr;", "\t&rarr;\t")
    return HTMLResponse(content=html_content)
