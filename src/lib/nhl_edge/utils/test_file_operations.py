import json
import os
import pytest
from unittest.mock import patch
from .file_operations import save_json_to_file

@pytest.mark.asyncio
async def test_save_json_to_file_success(tmp_path):
    data = {'test': 'data'}
    filename = 'testfile.json'
    
    # Mock the NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY to use tmp_path
    with patch('src.lib.nhl_edge.utils.file_operations.NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY', str(tmp_path)):
        await save_json_to_file(data, filename)

        # Check if file is created and contains correct data
        saved_file = tmp_path / filename
        assert saved_file.exists()
        with open(saved_file, 'r') as f:
            assert json.load(f) == data

        # Remove all files in the directory
        for item in tmp_path.iterdir():
            if item.is_file():
                item.unlink()

        # Remove the directory itself
        os.rmdir(tmp_path)

        # Call save_json_to_file again to test directory creation
        await save_json_to_file(data, filename)
        assert saved_file.exists()

@pytest.mark.asyncio
async def test_save_json_to_file_error():
    # Test with invalid data to trigger an exception
    data = {'test': 'data'}
    filename = '/invalid/testfile.json'  # Invalid file path to trigger an error
    
    with patch('src.lib.nhl_edge.utils.file_operations.print') as mock_print:
        await save_json_to_file(data, filename)

        # Check if the exception is caught and print is called
        assert mock_print.called

# Add more test cases as needed
