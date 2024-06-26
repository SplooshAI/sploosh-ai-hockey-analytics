import aiohttp
import asyncio
import json
import os
from fastapi.responses import HTMLResponse
from ..utils.fetch import fetch_url
from ..utils.file_operations import save_json_to_file

# Please see the NHL Edge API documentation for URLs and endpoints that are available
# 🙏🏻 Shout-out to https://github.com/Zmalski/NHL-API-Reference for compiling NHL Edge API documentation
NHL_EDGE_BASE_API_GAMECENTER = "https://api-web.nhle.com/v1/gamecenter"

async def load_data_for_game_and_return_html(gameId: str, timezone: str = "UTC"):
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

        # Save the data to files
        # Check if running on Vercel and conditionally save the data to files
        if not os.getenv('VERCEL'):  # Check for the Vercel environment
            await asyncio.gather(
                save_json_to_file(landing_data, f"{gameId}-landing.json"),
                save_json_to_file(boxscore_data, f"{gameId}-boxscore.json"),
                save_json_to_file(play_by_play_data, f"{gameId}-play-by-play.json")
            )
  
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

async def load_data_for_game_and_timezone(gameId: str, timezone: str = "UTC"):
    urls = [
        f"{NHL_EDGE_BASE_API_GAMECENTER}/{gameId}/landing",
        f"{NHL_EDGE_BASE_API_GAMECENTER}/{gameId}/boxscore",
        f"{NHL_EDGE_BASE_API_GAMECENTER}/{gameId}/play-by-play"
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        # Unpack the results
        landing_data, boxscore_data, play_by_play_data = results

        # Build our response object
        data = {
            "landing_data": landing_data,
            "boxscore_data": boxscore_data,
            "play_by_play_data": play_by_play_data
        }

        # Save the data to files
        # Check if running on Vercel and conditionally save the data to files
        if not os.getenv('VERCEL'):  # Check for the Vercel environment
            await save_json_to_file(data, f"{gameId}-results.json")

        # Return the data as an object
        return data
