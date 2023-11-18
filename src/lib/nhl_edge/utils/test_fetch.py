import pytest
from aiohttp import ClientSession
from aioresponses import aioresponses
from .fetch import fetch_url

@pytest.mark.asyncio
async def test_fetch_url_success():
    with aioresponses() as m:
        m.get('http://example.com', payload={"key": "value"})
        
        async with ClientSession() as session:
            result = await fetch_url(session, 'http://example.com')
            assert result == {"key": "value"}

@pytest.mark.asyncio
async def test_fetch_url_failure():
    with aioresponses() as m:
        m.get('http://example.com', exception=Exception("Error occurred"))
        
        async with ClientSession() as session:
            with pytest.raises(Exception) as excinfo:
                await fetch_url(session, 'http://example.com')
            assert "Error occurred" in str(excinfo.value)
