import os
import json
import aiofiles

NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY = "./lib/nhl_edge/json"

async def save_json_to_file(data, filename):
    try:
        directory = NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY
        if not os.path.exists(directory):
            os.makedirs(directory)

        path = f"{directory}/{filename}"
        async with aiofiles.open(path, 'w') as outfile:
            await outfile.write(json.dumps(data, indent=2))
    except Exception as e:
        print(f"An error occurred while saving {filename}: {e}")
