import unittest
import tempfile
import os
from unittest.mock import patch, MagicMock, mock_open
from fastapi.responses import FileResponse, HTMLResponse
from lib.qrcode.qrcode_generator import generate_qr_code_for_text, generate_qr_code_for_gameId, generate_qr_code_base64, generate_qr_code_html, generate_qr_code_for_download

class TestQRCodeGenerator(unittest.TestCase):

    def setUp(self):
        # Setup method
        self.sample_text = "Test Text"
        self.sample_gameId = "123456"
        self.mock_img = MagicMock()  # Mock image object

    @patch('qrcode.QRCode')
    def test_generate_qr_code_for_text(self, mock_qrcode):
        mock_qrcode.return_value.make_image.return_value = self.mock_img
        result = generate_qr_code_for_text(self.sample_text)
        self.assertIsNotNone(result)

    @patch('qrcode.QRCode')
    def test_generate_qr_code_for_gameId(self, mock_qrcode):
        mock_qrcode.return_value.make_image.return_value = self.mock_img
        result = generate_qr_code_for_gameId(self.sample_gameId)
        self.assertIsNotNone(result)

    @patch('qrcode.QRCode')
    def test_generate_qr_code_base64(self, mock_qrcode):
        mock_qrcode.return_value.make_image.return_value = self.mock_img
        result = generate_qr_code_base64(self.sample_gameId)
        self.assertIsNotNone(result)

    @patch('qrcode.QRCode')
    @patch('lib.qrcode.qrcode_generator.HTMLResponse', autospec=True)
    def test_generate_qr_code_html(self, mock_html_response, mock_qrcode):
        mock_qrcode.return_value.make_image.return_value = self.mock_img
        expected_html_content = """
        <html>
        <body>
            <h1>NHL Shot Chart QR Code</h1>
            <p>Game ID: 123456<br />Generated at 2023-11-10T15:26:45.265486</p>
            <img src="data:image/png;base64," alt="NHL Shot Chart QR Code">
        </body>
        </html>
        """
        mock_html_response.return_value = HTMLResponse(content=expected_html_content, status_code=200)
        result = generate_qr_code_html(self.sample_gameId)
        
        # Normalize and compare the response's body attribute to the expected HTML content
        expected_html_content = expected_html_content.strip().replace('\n', '').replace(' ', '')
        actual_html_content = result.body.decode().strip().replace('\n', '').replace(' ', '')
        
        self.assertEqual(actual_html_content, expected_html_content)

    @patch('qrcode.QRCode')
    @patch('lib.qrcode.qrcode_generator.FileResponse', autospec=True)
    def test_generate_qr_code_for_download(self, mock_file_response, mock_qrcode):
        mock_qrcode.QRCode().make_image.return_value = self.mock_img
        result = generate_qr_code_for_download(self.sample_gameId)
        mock_file_response.assert_called_once()
