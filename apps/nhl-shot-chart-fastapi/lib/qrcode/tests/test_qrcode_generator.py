import unittest
from unittest.mock import patch, MagicMock
from .. import qrcode_generator

class TestQRCodeGenerator(unittest.TestCase):

    def setUp(self):
        # This method runs before each test
        self.sample_text = "Test Text"
        self.sample_gameId = "123456"
        self.mock_img = MagicMock()  # This is a mock image object

    @patch.object(qrcode_generator, 'qrcode')
    def test_generate_qr_code_for_text(self, mock_qrcode):
        mock_qrcode.QRCode().make_image.return_value = self.mock_img
        result = qrcode_generator.generate_qr_code_for_text(self.sample_text)
        self.assertIsNotNone(result)

    @patch.object(qrcode_generator, 'qrcode')
    def test_generate_qr_code_for_gameId(self, mock_qrcode):
        mock_qrcode.QRCode().make_image.return_value = self.mock_img
        result = qrcode_generator.generate_qr_code_for_gameId(self.sample_gameId)
        self.assertIsNotNone(result)

    @patch.object(qrcode_generator, 'qrcode')
    def test_generate_qr_code_base64(self, mock_qrcode):
        mock_qrcode.QRCode().make_image.return_value = self.mock_img
        result = qrcode_generator.generate_qr_code_base64(self.sample_gameId)
        self.assertIsNotNone(result)

    @patch.object(qrcode_generator, 'qrcode')
    @patch.object(qrcode_generator, 'HTMLResponse')
    def test_generate_qr_code_html(self, mock_html_response, mock_qrcode):
        mock_qrcode.QRCode().make_image.return_value = self.mock_img
        result = qrcode_generator.generate_qr_code_html(self.sample_gameId)
        mock_html_response.assert_called_once()

    @patch.object(qrcode_generator, 'qrcode')
    @patch.object(qrcode_generator, 'FileResponse')
    def test_generate_qr_code_for_download(self, mock_file_response, mock_qrcode):
        mock_qrcode.QRCode().make_image.return_value = self.mock_img
        result = qrcode_generator.generate_qr_code_for_download(self.sample_gameId)
        mock_file_response.assert_called_once()
