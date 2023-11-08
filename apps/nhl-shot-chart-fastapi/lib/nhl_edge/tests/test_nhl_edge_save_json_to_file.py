import json
import os
import pytest
from unittest import mock
from unittest.mock import MagicMock, patch
import aiofiles
from ..nhl_edge import save_json_to_file, NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY


class AsyncContextManagerMock(mock.MagicMock):
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        pass


@pytest.fixture
def mock_aiofiles_open():
    with patch('aiofiles.open', new_callable=lambda: AsyncContextManagerMock()) as mock_open:
        yield mock_open


@pytest.mark.asyncio
async def test_save_json_to_file_new_directory(mock_aiofiles_open):
    # Setup mock
    with patch("os.path.exists", return_value=False) as mock_exists, \
         patch("os.makedirs") as mock_makedirs:

        # Execute the function
        await save_json_to_file({"test": "data"}, "testfile.json")

        # Assertions to ensure directory is created and file is written
        mock_makedirs.assert_called_once_with(NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY)
        mock_aiofiles_open.assert_called_once_with(f"{NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY}/testfile.json", 'w')


@pytest.mark.asyncio
async def test_save_json_to_file_existing_directory(mock_aiofiles_open):
    # Setup mock
    with patch("os.path.exists", return_value=True) as mock_exists, \
         patch("os.makedirs") as mock_makedirs:

        # Execute the function
        await save_json_to_file({"test": "data"}, "testfile.json")

        # Assertions to ensure directory creation is skipped and file is written
        mock_makedirs.assert_not_called()
        mock_aiofiles_open.assert_called_once_with(f"{NHL_EDGE_RAW_JSON_LOCAL_DIRECTORY}/testfile.json", 'w')


@pytest.mark.asyncio
async def test_save_json_to_file_error_handling(mock_aiofiles_open, capfd):
    # Given side effect to mock to raise an Exception
    mock_aiofiles_open.side_effect = Exception("Test exception")

    # When calling the save_json_to_file function
    await save_json_to_file({"test": "data"}, "testfile.json")

    # Then the function should print an error message to stdout
    out, err = capfd.readouterr()
    assert "An error occurred while saving testfile.json: Test exception" in out
