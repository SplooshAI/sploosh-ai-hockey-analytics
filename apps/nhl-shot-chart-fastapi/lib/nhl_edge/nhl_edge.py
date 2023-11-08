# nhl_edge.py

from fastapi.responses import HTMLResponse
import aiohttp
import asyncio
import json

# Define the base NHL Edge API URL as a constant
NHL_EDGE_BASE_API_GAMECENTER = "https://api-web.nhle.com/v1/gamecenter"

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.json()

async def load_data_for_game_and_timezone(gameId: str, timezone: str = "UTC"):
    # Use the base API URL constant and append the gameId and specific endpoint
    urls = [
        f"{NHL_EDGE_BASE_API_GAMECENTER}/{gameId}/landing",
        f"{NHL_EDGE_BASE_API_GAMECENTER}/{gameId}/boxscore",
        f"{NHL_EDGE_BASE_API_GAMECENTER}/{gameId}/play-by-play"
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        # Process the results if necessary
        landing_data, boxscore_data, play_by_play_data = results
        
        # The data is printed for debugging purposes
        # In a production environment, you might store this in a database or process it further
        print("Landing Data:", json.dumps(landing_data, indent=2))
        print("Boxscore Data:", json.dumps(boxscore_data, indent=2))
        print("Play-by-Play Data:", json.dumps(play_by_play_data, indent=2))

        # Generate HTML content with the game data and timezone
        html_content = f"""
        <html>
            <head>
                <title>NHL Data for Game {gameId}</title>
            </head>
            <body>
                <h1>NHL Data for Game <a href="https://www.nhl.com/gamecenter/{gameId}" target="_blank">{gameId}</a></h1>
                <p>Timezone: <strong>{timezone}</strong></p>
                <h2>Landing Data</h2>
                <pre>{json.dumps(landing_data, indent=2)}</pre>
                <h2>Boxscore Data</h2>
                <pre>{json.dumps(boxscore_data, indent=2)}</pre>
                <h2>Play-by-Play Data</h2>
                <pre>{json.dumps(play_by_play_data, indent=2)}</pre>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)
